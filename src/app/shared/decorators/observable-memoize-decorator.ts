import { Observable, isObservable, from, of } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

/**
 * Interface para opções do decorator ObservableMemoize
 */
export interface ObservableMemoizeOptions {
  /**
   * Tempo em milissegundos para manter valores em cache
   * Se não definido, os valores são mantidos até a aplicação ser reiniciada
   */
  expirationTime?: number;
  
  /**
   * Função para gerar chaves de cache personalizadas
   */
  keyGenerator?: (...args: any[]) => string;
  
  /**
   * Tamanho máximo do cache (em número de entradas)
   * Por padrão não há limite
   */
  maxSize?: number;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Interface para entrada de cache
 */
interface CacheEntry<T> {
  /** Valor armazenado */
  value: T;
  /** Timestamp de quando o valor foi armazenado */
  timestamp: number;
  /** Se o valor está sendo carregado/calculado */
  loading: boolean;
}

/**
 * Armazenamento global de cache por classe/método
 */
const memoizationCache = new Map<string, Map<string, CacheEntry<any>>>();

/**
 * Decorator que implementa memoização de resultados para métodos que retornam Observable,
 * reutilizando valores previamente calculados para evitar recálculos desnecessários.
 * 
 * Características:
 * - Armazena resultados de cálculos pesados para reutilização
 * - Controla expiração de cache por tempo
 * - Limita tamanho do cache para evitar vazamentos de memória
 * - Chaves de cache personalizáveis
 * - Gerencia estado de loading para evitar cálculos duplicados
 * 
 * @example
 * ```typescript
 * // Memoização básica sem expiração
 * @ObservableMemoize()
 * getExpensiveCalculation(input: number): Observable<CalculationResult> {
 *   console.log('Performing expensive calculation');
 *   return of(this.performComplexMath(input)).pipe(delay(2000));
 * }
 * 
 * // Memoização com expiração e chave personalizada
 * @ObservableMemoize({
 *   expirationTime: 5 * 60 * 1000, // 5 minutos
 *   keyGenerator: (userId, filters) => `${userId}_${filters.sort}_${filters.page}`,
 *   maxSize: 50
 * })
 * getUserReports(userId: string, filters: ReportFilters): Observable<Report[]> {
 *   return this.reportService.generateUserReports(userId, filters);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function ObservableMemoize(options: ObservableMemoizeOptions = {}) {
  const {
    expirationTime,
    keyGenerator = (...args: any[]) => JSON.stringify(args),
    maxSize,
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
        console.log(`[ObservableMemoize:${methodName}] ${message}`);
      }
    };

    // Garante que exista um Map para este método
    if (!memoizationCache.has(methodName)) {
      memoizationCache.set(methodName, new Map<string, CacheEntry<any>>());
      log('Cache inicializado');
    }

    descriptor.value = function (...args: any[]) {
      const cache = memoizationCache.get(methodName)!;
      const cacheKey = keyGenerator.apply(this, args);
      const now = Date.now();
      
      // Verifica se o valor está em cache e ainda é válido
      if (cache.has(cacheKey)) {
        const entry = cache.get(cacheKey)!;
        
        // Se o valor estiver sendo carregado, retornamos o mesmo Observable
        if (entry.loading) {
          log(`Valor para chave "${cacheKey}" ainda está carregando, reutilizando a requisição atual`);
          return entry.value;
        }
        
        // Verifica se o valor expirou
        const isExpired = expirationTime && (now - entry.timestamp > expirationTime);
        
        if (!isExpired) {
          log(`Cache hit para chave "${cacheKey}"`);
          return entry.value;
        } else {
          log(`Cache expirado para chave "${cacheKey}"`);
          cache.delete(cacheKey);
        }
      }
      
      log(`Cache miss para chave "${cacheKey}"`);
      
      // Aplica política de tamanho máximo antes de adicionar novo item
      if (maxSize && cache.size >= maxSize) {
        // Estratégia LRU simples: remove a entrada mais antiga
        const oldestKey = Array.from(cache.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
        
        cache.delete(oldestKey);
        log(`Limite de cache atingido, removendo entrada mais antiga: "${oldestKey}"`);
      }
      
      // Executa o método original
      const result = originalMethod.apply(this, args);
      
      if (isObservable(result)) {
        // Marca como "em carregamento"
        cache.set(cacheKey, {
          value: result,
          timestamp: now,
          loading: true
        });
        
        // Processa o Observable, armazenando o valor final
        const cachedResult = result.pipe(
          tap(value => {
            // Atualiza o cache com o valor final
            cache.set(cacheKey, {
              value: of(value), // Armazenamos como Observable para manter a interface consistente
              timestamp: Date.now(),
              loading: false
            });
            log(`Valor armazenado em cache para chave "${cacheKey}"`);
          }),
          finalize(() => {
            // Se ocorrer um erro, remova a entrada para evitar cache de erro
            if (cache.get(cacheKey)?.loading) {
              cache.delete(cacheKey);
              log(`Erro durante carregamento, removendo entrada de cache para "${cacheKey}"`);
            }
          })
        );
        
        return cachedResult;
      } else if (result instanceof Promise) {
        // Converte Promise para Observable e aplica a mesma lógica
        const observable = from(result);
        
        cache.set(cacheKey, {
          value: observable,
          timestamp: now,
          loading: true
        });
        
        const cachedResult = observable.pipe(
          tap(value => {
            cache.set(cacheKey, {
              value: of(value),
              timestamp: Date.now(),
              loading: false
            });
            log(`Valor de Promise armazenado em cache para chave "${cacheKey}"`);
          }),
          finalize(() => {
            if (cache.get(cacheKey)?.loading) {
              cache.delete(cacheKey);
              log(`Erro durante carregamento de Promise, removendo entrada de cache para "${cacheKey}"`);
            }
          })
        );
        
        return cachedResult;
      }
      
      // Para valores síncronos, simplesmente retornamos
      return result;
    };
    
    // Adiciona método para limpar cache
    target[`clear${propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1)}Cache`] = function() {
      if (memoizationCache.has(methodName)) {
        memoizationCache.get(methodName)!.clear();
        log('Cache limpo');
      }
    };
    
    return descriptor;
  };
}
