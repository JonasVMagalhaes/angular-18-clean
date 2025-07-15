import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

interface RetryOptions {
  /**
   * Número máximo de tentativas
   */
  maxRetries?: number;
  
  /**
   * Intervalo inicial entre tentativas (ms)
   */
  initialInterval?: number;
  
  /**
   * Fator de multiplicação para backoff exponencial
   */
  backoffFactor?: number;
  
  /**
   * Tempo máximo entre tentativas (ms)
   */
  maxInterval?: number;
  
  /**
   * Função para filtrar quais erros devem ser retentados
   */
  shouldRetry?: (error: any) => boolean;
  
  /**
   * Se true, exibe logs de tentativas
   */
  logRetry?: boolean;
}

/**
 * Decorador que implementa retry com backoff exponencial para operações
 * que podem falhar temporariamente (como chamadas de rede)
 * 
 * @example
 * // Configuração básica (3 tentativas)
 * @Retry()
 * public fetchRemoteData(): Observable<RemoteData> {
 *   return this.http.get<RemoteData>('/api/data');
 * }
 * 
 * @example
 * // Configuração avançada
 * @Retry({
 *   maxRetries: 5,
 *   initialInterval: 1000,
 *   backoffFactor: 2,
 *   maxInterval: 30000,
 *   shouldRetry: (err) => err.status === 429 || err.status === 503,
 *   logRetry: true
 * })
 * public synchronizeData(): Observable<SyncResult> {
 *   return this.syncService.startSync();
 * }
 */
export function Retry(options: RetryOptions = {}) {
  const {
    maxRetries = 3,
    initialInterval = 1000,
    backoffFactor = 2,
    maxInterval = 30000,
    shouldRetry = () => true,
    logRetry = false
  } = options;
  
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${propertyKey}`;
    
    descriptor.value = function(...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (result instanceof Observable) {
        return result.pipe(
          retryWhen(errors => errors.pipe(
            mergeMap((error, attempt) => {
              // Verificar se devemos tentar novamente
              if (!shouldRetry(error) || attempt >= maxRetries) {
                if (logRetry && attempt >= maxRetries) {
                  console.error(`🔄 ${methodName} falhou após ${maxRetries} tentativas`);
                }
                return throwError(() => error);
              }
              
              // Calcular o tempo de espera com backoff exponencial
              const delay = Math.min(
                initialInterval * Math.pow(backoffFactor, attempt),
                maxInterval
              );
              
              if (logRetry) {
                console.warn(`🔄 ${methodName} - tentativa ${attempt + 1}/${maxRetries} após ${delay}ms - Erro: ${error.message || error}`);
              }
              
              return timer(delay);
            })
          ))
        );
      }
      
      return result;
    };
    
    return descriptor;
  };
}
