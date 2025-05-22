import { Observable, from } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';

interface ExecutionState {
  sharedResult: Observable<unknown> | Promise<unknown> | null;
}

/**
 * @returns Decorator para compartilhar a execução de um método que retorna um Observable ou Promise.
 * Se o método já estiver em execução, retorna o resultado compartilhado.
 */
export function ShareExecution() {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const instancesMethod = new Map<string, ExecutionState>();

    descriptor.value = function (...args: any[]) {
      const keyInstance = args.toString();
      const instance = instancesMethod.get(keyInstance);
      if(instance) {
        return instance.sharedResult;
      }

      const clonedMethod = originalMethod.apply(this, args);
      if (clonedMethod instanceof Observable) {
        instancesMethod.set(keyInstance, {
          sharedResult: clonedMethod.pipe(
            finalize(() => instancesMethod.delete(keyInstance)),
            shareReplay(1)
          )
        });

        return instancesMethod.get(keyInstance).sharedResult;
      } else if (clonedMethod instanceof Promise) {
        instancesMethod.set(keyInstance, {
          sharedResult: from(clonedMethod).pipe(
            finalize(() => instancesMethod.delete(keyInstance)),
            shareReplay(1)
          ).toPromise()
        });
        return instancesMethod.get(keyInstance).sharedResult;
      } else {
        console.error("Method must return an Observable or Promise");
        return clonedMethod;
      }
    };

    return descriptor;
  };
}
