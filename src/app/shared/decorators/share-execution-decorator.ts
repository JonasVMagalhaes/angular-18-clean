import { Observable, from } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';

export function ShareExecution() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let isExecuting = false;
    let sharedResult: Observable<any> | Promise<any> | null = null;

    descriptor.value = function (...args: any[]) {
      if (isExecuting) {
        return sharedResult;
      }

      const result = originalMethod.apply(this, args);

      if (result instanceof Observable) {
        isExecuting = true;
        sharedResult = result.pipe(
          finalize(() => {
            isExecuting = false;
            sharedResult = null;
          }),
          shareReplay(1) // Compartilha o resultado da execução
        );
        return sharedResult;
      } else if (result instanceof Promise) {
        isExecuting = true;
        sharedResult = from(result).pipe(
          finalize(() => {
            isExecuting = false;
            sharedResult = null;
          }),
          shareReplay(1)
        ).toPromise();
        return sharedResult;
      } else {
        return result;
      }
    };

    return descriptor;
  };
}