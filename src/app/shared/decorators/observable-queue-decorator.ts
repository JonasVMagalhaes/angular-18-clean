import { Observable, Subject, Subscription, from, isObservable, of } from 'rxjs';
import { concatMap, finalize, tap } from 'rxjs/operators';

/**
 * Interface para opções do decorator ObservableQueue
 */
export interface ObservableQueueOptions {
  /**
   * Identificador da fila para agrupar operações
   * (por padrão usa o nome do método)
   */
  queueId?: string;
  
  /**
   * Mostra notificação quando uma operação é enfileirada
   */
  showQueueNotification?: boolean;
  
  /**
   * Função de notificação quando uma operação é enfileirada
   * @param queueLength Tamanho atual da fila
   */
  onEnqueue?: (queueLength: number) => void;
  
  /**
   * Função de notificação quando uma operação inicia execução
   */
  onStart?: (args: any[]) => void;
  
  /**
   * Função de notificação quando uma operação é concluída
   */
  onFinish?: (result: any) => void;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Armazenamento de filas por ID
 */
const queueStorage = new Map<string, Subject<{
  fn: (...args: any[]) => Observable<any> | Promise<any>;
  args: any[];
  observer: { next: (value: any) => void; error: (err: any) => void; complete: () => void };
}>>();

/**
 * Decorator que serializa a execução de observables, garantindo que apenas um seja
 * executado por vez dentro de uma fila específica, enfileirando os demais.
 * 
 * Características:
 * - Evita execução paralela de operações que devem ser serializadas
 * - Garante ordem de execução FIFO (First In, First Out)
 * - Mantém o contexto e parâmetros de cada chamada
 * - Notifica sobre estado da fila e progresso
 * - Adequado para operações de gravação sequenciais ou que devem respeitar ordem
 * 
 * @example
 * ```typescript
 * // Fila padrão baseada no nome do método
 * @ObservableQueue()
 * saveDocument(doc: Document): Observable<SaveResult> {
 *   return this.http.post<SaveResult>('/api/documents', doc);
 * }
 * 
 * // Fila com ID específico e notificações
 * @ObservableQueue({
 *   queueId: 'user-operations',
 *   showQueueNotification: true,
 *   onEnqueue: (length) => this.notifyUser(`${length} operações pendentes`),
 *   onStart: () => this.showLoading(),
 *   onFinish: () => this.hideLoading()
 * })
 * updateUserProfile(userId: string, data: ProfileData): Observable<User> {
 *   return this.http.put<User>(`/api/users/${userId}`, data);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function ObservableQueue(options: ObservableQueueOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${propertyKey}`;
    const queueId = options.queueId || methodName;
    
    const debug = options.debug === true;
    const log = (message: string) => {
      if (debug) {
        console.log(`[ObservableQueue:${queueId}] ${message}`);
      }
    };

    // Inicializa a fila se não existir
    if (!queueStorage.has(queueId)) {
      const queue = new Subject<{
        fn: (...args: any[]) => Observable<any> | Promise<any>;
        args: any[];
        observer: { next: (value: any) => void; error: (err: any) => void; complete: () => void };
      }>();
      
      // Assinatura para processar a fila
      queue.pipe(
        concatMap(item => {
          log(`Executando item da fila com args: ${JSON.stringify(item.args)}`);
          
          if (options.onStart) {
            options.onStart(item.args);
          }
          
          try {
            const result = item.fn.apply(null, item.args);
            
            // Processa o resultado com base no tipo
            if (isObservable(result)) {
              return result.pipe(
                tap({
                  next: (value) => {
                    item.observer.next(value);
                    if (options.onFinish) {
                      options.onFinish(value);
                    }
                  },
                  error: (err) => {
                    item.observer.error(err);
                    log(`Erro na execução: ${err.message || err}`);
                  },
                  complete: () => item.observer.complete()
                }),
                finalize(() => log('Item da fila processado'))
              );
            } else if (result instanceof Promise) {
              return from(result).pipe(
                tap({
                  next: (value) => {
                    item.observer.next(value);
                    if (options.onFinish) {
                      options.onFinish(value);
                    }
                  },
                  error: (err) => {
                    item.observer.error(err);
                    log(`Erro na execução: ${err.message || err}`);
                  },
                  complete: () => item.observer.complete()
                }),
                finalize(() => log('Item da fila processado'))
              );
            } else {
              // Para valores síncronos
              item.observer.next(result);
              item.observer.complete();
              if (options.onFinish) {
                options.onFinish(result);
              }
              return of(result);
            }
          } catch (err) {
            log(`Exceção capturada: ${err.message || err}`);
            item.observer.error(err);
            return of(null);
          }
        })
      ).subscribe();
      
      queueStorage.set(queueId, queue);
      log(`Fila "${queueId}" inicializada`);
    }
    
    descriptor.value = function (...args: any[]) {
      const queue = queueStorage.get(queueId)!;
      const queueSize = getQueueSize(queue);
      
      log(`Enfileirando chamada com ${args.length} argumentos (tamanho atual: ${queueSize})`);
      
      if (options.showQueueNotification && queueSize > 0) {
        if (options.onEnqueue) {
          options.onEnqueue(queueSize + 1); // +1 incluindo o atual
        }
      }
      
      return new Observable(observer => {
        // Adiciona o item à fila
        queue.next({
          fn: originalMethod.bind(this),
          args,
          observer
        });
        
        // Retorna uma função de limpeza para cancelar a operação se o Observable for cancelado
        return () => {
          log('Assinatura cancelada');
        };
      });
    };
    
    return descriptor;
  };
}

/**
 * Função auxiliar para estimar o tamanho atual de uma fila
 */
function getQueueSize(queue: Subject<any>): number {
  // Esta é uma aproximação, já que não podemos acessar a fila interna diretamente
  return queue.observers.length;
}
