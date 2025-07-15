import { Observable, from } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

interface LogOptions {
  /**
   * Nome personalizado para aparecer nos logs
   */
  name?: string;
  
  /**
   * Se true, exibe os argumentos de entrada
   */
  logArguments?: boolean;
  
  /**
   * Se true, exibe o resultado da função
   */
  logResult?: boolean;
  
  /**
   * Se true, exibe o tempo de execução
   */
  logTiming?: boolean;
  
  /**
   * Nível de log para entrada
   */
  entryLogLevel?: 'debug' | 'info' | 'warn' | 'error';
  
  /**
   * Nível de log para saída
   */
  exitLogLevel?: 'debug' | 'info' | 'warn' | 'error';
  
  /**
   * Função de filtragem para decidir se um log deve ser exibido
   */
  filter?: (...args: any[]) => boolean;
}

/**
 * Decorador que adiciona logs de entrada e saída de métodos
 * Útil para depuração e rastreamento de fluxo de execução
 * 
 * @example
 * // Log básico
 * @Log()
 * public getEmployeeData(id: string): Observable<EmployeeData> {...}
 * 
 * @example
 * // Log completo
 * @Log({
 *   name: 'UserService.fetchProfile',
 *   logArguments: true,
 *   logResult: true,
 *   logTiming: true,
 *   entryLogLevel: 'info',
 *   exitLogLevel: 'info',
 *   filter: (userId) => userId.startsWith('admin-')
 * })
 * public getUserProfile(userId: string): Observable<UserProfile> {...}
 */
export function Log(options: LogOptions = {}) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    const {
      name = `${target.constructor.name}.${propertyKey}`,
      logArguments = true,
      logResult = false,
      logTiming = true,
      entryLogLevel = 'debug',
      exitLogLevel = 'debug',
      filter
    } = options;
    
    descriptor.value = function(...args: any[]) {
      // Verificar filtro de logs
      if (filter && !filter.apply(this, args)) {
        return originalMethod.apply(this, args);
      }
      
      // Log de entrada
      const argString = logArguments ? ` (${JSON.stringify(args).substring(0, 200)})` : '';
      const startTime = logTiming ? Date.now() : 0;
      
      console[entryLogLevel](`➡️ ${name}${argString}`);
      
      try {
        const result = originalMethod.apply(this, args);
        
        // Processamento para Observable
        if (result instanceof Observable) {
          return result.pipe(
            tap(
              value => {
                if (logResult) {
                  try {
                    const resultStr = JSON.stringify(value).substring(0, 200);
                    console[exitLogLevel](`⬅️ ${name} returned: ${resultStr}`);
                  } catch (e) {
                    console[exitLogLevel](`⬅️ ${name} returned: [Resultado não serializável]`);
                  }
                }
              }
            ),
            finalize(() => {
              if (logTiming) {
                const executionTime = Date.now() - startTime;
                console[exitLogLevel](`⏱️ ${name} completed in ${executionTime}ms`);
              }
            })
          );
        }
        
        // Processamento para Promise
        if (result instanceof Promise) {
          return from(result.then(value => {
            if (logResult) {
              try {
                const resultStr = JSON.stringify(value).substring(0, 200);
                console[exitLogLevel](`⬅️ ${name} returned: ${resultStr}`);
              } catch (e) {
                console[exitLogLevel](`⬅️ ${name} returned: [Resultado não serializável]`);
              }
            }
            
            if (logTiming) {
              const executionTime = Date.now() - startTime;
              console[exitLogLevel](`⏱️ ${name} completed in ${executionTime}ms`);
            }
            
            return value;
          })).toPromise();
        }
        
        // Processamento para valores síncronos
        if (logResult) {
          try {
            const resultStr = JSON.stringify(result).substring(0, 200);
            console[exitLogLevel](`⬅️ ${name} returned: ${resultStr}`);
          } catch (e) {
            console[exitLogLevel](`⬅️ ${name} returned: [Resultado não serializável]`);
          }
        }
        
        if (logTiming) {
          const executionTime = Date.now() - startTime;
          console[exitLogLevel](`⏱️ ${name} completed in ${executionTime}ms`);
        }
        
        return result;
      } catch (error) {
        console.error(`❌ ${name} threw error: ${error}`);
        if (logTiming) {
          const executionTime = Date.now() - startTime;
          console.error(`⏱️ ${name} failed after ${executionTime}ms`);
        }
        throw error;
      }
    };
    
    return descriptor;
  };
}
