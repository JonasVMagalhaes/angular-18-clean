import { Observable, isObservable, of, Subject } from 'rxjs';
import { bufferTime, mergeMap, filter, tap } from 'rxjs/operators';

/**
 * Interface de opções do decorator Batch
 */
export interface BatchOptions<T = any, R = any> {
  /**
   * Tempo em milissegundos para acumular itens antes de processar em lote
   */
  bufferTime: number;
  
  /**
   * Tamanho máximo do lote antes de forçar processamento
   * Se não fornecido, apenas o tempo será considerado
   */
  maxBatchSize?: number;
  
  /**
   * Função para processar o lote de itens
   * Se não fornecido, o método decorado receberá o lote completo
   */
  processBatch?: (items: T[]) => Observable<R[]> | Promise<R[]>;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Armazenamento compartilhado para os lotes
 */
const batchSubjects = new Map<string, Subject<any>>();
const batchResults = new Map<string, Observable<any>>();

/**
 * Decorator que implementa processamento em lote (batching).
 * Útil para otimizar chamadas de API agrupando múltiplas solicitações em uma única.
 * 
 * Características:
 * - Agrupa múltiplas chamadas individuais em um único lote
 * - Reduz o número de requisições à API/banco de dados
 * - Melhora a performance em cenários de alta frequência de chamadas
 * - Suporta limites de tempo e tamanho para processamento de lotes
 * 
 * @example
 * ```typescript
 * // Processamento em lote para carregar dados de usuários
 * @Batch<string, User>({
 *   bufferTime: 50, // 50ms para acumular chamadas
 *   maxBatchSize: 100, // No máximo 100 IDs por lote
 *   processBatch: (userIds) => {
 *     return this.http.post<User[]>('/api/users/batch', { ids: userIds });
 *   },
 *   debug: true
 * })
 * getUser(userId: string): Observable<User> {
 *   return this.http.get<User>(`/api/users/${userId}`);
 * }
 * ```
 * 
 * @param options Opções de configuração do processamento em lote
 */
export function Batch<T = any, R = T>(options: BatchOptions<T, R>) {
  const {
    bufferTime: bufferTimeValue,
    maxBatchSize,
    processBatch,
    debug = false
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${propertyKey}`;
    const batchKey = `${target.constructor.name}_${propertyKey}`;
    
    const log = (message: string) => {
      if (debug) {
        console.log(`[Batch:${methodName}] ${message}`);
      }
    };

    // Inicializa o subject para este método se não existir
    if (!batchSubjects.has(batchKey)) {
      const batchSubject = new Subject<{item: T, id: string}>();
      batchSubjects.set(batchKey, batchSubject);
      
      // Configura o pipeline de processamento em lote
      const batchedResult = batchSubject.pipe(
        bufferTime(bufferTimeValue, null, maxBatchSize),
        filter(batch => batch.length > 0),
        tap(batch => log(`Processando lote com ${batch.length} itens`)),
        mergeMap(async (batch) => {
          const items = batch.map(b => b.item);
          const itemIds = batch.map(b => b.id);
          
          try {
            // Processa o lote usando a função fornecida ou o método original
            let results: R[];
            if (processBatch) {
              const processResult = processBatch(items);
              results = processResult instanceof Promise 
                ? await processResult 
                : await processResult.toPromise();
            } else {
              // Usa o método original para processar o lote
              const result = originalMethod.call(target, items);
              results = result instanceof Promise 
                ? await result 
                : await result.toPromise();
            }
            
            // Mapeia os resultados de volta para os IDs originais
            return batch.map((b, index) => ({
              id: b.id,
              result: results[index]
            }));
          } catch (error) {
            log(`Erro ao processar lote: ${error}`);
            return batch.map(b => ({
              id: b.id,
              error
            }));
          }
        })
      );
      
      batchResults.set(batchKey, batchedResult);
      
      // Inicia a assinatura para processar os lotes
      batchedResult.subscribe();
    }

    descriptor.value = function (...args: any[]) {
      const item = args[0];
      const itemId = JSON.stringify(args);
      const batchSubject = batchSubjects.get(batchKey);
      
      log(`Item adicionado ao lote: ${itemId}`);
      batchSubject.next({item, id: itemId});
      
      // Retorna um observable que vai emitir o resultado quando o lote for processado
      return new Observable<R>((observer) => {
        const subscription = batchResults.get(batchKey).subscribe(
          (results) => {
            const result = results.find((r: {id: string, result?: R, error?: any}) => r.id === itemId);
            if (result) {
              if (result.error) {
                observer.error(result.error);
              } else {
                observer.next(result.result);
                observer.complete();
              }
            }
          },
          (error) => observer.error(error)
        );
        
        return () => subscription.unsubscribe();
      });
    };

    return descriptor;
  };
}
