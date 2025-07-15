import { Observable, timer } from 'rxjs';
import { debounce, throttleTime } from 'rxjs/operators';

/**
 * Decorador para aplicar throttling em métodos que são chamados frequentemente.
 * Limita a execução do método a uma vez a cada intervalo especificado.
 * 
 * @param time Intervalo mínimo entre execuções em milissegundos
 * @param options Opções adicionais de throttling
 * @returns Decorador para método
 * 
 * @example
 * ```typescript
 * // Limitar a uma chamada a cada 500ms
 * @Throttle(500)
 * handleScroll(event: Event): void {
 *   // Processamento pesado que não deve ser executado a cada evento de scroll
 *   this.processScrollData(event);
 * }
 * ```
 */
export function Throttle(
  time: number = 300,
  options: { leading?: boolean; trailing?: boolean } = { leading: true, trailing: false }
) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let throttled = false;
    let lastResult: any;
    let pendingCall = false;
    
    descriptor.value = function(...args: any[]) {
      // Para métodos que retornam Observable, aplicamos operador throttleTime
      const result = originalMethod.apply(this, args);
      if (result instanceof Observable) {
        return result.pipe(throttleTime(time, undefined, options));
      }
      
      // Para métodos síncronos, implementamos throttling manualmente
      if (throttled) {
        if (options.trailing) {
          pendingCall = true;
          // Guardar argumentos para chamada posterior
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const context = this;
          setTimeout(() => {
            if (pendingCall) {
              lastResult = originalMethod.apply(context, args);
              pendingCall = false;
              throttled = false;
            }
          }, time);
        }
        return lastResult;
      }
      
      throttled = true;
      setTimeout(() => {
        throttled = false;
      }, time);
      
      if (options.leading !== false) {
        lastResult = originalMethod.apply(this, args);
        return lastResult;
      }
      
      return lastResult;
    };
    
    return descriptor;
  };
}

/**
 * Decorador para aplicar debounce em métodos que são chamados frequentemente.
 * Atrasa a execução do método até que um certo tempo tenha passado sem chamadas adicionais.
 * 
 * @param time Tempo de espera em milissegundos antes da execução
 * @param immediate Se verdadeiro, executa na primeira chamada e depois aplica debounce
 * @returns Decorador para método
 * 
 * @example
 * ```typescript
 * // Esperar 300ms de inatividade antes de fazer a busca
 * @Debounce(300)
 * searchProducts(term: string): Observable<Product[]> {
 *   return this.productService.search(term);
 * }
 * 
 * // Executar imediatamente na primeira chamada e depois aplicar debounce
 * @Debounce(500, true)
 * saveChanges(formData: any): void {
 *   this.dataService.save(formData);
 * }
 * ```
 */
export function Debounce(
  time: number = 300,
  immediate: boolean = false
) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    let timeout: any;
    let lastCall: number = 0;
    
    descriptor.value = function(...args: any[]) {
      // Para métodos que retornam Observable, aplicamos operador debounce
      const result = originalMethod.apply(this, args);
      if (result instanceof Observable) {
        return result.pipe(
          debounce(() => timer(time))
        );
      }
      
      // Para métodos síncronos, implementamos debounce manualmente
      const now = Date.now();
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context = this;
      
      if (immediate && (now - lastCall > time)) {
        lastCall = now;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          lastCall = 0;
        }, time);
        return originalMethod.apply(this, args);
      }
      
      clearTimeout(timeout);
      
      return new Promise((resolve) => {
        timeout = setTimeout(() => {
          lastCall = Date.now();
          resolve(originalMethod.apply(context, args));
        }, time);
      });
    };
    
    return descriptor;
  };
}
