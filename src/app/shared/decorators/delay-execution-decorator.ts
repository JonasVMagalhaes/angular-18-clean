import { Observable, isObservable, timer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';

/**
 * Interface de opções do decorator DelayExecution
 */
export interface DelayExecutionOptions {
  /**
   * Tempo de atraso em milissegundos ou uma função que retorna o tempo de atraso
   */
  delay: number | ((args: any[]) => number);
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que adiciona um atraso à execução de um Observable.
 * 
 * Características:
 * - Adiciona um atraso configurável antes de emitir valores
 * - Suporta atraso estático ou dinâmico baseado em argumentos
 * - Útil para simulações, animações ou gerenciamento de carga
 * - Pode ser usado para evitar sobrecarga de requisições
 * 
 * @example
 * ```typescript
 * // Atraso fixo de 500ms
 * @DelayExecution({ delay: 500 })
 * getNotifications(): Observable<Notification[]> {
 *   return this.notificationService.getAll();
 * }
 * 
 * // Atraso dinâmico baseado nos argumentos
 * @DelayExecution({
 *   delay: (args) => args[0].priority === 'high' ? 0 : 1000,
 *   debug: true
 * })
 * processTask(task: Task): Observable<TaskResult> {
 *   return this.taskProcessor.process(task);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function DelayExecution(options: DelayExecutionOptions) {
  const {
    delay,
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
        console.log(`[DelayExecution:${methodName}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (isObservable(result)) {
        const delayTime = typeof delay === 'function' ? delay(args) : delay;
        
        log(`Aplicando atraso de ${delayTime}ms`);
        
        return result.pipe(
          delayWhen(() => timer(delayTime))
        );
      }
      
      return result;
    };

    return descriptor;
  };
}
