import { Observable, of, throwError, EMPTY, timer } from 'rxjs';
import { tap, catchError, finalize, switchMap } from 'rxjs/operators';

/**
 * Interface para configuração do cache
 */
export interface CacheOptions {
  /**
   * Tempo de vida do cache em milissegundos
   * @default 300000 (5 minutos)
   */
  ttl?: number;
  
  /**
   * Chave para identificação do cache
   * Se não fornecida, será gerada baseada nos argumentos
   */
  cacheKey?: string | ((args: any[]) => string);
  
  /**
   * Escopo do cache
   * @default 'memory'
   */
  scope?: 'memory' | 'session' | 'local';
  
  /**
   * Prefixo para chaves de localStorage/sessionStorage
   */
  storagePrefix?: string;
  
  /**
   * Grupo de cache para invalidação em lote
   */
  cacheGroup?: string;
  
  /**
   * Se deve reutilizar requests em andamento para a mesma chave
   * @default true
   */
  shareRequests?: boolean;
  
  /**
   * Se deve renovar o TTL após cada acesso
   * @default false
   */
  slidingExpiration?: boolean;
  
  /**
   * Se deve atualizar o cache em background quando expirar
   * @default false
   */
  refreshInBackground?: boolean;
  
  /**
   * Se deve retornar cache expirado enquanto carrega novo valor
   * @default true
   */
  staleWhileRevalidate?: boolean;
  
  /**
   * Tamanho máximo do cache em memória
   */
  maxCacheSize?: number;
  
  /**
   * Função para determinar quais erros devem ser cacheados
   */
  cacheErrors?: (error: any) => boolean;
  
  /**
   * Habilitar log de debug
   */
  debug?: boolean;
}

// Cache global em memória
const memoryCache = new Map<string, { 
  value: any, 
  timestamp: number, 
  group: string | undefined,
  expiresAt: number,
  loading$?: Observable<any>
}>();

// Grupos de cache para invalidação coletiva
const cacheGroups = new Map<string, Set<string>>();

// Mapa para rastrear as chaves menos recentemente usadas (LRU)
const lruKeys = new Map<string, number>();

/**
 * Decorator para cache avançado de resultados de observables
 * 
 * Fornece:
 * - Cache em memória, sessionStorage ou localStorage
 * - Expiração automática baseada em TTL
 * - Invalidação por chave ou grupo
 * - Renovação em background
 * - Estratégia stale-while-revalidate
 * - Compartilhamento de requisições idênticas
 * - Suporte a LRU para limitação de tamanho
 * 
 * @example
 * ```typescript
 * // Cache básico em memória por 5 minutos
 * @ObservableCache()
 * getEmployees(): Observable<Employee[]> {
 *   return this.http.get<Employee[]>('/api/employees');
 * }
 * 
 * // Cache avançado com configurações personalizadas
 * @ObservableCache({
 *   ttl: 60000, // 1 minuto
 *   scope: 'local', // localStorage
 *   cacheGroup: 'employees',
 *   storagePrefix: 'app_cache',
 *   cacheKey: (args) => \`employees_\${args[0]?.department || 'all'}\`,
 *   refreshInBackground: true,
 *   debug: true
 * })
 * getEmployeesByDepartment(filters?: FilterOptions): Observable<Employee[]> {
 *   return this.http.get<Employee[]>('/api/employees', { params: this.convertToHttpParams(filters) });
 * }
 * ```
 * 
 * Para invalidar o cache:
 * ```typescript
 * // Invalidar uma chave específica
 * ObservableCache.invalidate('employees_marketing');
 * 
 * // Invalidar um grupo inteiro
 * ObservableCache.invalidateGroup('employees');
 * 
 * // Limpar todo o cache
 * ObservableCache.clear();
 * ```
 */
