import { Observable, from, isObservable } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';

/**
 * Interface que representa o estado de um resultado compartilhado
 */
interface ReplayState<T = any> {
  /** O resultado compartilhado (Observable ou Promise) */
  sharedResult: Observable<T> | Promise<T>;
  
  /** Timestamp de quando o resultado foi armazenado */
  timestamp: number;
}

/**
 * Enum que define as opções de duração de cache
 */
export enum Duration {
  /** O resultado é mantido indefinidamente até a aplicação ser reiniciada */
  INDETERMINATED = 'INDETERMINATED',
}

/**
 * Interface de configuração do decorator ShareReplay
 */
export interface ShareReplayOptions {
  /** 
   * Tempo em milissegundos para manter o resultado em cache 
   * (0 = limpa após execução, INDETERMINATED = mantém indefinidamente)
   */
  duration?: number | Duration;
  
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
 * Decorator para compartilhar a execução de um método que retorna um Observable ou Promise.
 * 
 * Características:
 * - Compartilha resultados de execuções simultâneas com os mesmos parâmetros
 * - Mantém resultados em cache pelo tempo determinado
 * - Gerencia automaticamente o ciclo de vida do cache
 * - Suporta tanto Observables quanto Promises
 * 
 * @example
 * ```typescript
 * // Compartilha a execução e limpa após completar
 * @ShareReplay()
 * getUserData(userId: string): Observable<UserData> {
 *   return this.http.get<UserData>(`/api/users/${userId}`);
 * }
 * 
 * // Compartilha e mantém em cache por 5 minutos
 * @ShareReplay({ duration: 5 * 60 * 1000 })
 * getConfigurations(): Observable<Config[]> {
 *   return this.http.get<Config[]>('/api/configurations');
 * }
 * 
 * // Compartilha com chave de cache personalizada
 * @ShareReplay({
 *   duration: Duration.INDETERMINATED,
 *   keyGenerator: (filters) => `${filters.country}_${filters.status}`
 * })
 * searchProducts(filters: ProductFilters): Observable<Product[]> {
 *   return this.http.post<Product[]>('/api/products/search', filters);
 * }
 * ```
 * 
 * @param options Opções de configuração do compartilhamento
 */
export function ShareReplay(options: ShareReplayOptions | number | Duration = {}) {
  // Normaliza as opções
  const normalizedOptions: ShareReplayOptions = typeof options === 'object' 
    ? options 
    : { duration: options };
  
  const {
    duration = 0,
    keyGenerator = (...args: any[]) => JSON.stringify(args),
    bufferSize = 1,
    debug = false
  } = normalizedOptions;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const instancesCache = new Map<object, Map<string, ReplayState>>();
    const methodName = `${target.constructor.name}.${propertyKey}`;

    const log = (message: string) => {
      if (debug) {
        console.log(`[ShareReplay:${methodName}] ${message}`);
      }
    };

    const cleanupCache = (instance: object, key: string) => {
      if (duration !== Duration.INDETERMINATED) {
        const instanceCache = instancesCache.get(instance);
        
        if (instanceCache) {
          // Se duração for 0, remove imediatamente
          if (duration === 0) {
            instanceCache.delete(key);
            log(`Cache cleared for key: ${key}`);
            
            // Se o cache da instância estiver vazio, remova-o também
            if (instanceCache.size === 0) {
              instancesCache.delete(instance);
              log('Instance cache cleared');
            }
          } else {
            // Caso contrário, agenda a limpeza para o futuro
            setTimeout(() => {
              instanceCache.delete(key);
              log(`Cache expired for key: ${key}`);
              
              // Se o cache da instância estiver vazio, remova-o também
              if (instanceCache.size === 0) {
                instancesCache.delete(instance);
                log('Instance cache cleared');
              }
            }, duration as number);
          }
        }
      }
    };

    descriptor.value = function (...args: any[]) {
      // Identificação única desta instância
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const instance = this;
      
      // Garante que existe um mapa para esta instância
      if (!instancesCache.has(instance)) {
        instancesCache.set(instance, new Map<string, ReplayState>());
      }
      
      const instanceCache = instancesCache.get(instance);
      
      // Gera a chave de cache com base nos argumentos
      const cacheKey = keyGenerator.apply(this, args);
      
      // Verifica se já temos um resultado em cache
      if (instanceCache.has(cacheKey)) {
        const cachedState = instanceCache.get(cacheKey);
        log(`Cache hit for key: ${cacheKey}`);
        return cachedState.sharedResult;
      }
      
      log(`Cache miss for key: ${cacheKey}`);
      
      // Executa o método original
      const result = originalMethod.apply(this, args);
      
      // Processa o resultado baseado em seu tipo
      if (isObservable(result)) {
        // Para Observable, aplicamos shareReplay e finalize
        const sharedResult = result.pipe(
          shareReplay(bufferSize),
          finalize(() => cleanupCache(instance, cacheKey))
        );
        
        // Armazena no cache
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
        
        // Armazena no cache
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
