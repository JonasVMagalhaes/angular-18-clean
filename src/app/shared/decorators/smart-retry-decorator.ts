import { Observable, isObservable, throwError, timer, of, from } from 'rxjs';
import { retryWhen, mergeMap, finalize, catchError, tap } from 'rxjs/operators';

/**
 * Tipos de estratégia de retry
 */
export type RetryStrategy = 
  | 'immediate'       // Tenta novamente imediatamente
  | 'fixed-delay'     // Espera um tempo fixo entre tentativas
  | 'exponential'     // Backoff exponencial (2^n * delay)
  | 'fibonacci'       // Backoff fibonacci (sequência fibonacci * delay)
  | 'random'          // Delay aleatório entre min e max
  | 'incremental';    // Incrementa o delay a cada tentativa

/**
 * Interface para opções do decorator SmartRetry
 */
export interface SmartRetryOptions {
  /**
   * Número máximo de tentativas
   */
  maxRetries: number;
  
  /**
   * Estratégia de retry a ser usada
   */
  strategy: RetryStrategy;
  
  /**
   * Delay inicial em ms (usado por todas as estratégias exceto 'immediate')
   */
  initialDelay?: number;
  
  /**
   * Delay máximo em ms (usado para limitar exponential/fibonacci)
   */
  maxDelay?: number;
  
  /**
   * Fator de incremento para estratégia 'incremental'
   */
  increment?: number;
  
  /**
   * Função para determinar se um erro deve ser retentado
   */
  retryPredicate?: (error: any, retryCount: number) => boolean;
  
  /**
   * Códigos HTTP que devem ser retentados
   * Padrão: [408, 429, 500, 502, 503, 504]
   */
  retryStatusCodes?: number[];
  
  /**
   * Valor a retornar quando todas as tentativas falharem
   */
  fallbackValue?: any;
  
  /**
   * Callback antes de cada tentativa
   */
  beforeRetry?: (error: any, retryCount: number, delayTime: number) => void;
  
  /**
   * Callback quando todas as tentativas falharem
   */
  onFailure?: (error: any, totalRetries: number) => void;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que implementa estratégias avançadas de retry para Observable,
 * com suporte a diferentes algoritmos de espera e políticas de recuperação.
 * 
 * Características:
 * - Múltiplas estratégias de retry (imediata, fixa, exponencial, fibonacci, aleatória, incremental)
 * - Filtragem inteligente de erros retentáveis
 * - Callbacks para monitoramento e intervenção
 * - Valores de fallback para resiliência
 * - Políticas configuráveis de delay e limites
 * 
 * @example
 * ```typescript
 * // Retry simples com estratégia de backoff exponencial
 * @SmartRetry({
 *   maxRetries: 3,
 *   strategy: 'exponential',
 *   initialDelay: 1000,
 *   maxDelay: 10000
 * })
 * getData(): Observable<Data[]> {
 *   return this.http.get<Data[]>('/api/data');
 * }
 * 
 * // Retry avançado com predicados e callbacks
 * @SmartRetry({
 *   maxRetries: 5,
 *   strategy: 'fibonacci',
 *   initialDelay: 500,
 *   maxDelay: 30000,
 *   retryStatusCodes: [429, 503],
 *   retryPredicate: (err) => err.message.includes('timeout'),
 *   beforeRetry: (err, count, delay) => {
 *     this.notificationService.info(`Tentativa ${count} falhou. Tentando novamente em ${delay}ms...`);
 *     this.logService.warn('Retry', { error: err.message, attempt: count });
 *   },
 *   onFailure: () => this.notificationService.error('Serviço indisponível. Tente novamente mais tarde.'),
 *   fallbackValue: { empty: true, reason: 'service_unavailable' }
 * })
 * importantOperation(): Observable<OperationResult> {
 *   return this.operationService.execute();
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function SmartRetry(options: SmartRetryOptions) {
  const {
    maxRetries,
    strategy,
    initialDelay = 1000,
    maxDelay = 30000,
    increment = 1000,
    retryStatusCodes = [408, 429, 500, 502, 503, 504],
    retryPredicate,
    fallbackValue,
    beforeRetry,
    onFailure,
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
        console.log(`[SmartRetry:${methodName}] ${message}`);
      }
    };

    // Função para calcular o próximo delay com base na estratégia
    const calculateDelay = (retryCount: number): number => {
      switch (strategy) {
        case 'immediate':
          return 0;
        
        case 'fixed-delay':
          return initialDelay;
        
        case 'exponential':
          return Math.min(Math.pow(2, retryCount) * initialDelay, maxDelay);
        
        case 'fibonacci':
          return Math.min(fibonacciNumber(retryCount + 1) * initialDelay, maxDelay);
        
        case 'random':
          return Math.floor(Math.random() * (maxDelay - initialDelay + 1)) + initialDelay;
        
        case 'incremental':
          return Math.min(initialDelay + (retryCount * increment), maxDelay);
        
        default:
          return initialDelay;
      }
    };

    // Função para determinar se um erro deve ser retentado
    const shouldRetry = (error: any): boolean => {
      // Se existir um predicado personalizado, use-o
      if (retryPredicate) {
        return retryPredicate(error, 0);
      }
      
      // Para erros HTTP, verifica o código de status
      if (error.status && retryStatusCodes.includes(error.status)) {
        return true;
      }
      
      // Para erros de rede (offline, connection reset, etc)
      if (error instanceof TypeError && error.message.includes('network')) {
        return true;
      }
      
      // Por padrão, não retenta
      return false;
    };

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (!isObservable(result)) {
        // Se não for um Observable, converte para Observable se for uma Promise
        if (result instanceof Promise) {
          return from(result).pipe(
            retryImplementation(this)
          );
        }
        
        // Se não for Observable nem Promise, apenas retorna o resultado
        return result;
      }
      
      return result.pipe(
        retryImplementation(this)
      );
    };
    
    // Implementação do retry extraída para reutilização
    function retryImplementation(context: any) {
      return (source: Observable<any>) => 
        source.pipe(
          retryWhen(errors => errors.pipe(
            mergeMap((error, index) => {
              const retryCount = index + 1;
              
              // Verifica se deve continuar tentando
              if (retryCount > maxRetries || !shouldRetry(error)) {
                log(`Não vai mais tentar. Tentativas: ${retryCount}, Erro: ${error.message || error}`);
                
                if (onFailure) {
                  onFailure.call(context, error, retryCount);
                }
                
                return throwError(error);
              }
              
              // Calcula o delay para esta tentativa
              const delayTime = calculateDelay(index);
              
              log(`Tentativa ${retryCount}/${maxRetries} falhou. Tentando novamente em ${delayTime}ms`);
              
              if (beforeRetry) {
                beforeRetry.call(context, error, retryCount, delayTime);
              }
              
              return timer(delayTime);
            }),
            finalize(() => {
              log('Todas as tentativas de retry concluídas');
            })
          )),
          catchError(error => {
            log(`Todas as tentativas falharam: ${error.message || error}`);
            
            if (fallbackValue !== undefined) {
              log(`Retornando valor de fallback`);
              return of(fallbackValue);
            }
            
            return throwError(error);
          })
        );
    }
    
    return descriptor;
  };
}

/**
 * Calcula o n-ésimo número de Fibonacci
 * Usado pela estratégia de retry fibonacci
 */
function fibonacciNumber(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  let a = 0;
  let b = 1;
  let result = 1;
  
  for (let i = 2; i <= n; i++) {
    result = a + b;
    a = b;
    b = result;
  }
  
  return result;
}