export function ObservableCache(options: CacheOptions = {}) {
  const {
    ttl = 300000, // 5 minutos
    scope = 'memory',
    storagePrefix = 'ngCache',
    shareRequests = true,
    slidingExpiration = false,
    refreshInBackground = false,
    staleWhileRevalidate = true,
    maxCacheSize,
    cacheGroup,
    cacheErrors,
    debug = false
  } = options;

  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${propertyKey}`;

    const log = (message: string) => {
      if (debug) {
        console.log(`[ObservableCache:${methodName}] ${message}`);
      }
    };

    // Função para gerar chave de cache baseada nos argumentos
    const generateCacheKey = (args: any[]): string => {
      if (typeof options.cacheKey === 'function') {
        return options.cacheKey(args);
      } else if (typeof options.cacheKey === 'string') {
        return options.cacheKey;
      } else {
        try {
          return `${methodName}:${JSON.stringify(args)}`;
        } catch (e) {
          // Se os argumentos não podem ser serializados, use uma versão simplificada
          return `${methodName}:${args.map(arg => 
            typeof arg === 'object' ? 
              (arg?.id || arg?.key || 'object') : 
              String(arg)
          ).join(',')}`;
        }
      }
    };

    // Função para recuperar valor do cache (memória, sessionStorage ou localStorage)
    const getCachedValue = (key: string): { value: any, timestamp: number, expiresAt: number } | null => {
      // Primeiro verifica o cache em memória
      if (memoryCache.has(key)) {
        const cacheItem = memoryCache.get(key);
        if (cacheItem) {
          // Atualizar o LRU
          lruKeys.set(key, Date.now());
          return cacheItem;
        }
      }

      // Se escopo for session ou local, verifica o armazenamento do navegador
      if (scope !== 'memory' && typeof window !== 'undefined') {
        const storage = scope === 'session' ? sessionStorage : localStorage;
        try {
          const stored = storage.getItem(`${storagePrefix}:${key}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            
            // Armazena em memória também para acesso rápido
            memoryCache.set(key, parsed);
            
            // Atualiza o LRU
            lruKeys.set(key, Date.now());
            
            return parsed;
          }
        } catch (e) {
          log(`Erro ao ler do ${scope}Storage: ${e}`);
        }
      }

      return null;
    };

    // Função para salvar valor no cache
    const setCachedValue = (key: string, value: any, group?: string): void => {
      const timestamp = Date.now();
      const expiresAt = timestamp + ttl;
      const cacheItem = { value, timestamp, group, expiresAt };

      // Verifica se precisa aplicar LRU para limitar o tamanho do cache
      if (maxCacheSize && memoryCache.size >= maxCacheSize) {
        // Encontra a chave menos recentemente usada
        let oldestKey = '';
        let oldestTime = Date.now();

        for (const [key, time] of lruKeys.entries()) {
          if (time < oldestTime) {
            oldestTime = time;
            oldestKey = key;
          }
        }

        if (oldestKey) {
          log(`Cache cheio. Removendo item antigo: ${oldestKey}`);
          memoryCache.delete(oldestKey);
          lruKeys.delete(oldestKey);
          
          // Remove do grupo se estiver associado
          for (const [groupName, keys] of cacheGroups.entries()) {
            if (keys.has(oldestKey)) {
              keys.delete(oldestKey);
              break;
            }
          }
        }
      }

      // Adiciona ao cache em memória
      memoryCache.set(key, cacheItem);
      lruKeys.set(key, timestamp);

      // Adiciona ao grupo de cache se especificado
      if (group) {
        if (!cacheGroups.has(group)) {
          cacheGroups.set(group, new Set());
        }
        cacheGroups.get(group)?.add(key);
      }

      // Se escopo for session ou local, salva no armazenamento do navegador
      if (scope !== 'memory' && typeof window !== 'undefined') {
        try {
          const storage = scope === 'session' ? sessionStorage : localStorage;
          storage.setItem(`${storagePrefix}:${key}`, JSON.stringify(cacheItem));
        } catch (e) {
          log(`Erro ao salvar no ${scope}Storage: ${e}`);
        }
      }
    };

    descriptor.value = function(...args: any[]) {
      const cacheKey = generateCacheKey(args);
      let cachedItem = getCachedValue(cacheKey);
      const now = Date.now();
      
      // Verifica se o cache está sendo carregado em outro request
      if (shareRequests && cachedItem?.loading$) {
        log(`Reutilizando request em andamento para: ${cacheKey}`);
        return cachedItem.loading$;
      }

      // Função para buscar dados frescos
      const fetchFreshData = (): Observable<any> => {
        log(`Buscando dados frescos para: ${cacheKey}`);
        
        const result$ = originalMethod.apply(this, args).pipe(
          tap(result => {
            log(`Salvando resultado no cache: ${cacheKey}`);
            setCachedValue(cacheKey, result, cacheGroup);
          }),
          catchError(error => {
            log(`Erro na requisição: ${error.message || error}`);
            
            // Se a política de cache de erro permitir, cacheia o erro também
            if (cacheErrors && cacheErrors(error)) {
              log(`Cacheando erro conforme política`);
              setCachedValue(cacheKey, { isError: true, error }, cacheGroup);
            }
            
            return throwError(error);
          }),
          finalize(() => {
            // Remover a referência do request em andamento
            const currentCache = memoryCache.get(cacheKey);
            if (currentCache) {
              delete currentCache.loading$;
            }
          })
        );

        // Salva referência do request em andamento para compartilhamento
        if (shareRequests) {
          if (!cachedItem) {
            cachedItem = { value: null, timestamp: now, group: cacheGroup, expiresAt: now + ttl };
            memoryCache.set(cacheKey, cachedItem);
          }
          
          cachedItem.loading$ = result$;
        }

        return result$;
      };
      
      // Verifica se existe cache e se não está expirado
      if (cachedItem && cachedItem.expiresAt > now) {
        log(`Cache válido encontrado para: ${cacheKey}`);
        
        // Se for configurado para renovar TTL a cada acesso
        if (slidingExpiration) {
          log(`Renovando TTL do cache`);
          cachedItem.expiresAt = now + ttl;
          
          if (scope !== 'memory' && typeof window !== 'undefined') {
            const storage = scope === 'session' ? sessionStorage : localStorage;
            storage.setItem(`${storagePrefix}:${cacheKey}`, JSON.stringify(cachedItem));
          }
        }
        
        return of(cachedItem.value);
      } 
      // Cache expirado
      else if (cachedItem) {
        log(`Cache expirado para: ${cacheKey}`);

        if (refreshInBackground) {
          log(`Atualizando cache em background`);
          // Busca novos dados em background sem bloquear resposta
          fetchFreshData().subscribe();
          
          // Se configurado para usar cache expirado enquanto atualiza
          if (staleWhileRevalidate) {
            log(`Retornando cache expirado durante revalidação`);
            return of(cachedItem.value);
          }
        }
        
        if (staleWhileRevalidate) {
          log(`Retornando cache expirado e iniciando revalidação`);
          // Retorna valor expirado e inicia revalidação
          return of(cachedItem.value).pipe(
            tap(() => {
              setTimeout(() => fetchFreshData().subscribe(), 0);
            })
          );
        }
      }

      // Sem cache válido, buscar dados frescos
      return fetchFreshData();
    };

    return descriptor;
  };
}

