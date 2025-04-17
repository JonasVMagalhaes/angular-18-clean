import { Observable, timer, EMPTY } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';

// Tipo auxiliar para métodos que retornam Observable
type ObservableMethod<T> = (...args: any[]) => Observable<T>;

// Função auxiliar para encapsular lógica comum de Observable
function handleObservable<T>(
  observable: Observable<T>,
  finalizeCallback: () => void,
  share: boolean = false
): Observable<T> {
  let result = observable.pipe(finalize(finalizeCallback));
  if (share) {
    result = result.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
  return result;
}

/**
 * Impede chamadas concorrentes a um método que retorna Observable, retornando um Observable vazio para chamadas bloqueadas.
 * @param logger Função de logging personalizada (padrão: console.warn).
 */
export function BlockUntilComplete<T>(
  logger: (msg: string) => void = console.warn
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<ObservableMethod<T>>
  ) {
    const originalMethod = descriptor.value!;
    let isExecuting = false;

    descriptor.value = function (...args: any[]): Observable<T> {
      if (isExecuting) {
        logger(`Method ${propertyKey} is already executing. Returning EMPTY.`);
        return EMPTY; // Retorna Observable vazio para chamadas bloqueadas
      }

      const result = originalMethod.apply(this, args);
      if (!(result instanceof Observable)) {
        throw new Error(`Method ${propertyKey} must return an Observable`);
      }

      isExecuting = true;
      return handleObservable(result, () => {
        isExecuting = false;
      });
    };

    return descriptor;
  };
}

/**
 * Compartilha a execução de um Observable entre chamadas concorrentes.
 * Se cooldownTime for definido, armazena o resultado em cache pelo tempo especificado.
 * @param cooldownTime Tempo em milissegundos para manter o resultado em cache (opcional).
 * @param logger Função de logging personalizada (padrão: console.warn).
 */
export function ShareExecution<T>(
  cooldownTime?: number,
  logger: (msg: string) => void = console.warn
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<ObservableMethod<T>>
  ) {
    if (cooldownTime !== undefined && cooldownTime < 0) {
      throw new Error('cooldownTime must be a non-negative number');
    }

    const originalMethod = descriptor.value!;
    let isExecuting = false;
    let cooldownActive = false;
    let sharedResult: Observable<T> | null = null;

    descriptor.value = function (...args: any[]): Observable<T> {
      if (cooldownActive || isExecuting) {
        if (!sharedResult) {
          logger(`Method ${propertyKey} has no active result. Returning EMPTY.`);
          return EMPTY;
        }
        return sharedResult;
      }

      const result = originalMethod.apply(this, args);
      if (!(result instanceof Observable)) {
        throw new Error(`Method ${propertyKey} must return an Observable`);
      }

      isExecuting = true;
      sharedResult = handleObservable(
        result,
        () => {
          isExecuting = false;
          if (cooldownTime !== undefined) {
            cooldownActive = true;
            timer(cooldownTime).subscribe(() => {
              cooldownActive = false;
              sharedResult = null; // Limpa o cache após o cooldown
            });
          } else {
            sharedResult = null; // Limpa imediatamente sem cooldown
          }
        },
        true // Ativa compartilhamento
      );
      return sharedResult;
    };

    return descriptor;
  };
}