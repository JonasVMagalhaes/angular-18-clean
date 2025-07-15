import { Observable, throwError, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * Decorador para adicionar tratamento de erros e retry em métodos que retornam Observable.
 * Permite definir o número de tentativas e o manipulador de erros.
 * 
 * @param retryCount Número de tentativas adicionais após falha
 * @param errorHandler Função para tratamento de erros (opcional)
 * @returns Decorador para método
 * 
 * @example
 * ```typescript
 * // Tentar 3 vezes antes de falhar
 * @ErrorHandling(3)
 * fetchData(): Observable<Data> {
 *   return this.http.get<Data>('/api/data');
 * }
 * 
 * // Tentar 2 vezes e tratar erro personalizado
 * @ErrorHandling(2, (error, source) => {
 *   this.logger.error('Falha ao carregar dados', error);
 *   this.messageService.error('Não foi possível carregar os dados. Tente novamente mais tarde.');
 *   return throwError(() => new CustomError('Falha ao carregar dados', error));
 * })
 * fetchCriticalData(): Observable<CriticalData> {
 *   return this.http.get<CriticalData>('/api/critical-data');
 * }
 * ```
 */
export function ErrorHandling(
  retryCount: number = 1,
  errorHandler?: (error: any, source$: Observable<any>) => Observable<any>
) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (result instanceof Observable) {
        return result.pipe(
          retry(retryCount),
          catchError(error => {
            if (errorHandler) {
              return errorHandler(error, result);
            }
            return throwError(() => error);
          })
        );
      }
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Decorador para adicionar tratamento de erros com fallback em métodos que retornam Observable.
 * Em caso de erro, retorna um valor alternativo.
 * 
 * @param fallbackValue Valor a ser retornado em caso de erro
 * @param retryCount Número de tentativas adicionais após falha
 * @returns Decorador para método
 * 
 * @example
 * ```typescript
 * // Em caso de erro, retorna um array vazio
 * @WithFallback([])
 * getItems(): Observable<Item[]> {
 *   return this.http.get<Item[]>('/api/items');
 * }
 * 
 * // Tenta 2 vezes e retorna um objeto padrão em caso de falha
 * @WithFallback({ id: '0', name: 'Default User' }, 2)
 * getUserProfile(userId: string): Observable<UserProfile> {
 *   return this.http.get<UserProfile>(`/api/users/${userId}`);
 * }
 * ```
 */
export function WithFallback<T>(
  fallbackValue: T,
  retryCount: number = 1
) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (result instanceof Observable) {
        return result.pipe(
          retry(retryCount),
          catchError(() => {
            // Log do erro silencioso
            console.warn(`[WithFallback] Erro em ${target.constructor.name}.${propertyKey}, retornando valor alternativo`);
            return new Observable((observer) => {
              observer.next(fallbackValue);
              observer.complete();
            });
          })
        );
      }
      
      return result;
    };
    
    return descriptor;
  };
}
