import { Observable, isObservable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

/**
 * Interface de opções do decorator Transform
 */
export interface TransformOptions<T = any, R = any> {
  /**
   * Função de transformação a ser aplicada aos valores emitidos
   */
  transformer: (value: T) => R;
  
  /**
   * Se deve usar switchMap em vez de map (para resultados assíncronos)
   * Por padrão é false
   */
  isAsync?: boolean;
  
  /**
   * Valor de fallback em caso de erro na transformação
   */
  fallbackValue?: R;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que aplica uma transformação aos dados retornados por um Observable.
 * 
 * Características:
 * - Permite transformação síncrona ou assíncrona dos dados
 * - Suporta recuperação de erros com fallback
 * - Centraliza lógica de transformação para reutilização
 * - Pode ser combinado com outros decorators como Cache ou Retry
 * 
 * @example
 * ```typescript
 * // Transformação síncrona básica
 * @Transform({
 *   transformer: (data: ApiResponse<UserData>) => data.results
 * })
 * getUsers(): Observable<ApiResponse<UserData>> {
 *   return this.http.get<ApiResponse<UserData>>('/api/users');
 * }
 * 
 * // Transformação assíncrona com fallback
 * @Transform({
 *   transformer: (users: User[]) => {
 *     return this.userEnrichmentService.addRoleInfo(users);
 *   },
 *   isAsync: true,
 *   fallbackValue: []
 * })
 * getUsersWithRoles(): Observable<User[]> {
 *   return this.userService.getUsers();
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function Transform<T = any, R = any>(options: TransformOptions<T, R>) {
  const {
    transformer,
    isAsync = false,
    fallbackValue,
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
        console.log(`[Transform:${methodName}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (isObservable(result)) {
        try {
          if (isAsync) {
            log('Aplicando transformação assíncrona');
            return result.pipe(
              switchMap((value: T) => {
                try {
                  const transformed = transformer(value);
                  return isObservable(transformed) ? transformed : of(transformed);
                } catch (err) {
                  log(`Erro na transformação: ${err}`);
                  return fallbackValue !== undefined ? of(fallbackValue) : throwError(err);
                }
              }),
              catchError(err => {
                log(`Erro capturado: ${err}`);
                return fallbackValue !== undefined ? of(fallbackValue) : throwError(err);
              })
            );
          } else {
            log('Aplicando transformação síncrona');
            return result.pipe(
              map((value: T) => transformer(value)),
              catchError(err => {
                log(`Erro capturado: ${err}`);
                return fallbackValue !== undefined ? of(fallbackValue) : throwError(err);
              })
            );
          }
        } catch (err) {
          log(`Erro na configuração: ${err}`);
          return fallbackValue !== undefined ? of(fallbackValue) : throwError(err);
        }
      }
      
      return result;
    };

    return descriptor;
  };
}

// Função auxiliar para lançar erros dentro de pipes
function throwError(error: any): Observable<never> {
  return new Observable(subscriber => subscriber.error(error));
}
