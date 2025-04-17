import { Observable, from } from 'rxjs';
import { finalize } from 'rxjs/operators';

export function BlockUntilComplete() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let isExecuting = false;

    descriptor.value = function (...args: any[]) {
      if (isExecuting) {
        console.warn(`Method ${propertyKey} is already executing.`);
        return;
      }

      const result = originalMethod.apply(this, args);

      if (result instanceof Observable) {
        isExecuting = true;
        return result.pipe(
          finalize(() => {
            isExecuting = false;
          })
        );
      } else if (result instanceof Promise) {
        isExecuting = true;
        return from(result).pipe(
          finalize(() => {
            isExecuting = false;
          })
        ).toPromise();
      } else {
        return result;
      }
    };

    return descriptor;
  };
}