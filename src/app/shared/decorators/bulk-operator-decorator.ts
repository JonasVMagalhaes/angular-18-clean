import { Observable, isObservable, from, of, Subject } from 'rxjs';
import { finalize, mergeMap, tap, switchMap, take, toArray } from 'rxjs/operators';

/**
 * Interface para opções do decorator BulkOperator
 */
export interface BulkOperatorOptions<T = any, R = any> {
  /**
   * Função para extrair o ID ou chave única do item
   * Por padrão usa o próprio item
   */
  keySelector?: (item: T) => string | number;
  
  /**
   * Número máximo de itens por lote
   * Por padrão é 10
   */
  batchSize?: number;
  
  /**
   * Se as operações devem ser executadas em paralelo dentro do lote
   * Por padrão é true
   */
  parallel?: boolean;
  
  /**
   * Número máximo de operações paralelas quando parallel=true
   * Por padrão é 3
   */
  maxConcurrent?: number;
  
  /**
   * Função para transformar os resultados individuais antes de retornar
   */
  resultTransformer?: (results: R[], originalItems: T[]) => any;
  
  /**
   * Callback que é executado no início do processamento do lote
   */
  onBatchStart?: (items: T[], batchIndex: number) => void;
  
  /**
   * Callback que é executado no fim do processamento do lote
   */
  onBatchComplete?: (results: R[], batchIndex: number) => void;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que aplica processamento em lote para operações com coleções,
 * dividindo automaticamente conjuntos grandes de dados em lotes menores.
 * 
 * Características:
 * - Divide grandes conjuntos de dados em lotes gerenciáveis
 * - Controla concorrência para evitar sobrecarga
 * - Suporta processamento serial ou paralelo
 * - Rastreia progresso por lote
 * - Transforma e agrega resultados
 * 
 * @example
 * ```typescript
 * // Processamento básico em lotes de 50 itens
 * @BulkOperator({
 *   batchSize: 50
 * })
 * saveEmployees(employees: Employee[]): Observable<SaveResult[]> {
 *   return this.http.post<SaveResult[]>('/api/employees/batch', employees);
 * }
 * 
 * // Processamento avançado com transformação e controle de concorrência
 * @BulkOperator({
 *   keySelector: (user) => user.id,
 *   batchSize: 20,
 *   parallel: true,
 *   maxConcurrent: 3,
 *   resultTransformer: (results, originalItems) => ({
 *     successCount: results.filter(r => r.success).length,
 *     failureCount: results.filter(r => !r.success).length,
 *     items: results
 *   }),
 *   onBatchStart: (items, index) => console.log(`Processando lote ${index + 1}...`),
 *   onBatchComplete: (results, index) => console.log(`Lote ${index + 1} concluído`)
 * })
 * syncUserProfiles(users: UserProfile[]): Observable<SyncResult[]> {
 *   // Este método será chamado para cada item individual
 *   return this.http.put<SyncResult>('/api/users/sync', users);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function BulkOperator<T = any, R = any>(options: BulkOperatorOptions<T, R> = {}) {
  const {
    keySelector = (item: T) => item as any,
    batchSize = 10,
    parallel = true,
    maxConcurrent = 3,
    resultTransformer,
    onBatchStart,
    onBatchComplete,
    debug = false
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${propertyKey}`;
    
    const log = (message: string) => {
      if (debug) {
        console.log(`[BulkOperator:${methodName}] ${message}`);
      }
    };

    descriptor.value = function (items: T[], ...restArgs: any[]) {
      if (!Array.isArray(items) || items.length === 0) {
        log('Nenhum item para processar, retornando vazio');
        return of([]);
      }
      
      // Divide os itens em lotes
      const batches: T[][] = [];
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }
      
      log(`Dividido em ${batches.length} lotes de até ${batchSize} itens cada`);
      
      // Processa os lotes
      const results$ = new Subject<R[]>();
      const allResults: R[] = [];
      
      // Função para processar um lote
      const processBatch = (batch: T[], batchIndex: number) => {
        log(`Processando lote ${batchIndex + 1}/${batches.length}`);
        
        if (onBatchStart) {
          onBatchStart(batch, batchIndex);
        }
        
        // Mapeia cada item para uma chamada do método original
        const batchOperations$: Observable<R>[] = batch.map(item => {
          try {
            const result = originalMethod.call(this, [item], ...restArgs);
            
            if (isObservable(result)) {
              return result;
            } else if (result instanceof Promise) {
              return from(result);
            } else {
              return of(result);
            }
          } catch (error) {
            log(`Erro ao processar item: ${error.message || error}`);
            return of(null as any);
          }
        });
        
        // Executa as operações em paralelo ou em série
        const execution$ = parallel
          ? from(batchOperations$).pipe(
              mergeMap(operation$ => operation$, maxConcurrent),
              toArray()
            )
          : from(batchOperations$).pipe(
              mergeMap(operation$ => operation$, 1),
              toArray()
            );
        
        return execution$.pipe(
          tap(batchResults => {
            allResults.push(...batchResults);
            
            if (onBatchComplete) {
              onBatchComplete(batchResults, batchIndex);
            }
            
            // Emite resultados parciais
            results$.next(allResults.slice());
          }),
          finalize(() => {
            log(`Lote ${batchIndex + 1} finalizado`);
          })
        );
      };
      
      // Processa cada lote em sequência
      from(batches).pipe(
        mergeMap((batch, index) => processBatch(batch, index), 1),
        finalize(() => {
          log('Todos os lotes processados');
          results$.complete();
        })
      ).subscribe();
      
      // Retorna um Observable que emite uma vez quando todos os lotes são concluídos
      return results$.pipe(
        take(batches.length),
        switchMap(() => {
          // Aplica transformação final se fornecida
          const finalResults = resultTransformer 
            ? resultTransformer(allResults, items) 
            : allResults;
          
          return of(finalResults);
        })
      );
    };

    return descriptor;
  };
}
