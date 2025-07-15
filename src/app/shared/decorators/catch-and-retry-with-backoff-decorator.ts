import { Observable, isObservable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, mergeMap } from 'rxjs/operators';

/**
 * Interface para opções do decorator CatchAndRetryWithBackoff
 */
export interface CatchAndRetryWithBackoffOptions {
  /**
   * Número máximo de tentativas
   * Por padrão é 3
   */
  maxRetries?: number;
  
  /**
   * Tempo inicial de espera em ms
   * Por padrão é 1000 (1 segundo)
   */
  initialDelay?: number;
  
  /**
   * Fator de multiplicação para backoff exponencial
   * Por padrão é 2
   */
  backoffFactor?: number;
  
  /**
   * Tempo máximo de espera entre tentativas em ms
   * Por padrão é 30000 (30 segundos)
   */
  maxDelay?: number;
  
  /**
   * Lista de códigos de erro HTTP que devem acionar a retentativa
   * Por padrão inclui 408, 429, 500, 502, 503, 504
   */
  retryStatusCodes?: number[];

  /**
   * Valor a retornar em caso de falha após todas as tentativas
   */
  fallbackValue?: any;
  
  /**
   * Callback a ser executado antes de cada nova tentativa
   */
  onRetry?: (error: any, retryCount: number) => void;
  
  /**
   * Callback a ser executado quando todas as tentativas falharem
   */
  onFailed?: (error: any, retryCount: number) => void;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que implementa estratégia de retry com backoff exponencial para
 * tratar falhas transitórias em chamadas HTTP ou outras operações assíncronas.
 * 
 * Características:
 * - Implementa backoff exponencial para evitar sobrecarga do serviço
 * - Configura número máximo de tentativas e tempos de espera
 * - Permite filtrar quais erros devem ou não ser retentados
 * - Provê callbacks para monitorar as tentativas
 * - Opção de fallback para resiliência
 * 
 * @example
 * ```typescript
 * // Configuração básica
 * @CatchAndRetryWithBackoff()
 * fetchData(): Observable<Data> {
 *   return this.http.get<Data>('/api/data');
 * }
 * 
 * // Configuração avançada
 * @CatchAndRetryWithBackoff({
 *   maxRetries: 5,
 *   initialDelay: 500,
 *   backoffFactor: 1.5,
 *   maxDelay: 10000,
 *   retryStatusCodes: [408, 429, 500, 502, 503, 504],
 *   fallbackValue: { data: [] },
 *   onRetry: (err, count) => this.notifyUser(`Tentativa ${count} falhou, tentando novamente...`),
 *   onFailed: (err) => this.notifyUser('Serviço indisponível no momento, tente novamente mais tarde')
 * })
 * importantApiCall(): Observable<ApiResponse> {
 *   return this.http.post<ApiResponse>('/api/critical-operation', data);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function CatchAndRetryWithBackoff(options: CatchAndRetryWithBackoffOptions = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffFactor = 2,
    maxDelay = 30000,
    retryStatusCodes = [408, 429, 500, 502, 503, 504],
    fallbackValue,
    onRetry,
    onFailed,
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
        console.log(`[CatchAndRetryWithBackoff:${methodName}] ${message}`);
      }
    };

    // Função para determinar se um erro deve ser retentado
    const shouldRetry = (error: any): boolean => {
      // Para erros HTTP
      if (error.status && retryStatusCodes.includes(error.status)) {
        log(`Erro HTTP ${error.status} é retentável`);
        return true;
      }
      
      // Para erros de rede (offline, connection reset, etc)
      if (error instanceof TypeError && error.message.includes('network')) {
        log('Erro de rede é retentável');
        return true;
      }
      
      // Para outros erros específicos da aplicação, pode-se adicionar lógica aqui
      
      log(`Erro não é retentável: ${error.message || error}`);
      return false;
    };

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (!isObservable(result)) {
        return result;
      }

      return result.pipe(
        retryWhen(errors => errors.pipe(
          mergeMap((error, index) => {
            const retryCount = index + 1;
            
            // Verifica se deve continuar tentando
            if (!shouldRetry(error) || retryCount > maxRetries) {
              log(`Não vai mais tentar. Tentativas: ${retryCount}, Erro: ${error.message || error}`);
              
              if (onFailed) {
                onFailed(error, retryCount);
              }
              
              return throwError(error);
            }
            
            // Calcula o tempo de espera com backoff exponencial
            const delay = Math.min(initialDelay * Math.pow(backoffFactor, index), maxDelay);
            log(`Tentativa ${retryCount}/${maxRetries} falhou. Tentando novamente em ${delay}ms`);
            
            if (onRetry) {
              onRetry(error, retryCount);
            }
            
            return timer(delay);
          })
        )),
        catchError(error => {
          log(`Todas as tentativas falharam: ${error.message || error}`);
          
          if (fallbackValue !== undefined) {
            log(`Retornando valor de fallback`);
            return new Observable(subscriber => {
              subscriber.next(fallbackValue);
              subscriber.complete();
            });
          }
          
          return throwError(error);
        })
      );
    };

    return descriptor;
  };
}
