import { Observable, from, isObservable } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';

/**
 * Interface que representa o estado de uma execução compartilhada
 */
interface ExecutionState<T = any> {
  /** O resultado compartilhado (Observable ou Promise) */
  sharedResult: Observable<T> | Promise<T>;
  
  /** Timestamp de quando a execução foi iniciada */
  timestamp: number;
}

/**
 * Interface para as opções do decorator ShareExecution
 */
export interface ShareExecutionOptions {
  /** 
   * Função para gerar chaves de cache personalizadas 
   * Por padrão, usa JSON.stringify dos argumentos
   */
  keyGenerator?: (...args: any[]) => string;
  
  /** 
   * Número de assinaturas a manter em cache 
   * Por padrão é 1
   */
  bufferSize?: number;
  
  /** 
   * Se deve registrar informações de debug no console 
   * Por padrão é false
   */
  debug?: boolean;
}

/**
 * Decorator que compartilha a execução de um método enquanto ele estiver ativo.
 * 
 * Diferente do ShareReplay, este decorator não mantém o resultado em cache após a conclusão.
 * É útil para evitar múltiplas chamadas simultâneas para a mesma operação.
 * 
 * Características:
 * - Compartilha execuções simultâneas com os mesmos parâmetros
 * - Limpa o cache automaticamente após a conclusão
 * - Evita chamadas redundantes para APIs ou processos caros
 * - Garante consistência quando múltiplas partes do código chamam o mesmo método
 * 
 * @example
 * ```typescript
 * // Compartilha a execução durante operações concorrentes
 * @ShareExecution()
 * fetchUserData(userId: string): Observable<UserData> {
 *   return this.http.get<UserData>(`/api/users/${userId}`);
 * }
 * 
 * // Compartilha com chave personalizada
 * @ShareExecution({
 *   keyGenerator: (id, options) => `${id}_${options.includeDetails}`
 * })
 * loadReport(id: string, options: ReportOptions): Observable<Report> {
 *   return this.http.post<Report>('/api/reports/generate', { id, ...options });
 * }
 * ```
 * 
 * @param options Opções de configuração do compartilhamento
 */
export function ShareExecution(options: ShareExecutionOptions = {}) {
  const {
    keyGenerator = (...args: any[]) => JSON.stringify(args),
    bufferSize = 1,
    debug = false
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const executionCache = new Map<object, Map<string, ExecutionState>>();
    const methodName = `${target.constructor.name}.${propertyKey}`;
    
    const log = (message: string) => {
      if (debug) {
        console.log(`[ShareExecution:${methodName}] ${message}`);
      }
    };
    
    const cleanupCache = (instance: object, key: string) => {
      const instanceCache = executionCache.get(instance);
      
      if (instanceCache) {
        instanceCache.delete(key);
        log(`Execution completed for key: ${key}`);
        
        // Se o cache da instância estiver vazio, remova-o
        if (instanceCache.size === 0) {
          executionCache.delete(instance);
          log('Instance cache cleared');
        }
      }
    };

    descriptor.value = function (...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const instance = this;
      
      // Garante que existe um mapa para esta instância
      if (!executionCache.has(instance)) {
        executionCache.set(instance, new Map<string, ExecutionState>());
      }
      
      const instanceCache = executionCache.get(instance);
      
      // Gera a chave de execução com base nos argumentos
      const cacheKey = keyGenerator.apply(instance, args);
      
      // Verifica se já temos uma execução em andamento
      if (instanceCache.has(cacheKey)) {
        log(`Sharing execution for key: ${cacheKey}`);
        return instanceCache.get(cacheKey).sharedResult;
      }
      
      log(`Starting new execution for key: ${cacheKey}`);
      
      // Executa o método original
      const result = originalMethod.apply(this, args);
      
      // Processa o resultado baseado em seu tipo
      if (isObservable(result)) {
        // Para Observable, aplicamos shareReplay e finalize
        const sharedResult = result.pipe(
          shareReplay(bufferSize),
          finalize(() => cleanupCache(instance, cacheKey))
        );
        
        // Armazena no cache de execução
        instanceCache.set(cacheKey, {
          sharedResult,
          timestamp: Date.now()
        });
        
        return sharedResult;
      } else if (result instanceof Promise) {
        // Para Promise, convertemos para Observable, aplicamos shareReplay, e voltamos para Promise
        const sharedPromise = from(result).pipe(
          shareReplay(bufferSize),
          finalize(() => cleanupCache(instance, cacheKey))
        ).toPromise();
        
        // Armazena no cache de execução
        instanceCache.set(cacheKey, {
          sharedResult: sharedPromise,
          timestamp: Date.now()
        });
        
        return sharedPromise;
      }
      
      // Para outros tipos, retorna diretamente
      return result;
    };

    return descriptor;
  };
}
