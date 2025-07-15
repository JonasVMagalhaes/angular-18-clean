import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Opções para o decorator LocalStorageCache
 */
export interface LocalStorageCacheOptions {
  /**
   * Prefixo para a chave do cache no localStorage
   * @default 'app_cache_'
   */
  keyPrefix?: string;

  /**
   * Tempo de expiração do cache em milissegundos
   * @default 3600000 (1 hora)
   */
  ttl?: number;

  /**
   * Função para gerar a chave de cache com base nos argumentos do método
   * @default JSON.stringify dos argumentos
   */
  keyGenerator?: (args: any[]) => string;

  /**
   * Se deve forçar a busca de dados frescos, ignorando o cache
   * @default false
   */
  forceRefresh?: boolean;

  /**
   * Se deve atualizar o cache em background, mesmo se um valor válido for encontrado
   * @default false
   */
  backgroundRefresh?: boolean;

  /**
   * Função para validar o valor no cache antes de usá-lo
   * @default undefined (não valida)
   */
  validator?: (cachedValue: any) => boolean;

  /**
   * Se deve mostrar logs de debug
   * @default false
   */
  debug?: boolean;
}

/**
 * Decorator que armazena os resultados de um método Observable no localStorage.
 * 
 * Características:
 * - Armazena resultados no localStorage com chave baseada nos argumentos
 * - Suporta tempo de expiração (TTL)
 * - Opção de atualização em background para manter o cache fresco
 * - Validação opcional dos valores armazenados
 * 
 * @example
 * ```typescript
 * @LocalStorageCache({
 *   ttl: 3600000, // 1 hora
 *   keyPrefix: 'employee_',
 *   backgroundRefresh: true
 * })
 * public getEmployeeById(id: string): Observable<Employee> {
 *   return this.http.get<Employee>(`/api/employees/${id}`);
 * }
 * 
 * // Com validação e força de atualização
 * @LocalStorageCache({
 *   validator: (employee) => !!employee && employee.status === 'ACTIVE',
 *   keyGenerator: (args) => `onboarding_${args[0].companyId}_${args[0].departmentId}`
 * })
 * public getOnboardingModels(params: OnboardingModelParams): Observable<OnboardingModel[]> {
 *   return this.http.get<OnboardingModel[]>('/api/onboarding/models', { params });
 * }
 * ```
 * 
 * @param options Opções de configuração do cache
 */
export function LocalStorageCache(options: LocalStorageCacheOptions = {}) {
  const {
    keyPrefix = 'app_cache_',
    ttl = 3600000, // 1 hora
    keyGenerator = JSON.stringify,
    forceRefresh = false,
    backgroundRefresh = false,
    validator,
    debug = false
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    const log = (message: string) => {
      if (debug) {
        console.log(`[LocalStorageCache:${target.constructor.name}.${propertyKey}] ${message}`);
      }
    };
    
    descriptor.value = function (...args: any[]) {
      // Gera a chave do cache
      const cacheKey = `${keyPrefix}${propertyKey}_${keyGenerator(args)}`;
      
      // Verifica se existe valor no cache
      try {
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData && !forceRefresh) {
          const { value, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > ttl;
          
          if (!isExpired) {
            const isValid = validator ? validator(value) : true;
            
            if (isValid) {
              log(`Cache hit para ${cacheKey}`);
              
              // Se precisar atualizar em background, busca dados frescos sem bloquear
              if (backgroundRefresh) {
                log(`Atualizando cache em background para ${cacheKey}`);
                setTimeout(() => {
                  originalMethod.apply(this, args)
                    .subscribe({
                      next: (freshData: any) => {
                        log(`Atualização em background concluída para ${cacheKey}`);
                        this.updateCache(cacheKey, freshData);
                      },
                      error: (err: any) => {
                        log(`Erro na atualização em background: ${err}`);
                      }
                    });
                }, 0);
              }
              
              // Retorna o valor do cache
              return of(value);
            }
          }
        }
      } catch (error) {
        log(`Erro ao ler cache: ${error}`);
        localStorage.removeItem(cacheKey);
      }
      
      // Se não há cache válido, executa o método original
      log(`Cache miss para ${cacheKey}, buscando dados...`);
      
      // Executa o método original e salva o resultado no cache
      return originalMethod.apply(this, args).pipe(
        tap((result: any) => {
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                value: result,
                timestamp: Date.now()
              })
            );
            log(`Dado armazenado em cache para ${cacheKey}`);
          } catch (error) {
            log(`Erro ao salvar no cache: ${error}`);
            
            // Se for erro de cota, limpa o cache mais antigo
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
              this.clearOldestCache(keyPrefix);
            }
          }
        })
      );
    };
    
    // Método auxiliar para limpar o cache mais antigo
    target.clearOldestCache = function (prefix: string) {
      const cacheItems: Array<{ key: string; timestamp: number }> = [];
      
      // Coleta todos os itens de cache com o prefixo especificado
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          try {
            const value = JSON.parse(localStorage.getItem(key) || '{}');
            if (value && value.timestamp) {
              cacheItems.push({ key, timestamp: value.timestamp });
            }
          } catch (e) {
            // Ignora itens que não podem ser analisados
          }
        }
      }
      
      // Ordena por data de criação (mais antigo primeiro)
      cacheItems.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove os 20% mais antigos para liberar espaço
      const itemsToRemove = Math.max(1, Math.floor(cacheItems.length * 0.2));
      cacheItems.slice(0, itemsToRemove).forEach(item => {
        localStorage.removeItem(item.key);
      });
    };
    
    // Método auxiliar para atualizar o cache
    target.updateCache = function (key: string, value: any) {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            value,
            timestamp: Date.now()
          })
        );
      } catch (e) {
        log(`Erro ao atualizar cache: ${e}`);
      }
    };
    
    return descriptor;
  };
}
