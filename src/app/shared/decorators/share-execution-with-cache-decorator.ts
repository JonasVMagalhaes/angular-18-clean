import { Observable, from, timer } from 'rxjs';
import { finalize, shareReplay, switchMap } from 'rxjs/operators';

export function ShareExecutionWithCache(cooldownTime: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let isExecuting = false;
    let sharedResult: Observable<any> | Promise<any> | null = null;
    let cooldownActive = false;

    descriptor.value = function (...args: any[]) {
      if (cooldownActive) {
        return sharedResult;
      }

      if (isExecuting) {
        return sharedResult;
      }

      const result = originalMethod.apply(this, args);

      if (result instanceof Observable) {
        isExecuting = true;
        sharedResult = result.pipe(
          finalize(() => {
            isExecuting = false;
            cooldownActive = true;
            timer(cooldownTime).subscribe(() => {
              cooldownActive = false;
            });
          }),
          shareReplay(1) // Compartilha o resultado da execução
        );
        return sharedResult;
      } else if (result instanceof Promise) {
        isExecuting = true;
        sharedResult = from(result).pipe(
          finalize(() => {
            isExecuting = false;
            cooldownActive = true;
            timer(cooldownTime).subscribe(() => {
              cooldownActive = false;
            });
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