// Métodos estáticos para manipulação do cache
ObservableCache.invalidate = (key: string, scope: 'memory' | 'session' | 'local' = 'memory', storagePrefix = 'ngCache'): void => {
  // Remove do cache em memória
  memoryCache.delete(key);
  lruKeys.delete(key);
  
  // Remove do armazenamento do navegador se necessário
  if (scope !== 'memory' && typeof window !== 'undefined') {
    const storage = scope === 'session' ? sessionStorage : localStorage;
    storage.removeItem(`${storagePrefix}:${key}`);
  }
};

ObservableCache.invalidateGroup = (group: string, scope: 'memory' | 'session' | 'local' = 'memory', storagePrefix = 'ngCache'): void => {
  const keys = cacheGroups.get(group);
  if (keys) {
    keys.forEach(key => {
      ObservableCache.invalidate(key, scope, storagePrefix);
    });
    cacheGroups.delete(group);
  }
};

ObservableCache.clear = (scope: 'memory' | 'session' | 'local' = 'memory', storagePrefix = 'ngCache'): void => {
  // Limpa o cache em memória
  memoryCache.clear();
  lruKeys.clear();
  cacheGroups.clear();
  
  // Limpa o armazenamento do navegador se necessário
  if (scope !== 'memory' && typeof window !== 'undefined') {
    const storage = scope === 'session' ? sessionStorage : localStorage;
    
    if (storagePrefix) {
      // Remove apenas entradas com o prefixo especificado
      const keysToRemove = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(`${storagePrefix}:`)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove as chaves identificadas
      keysToRemove.forEach(key => storage.removeItem(key));
    } else {
      // Limpa todo o storage
      storage.clear();
    }
  }
};
