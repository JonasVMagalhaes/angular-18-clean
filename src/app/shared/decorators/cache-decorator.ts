import { Observable, of, from } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheItem<T> {
  value: T;
  expiry: number | null;
}

const CACHE_MAP = new Map<string, Map<string, CacheItem<unknown>>>();

/**
 * Decorador que implementa cache para métodos que retornam Observable ou Promise.
 * O cache é baseado nos argumentos do método e pode ter um tempo de expiração.
 * 
 * @param ttl Tempo de vida do cache em milissegundos. Se não informado ou 0, o cache não expira.
 * @param keyGenerator Função opcional que gera uma chave de cache personalizada com base nos argumentos.
 * @returns Decorador para método
 * 
 * @example
 * ```typescript
 * // Cache por 5 minutos
 * @Cache(5 * 60 * 1000)
 * getUserData(userId: string): Observable<UserData> {
 *   return this.http.get<UserData>(`/api/users/${userId}`);
 * }
 * 
 * // Cache sem expiração com chave personalizada
 * @Cache(0, (countryCode, category) => `${countryCode}-${category}`)
 * getProductsByCountry(countryCode: string, category: string): Observable<Product[]> {
 *   return this.http.get<Product[]>(`/api/products/${countryCode}/${category}`);
 * }
 * ```
 */
export function Cache(
  ttl: number = 0,
  keyGenerator?: (...args: any[]) => string
) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    // Garantir que temos um mapa de cache para esta classe+método
    if (!CACHE_MAP.has(propertyKey)) {
      CACHE_MAP.set(propertyKey, new Map<string, CacheItem<unknown>>());
    }
    
    descriptor.value = function(...args: any[]) {
      // Determinar a chave de cache baseada nos argumentos ou no gerador personalizado
      const cacheKey = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const cacheStore = CACHE_MAP.get(propertyKey)!;
      const now = Date.now();
      
      // Verificar se temos um item em cache válido
      const cachedItem = cacheStore.get(cacheKey);
      if (cachedItem && (cachedItem.expiry === null || cachedItem.expiry > now)) {
        return cachedItem.value instanceof Promise 
          ? from(cachedItem.value) 
          : of(cachedItem.value);
      }
      
      // Executar o método original
      const result = originalMethod.apply(this, args);
      
      if (result instanceof Observable) {
        return result.pipe(
          tap(value => {
            cacheStore.set(cacheKey, {
              value,
              expiry: ttl ? now + ttl : null
            });
          })
        );
      } else if (result instanceof Promise) {
        // Para promises, armazenamos o resultado resolvido no cache
        return from(result).pipe(
          tap(value => {
            cacheStore.set(cacheKey, {
              value,
              expiry: ttl ? now + ttl : null
            });
          })
        ).toPromise();
      }
      
      // Para valores comuns (não observáveis/promises)
      cacheStore.set(cacheKey, {
        value: result,
        expiry: ttl ? now + ttl : null
      });
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Limpa o cache para um método específico ou para toda a classe
 * 
 * @param target Instância da classe ou classe
 * @param methodName Nome do método (opcional, se não informado limpa o cache de todos os métodos)
 */
export function clearCache(target: any, methodName?: string): void {
  if (methodName) {
    // Limpar cache de um método específico
    if (CACHE_MAP.has(methodName)) {
      CACHE_MAP.get(methodName)!.clear();
    }
  } else {
    // Limpar todos os caches relacionados a métodos da classe
    CACHE_MAP.forEach((cache, key) => {
      if (key.startsWith(target.constructor.name)) {
        cache.clear();
      }
    });
  }
}
