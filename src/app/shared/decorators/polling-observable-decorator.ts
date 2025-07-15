import { Observable, isObservable, from, timer, Subject, of, throwError } from 'rxjs';
import { switchMap, takeUntil, catchError, finalize, tap, takeWhile } from 'rxjs/operators';

/**
 * Interface para opções do decorator PollingObservable
 */
export interface PollingObservableOptions<T = any> {
  /**
   * Intervalo entre consultas em milissegundos
   * Por padrão é 5000 (5 segundos)
   */
  interval?: number;
  
  /**
   * Tempo máximo total de polling em milissegundos
   * Por padrão não há limite (continuará até ser cancelado)
   */
  maxDuration?: number;
  
  /**
   * Número máximo de tentativas
   * Por padrão não há limite
   */
  maxAttempts?: number;
  
  /**
   * Função de predicado que determina quando parar o polling
   * Se retornar true, o polling para
   */
  stopPredicate?: (value: T) => boolean;
  
  /**
   * Função chamada a cada nova tentativa
   */
  onAttempt?: (attempt: number, value: T | null) => void;
  
  /**
   * Função chamada quando o polling é concluído
   */
  onComplete?: (finalValue: T | null, reason: 'predicate' | 'max_attempts' | 'max_duration' | 'error' | 'cancelled') => void;
  
  /**
   * Se deve continuar mesmo após erros
   * Por padrão é true
   */
  continueOnError?: boolean;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que implementa uma estratégia de polling automático,
 * repetindo a chamada em intervalos configuráveis até que uma condição seja atendida.
 * 
 * Características:
 * - Repete automaticamente chamadas em intervalos definidos
 * - Suporta condições de parada personalizáveis
 * - Controla duração máxima e número de tentativas
 * - Notifica sobre tentativas e conclusão
 * - Gerencia erros sem interromper o polling
 * 
 * @example
 * ```typescript
 * // Polling básico a cada 5 segundos
 * @PollingObservable()
 * checkJobStatus(jobId: string): Observable<JobStatus> {
 *   return this.http.get<JobStatus>(`/api/jobs/${jobId}/status`);
 * }
 * 
 * // Polling avançado com condição de parada
 * @PollingObservable({
 *   interval: 2000,
 *   maxDuration: 3 * 60 * 1000, // 3 minutos
 *   maxAttempts: 30,
 *   stopPredicate: (status) => status.state === 'completed' || status.state === 'failed',
 *   onAttempt: (attempt, status) => this.updateProgress(status?.progress || 0),
 *   onComplete: (final, reason) => {
 *     if (reason === 'predicate' && final?.state === 'completed') {
 *       this.notifySuccess('Processo concluído com sucesso!');
 *     } else {
 *       this.notifyError('Tempo limite excedido');
 *     }
 *   }
 * })
 * monitorProcessExecution(processId: string): Observable<ProcessStatus> {
 *   return this.http.get<ProcessStatus>(`/api/processes/${processId}`);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function PollingObservable<T = any>(options: PollingObservableOptions<T> = {}) {
  const {
    interval = 5000,
    maxDuration,
    maxAttempts,
    stopPredicate,
    onAttempt,
    onComplete,
    continueOnError = true,
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
        console.log(`[PollingObservable:${methodName}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      const startTime = Date.now();
      let attemptCount = 0;
      let lastValue: T | null = null;
      
      // Subject para controle de cancelamento
      const stop$ = new Subject<void>();
      
      // Configura timeout para duração máxima se definido
      if (maxDuration) {
        timer(maxDuration).pipe(
          takeUntil(stop$)
        ).subscribe(() => {
          log(`Duração máxima de ${maxDuration}ms atingida`);
          stop$.next();
          stop$.complete();
          
          if (onComplete) {
            onComplete(lastValue, 'max_duration');
          }
        });
      }
      
      log(`Iniciando polling a cada ${interval}ms`);
      
      // Criar o observable de polling
      return timer(0, interval).pipe(
        takeUntil(stop$),
        
        // Limita o número de tentativas se definido
        takeWhile(() => {
          if (maxAttempts && attemptCount >= maxAttempts) {
            log(`Número máximo de tentativas (${maxAttempts}) atingido`);
            
            if (onComplete) {
              onComplete(lastValue, 'max_attempts');
            }
            
            return false;
          }
          return true;
        }),
        
        // Executa o método original
        switchMap(() => {
          attemptCount++;
          log(`Executando tentativa #${attemptCount}`);
          
          try {
            const result = originalMethod.apply(this, args);
            
            if (isObservable(result)) {
              return result;
            } else if (result instanceof Promise) {
              return from(result);
            } else {
              return of(result);
            }
          } catch (error) {
            log(`Erro ao executar método: ${error.message || error}`);
            return continueOnError ? of(null as any) : throwError(error);
          }
        }),
        
        tap({
          next: (value: T) => {
            lastValue = value;
            
            if (onAttempt) {
              onAttempt(attemptCount, value);
            }
            
            // Verifica se o predicado de parada retorna true
            if (stopPredicate && value && stopPredicate(value)) {
              log('Predicado de parada retornou true, finalizando polling');
              
              if (onComplete) {
                onComplete(value, 'predicate');
              }
              
              stop$.next();
              stop$.complete();
            }
          },
          error: (err) => {
            log(`Erro durante polling: ${err.message || err}`);
            
            if (onComplete) {
              onComplete(lastValue, 'error');
            }
          }
        }),
        
        catchError(err => {
          if (continueOnError) {
            log('Erro capturado, continuando polling');
            return of(null as any);
          } else {
            return throwError(err);
          }
        }),
        
        finalize(() => {
          log(`Polling finalizado após ${Date.now() - startTime}ms e ${attemptCount} tentativas`);
          
          if (!stop$.closed) {
            stop$.next();
            stop$.complete();
          }
        })
      );
    };

    return descriptor;
  };
}
