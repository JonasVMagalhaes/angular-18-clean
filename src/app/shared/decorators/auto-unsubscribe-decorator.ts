import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Interface para opções do decorator AutoUnsubscribe
 */
export interface AutoUnsubscribeOptions {
  /**
   * Nome do subject de destruição dentro da classe
   * Por padrão é 'destroy$'
   */
  destroySubjectName?: string;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que adiciona automaticamente o operador takeUntil para gerenciar
 * o ciclo de vida de observáveis e evitar memory leaks.
 * 
 * Este decorator requer que a classe tenha um Subject nomeado (por padrão 'destroy$')
 * que deve ser completado no método ngOnDestroy.
 * 
 * Características:
 * - Automaticamente adiciona takeUntil ao Observable retornado
 * - Evita memory leaks ao garantir o unsubscribe
 * - Funciona com o ciclo de vida do Angular
 * - Simples de implementar em toda a aplicação
 * 
 * @example
 * ```typescript
 * @Component({...})
 * export class MyComponent implements OnDestroy {
 *   private destroy$ = new Subject<void>();
 *   
 *   // Será automaticamente cancelado quando destroy$ for completado
 *   @AutoUnsubscribe()
 *   loadData(): Observable<Data> {
 *     return this.dataService.getData();
 *   }
 *   
 *   ngOnDestroy(): void {
 *     this.destroy$.next();
 *     this.destroy$.complete();
 *   }
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function AutoUnsubscribe(options: AutoUnsubscribeOptions = {}) {
  const {
    destroySubjectName = 'destroy$',
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
        console.log(`[AutoUnsubscribe:${methodName}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      if (!this[destroySubjectName]) {
        console.warn(`[AutoUnsubscribe:${methodName}] Subject '${destroySubjectName}' não encontrado. Certifique-se de que ele existe na classe e é completado no ngOnDestroy.`);
        return originalMethod.apply(this, args);
      }
      
      const result = originalMethod.apply(this, args);
      
      if (result instanceof Observable) {
        log(`Aplicando takeUntil para ${destroySubjectName}`);
        return result.pipe(takeUntil(this[destroySubjectName]));
      }
      
      return result;
    };

    return descriptor;
  };
}
