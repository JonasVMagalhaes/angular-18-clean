import { Observable, isObservable, timer, of } from 'rxjs';
import { switchMap, delay, takeUntil, map, tap } from 'rxjs/operators';

/**
 * Interface para opções do decorator MinimumLoadingTime
 */
export interface MinimumLoadingTimeOptions {
  /**
   * Tempo mínimo de carregamento em ms
   * Por padrão é 500ms
   */
  minTime?: number;
  
  /**
   * Tempo máximo de carregamento em ms (após isso, força completar)
   * Opcional, se não fornecido não há limite
   */
  maxTime?: number;
  
  /**
   * Se deve mesclar os tempos min/max com o tempo real
   * Por padrão é false (garantido que durará pelo menos minTime)
   */
  useTimer?: boolean;
  
  /**
   * Função para transformar o resultado, tipicamente para adicionar propriedade de loading
   */
  resultTransformer?: <T>(result: T, timing: LoadingTiming) => any;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Interface que descreve métricas de tempo de carregamento
 */
export interface LoadingTiming {
  /** Tempo real que a operação levou */
  actualTime: number;
  
  /** Tempo total percebido pelo usuário */
  perceivedTime: number;
  
  /** Se o tempo foi estendido artificialmente */
  wasExtended: boolean;
  
  /** Se o tempo foi reduzido artificialmente */
  wasCapped: boolean;
}

/**
 * Decorator que garante um tempo mínimo de loading para evitar flickering de UI
 * e proporcionar uma experiência mais consistente ao usuário.
 * 
 * Características:
 * - Garante tempo mínimo de exibição para indicadores de carregamento
 * - Evita flickering em operações muito rápidas
 * - Pode limitar tempo máximo para melhorar a UX
 * - Permite transformar o resultado para incluir estado de loading
 * - Útil para componentes com indicadores visuais de carregamento
 * 
 * @example
 * ```typescript
 * // Tempo mínimo de loading de 800ms
 * @MinimumLoadingTime({ minTime: 800 })
 * searchUsers(term: string): Observable<User[]> {
 *   return this.userService.search(term);
 * }
 * 
 * // Com transformação de resultado para state object
 * @MinimumLoadingTime({
 *   minTime: 500,
 *   maxTime: 10000,
 *   resultTransformer: (data, timing) => ({
 *     data,
 *     timing,
 *     loading: false
 *   })
 * })
 * fetchDashboardData(): Observable<DashboardData> {
 *   return this.dashboardService.getData();
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function MinimumLoadingTime(options: MinimumLoadingTimeOptions = {}) {
  const {
    minTime = 500,
    maxTime = undefined,
    useTimer = false,
    resultTransformer,
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
        console.log(`[MinimumLoadingTime:${methodName}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (!isObservable(result)) {
        return result;
      }
      
      const startTime = Date.now();
      log(`Iniciando com tempo mínimo: ${minTime}ms${maxTime ? `, máximo: ${maxTime}ms` : ''}`);
      
      // Se useTimer é true, usamos timer para garantir os tempos
      if (useTimer) {
        // Cria um timer que emite após o tempo mínimo
        const minTimer$ = timer(minTime).pipe(
          map(() => 'MIN_TIME_REACHED'),
          tap(() => log(`Tempo mínimo atingido após ${Date.now() - startTime}ms`))
        );
        
        // Se maxTime for definido, cria um timer para o tempo máximo
        const maxTimer$ = maxTime 
          ? timer(maxTime).pipe(
              map(() => 'MAX_TIME_REACHED'),
              tap(() => log(`Tempo máximo atingido após ${Date.now() - startTime}ms`))
            )
          : of('MAX_TIME_INFINITE').pipe(
              delay(100000000) // Valor alto para nunca disparar naturalmente
            );
        
        // Combina o resultado original com os timers
        return result.pipe(
          // Mapeamos para um objeto com o valor e um marker
          map((value: any) => ({ value, type: 'RESULT' })),
          
          // Mesclamos com os timers usando race
          race(minTimer$.pipe(map((type: string) => ({ type, value: null as any }))), 
               maxTimer$.pipe(map((type: string) => ({ type, value: null as any })))),
          
          // Mantemos apenas o resultado e o primeiro timer a disparar
          scan((acc, curr) => {
            if (curr.type === 'RESULT') {
              acc.result = curr.value;
              acc.hasResult = true;
            } else if (curr.type === 'MIN_TIME_REACHED') {
              acc.minTimeReached = true;
            } else if (curr.type === 'MAX_TIME_REACHED') {
              acc.maxTimeReached = true;
            }
            return acc;
          }, { result: null, hasResult: false, minTimeReached: false, maxTimeReached: false }),
          
          // Filtramos até que tenhamos o resultado e o tempo mínimo
          // ou o tempo máximo tenha sido atingido
          filter(state => 
            (state.hasResult && state.minTimeReached) || state.maxTimeReached
          ),
          
          // Tomamos apenas o primeiro evento que satisfaça a condição
          take(1),
          
          // Transformamos de volta para o resultado original
          map(state => {
            const actualTime = Date.now() - startTime;
            const timing: LoadingTiming = {
              actualTime,
              perceivedTime: actualTime,
              wasExtended: actualTime < minTime,
              wasCapped: maxTime ? actualTime > maxTime : false
            };
            
            log(`Operação completa. Tempo real: ${timing.actualTime}ms, tempo percebido: ${timing.perceivedTime}ms`);
            
            return resultTransformer 
              ? resultTransformer(state.result, timing) 
              : state.result;
          })
        );
      } else {
        // Abordagem mais simples usando delay
        return result.pipe(
          // Captura o resultado e o tempo real
          switchMap(value => {
            const actualTime = Date.now() - startTime;
            log(`Resultado obtido em ${actualTime}ms`);
            
            // Calcula quanto tempo adicional precisamos esperar
            const remainingTime = Math.max(0, minTime - actualTime);
            
            // Se já passou do tempo mínimo, não precisa de delay adicional
            if (remainingTime <= 0) {
              log('Já passou do tempo mínimo, retornando imediatamente');
              const timing: LoadingTiming = {
                actualTime,
                perceivedTime: actualTime,
                wasExtended: false,
                wasCapped: false
              };
              
              return of(resultTransformer ? resultTransformer(value, timing) : value);
            }
            
            // Caso contrário, adiciona um delay para atingir o tempo mínimo
            log(`Adicionando delay de ${remainingTime}ms para atingir tempo mínimo`);
            return of(value).pipe(
              delay(remainingTime),
              map(delayedValue => {
                const perceivedTime = Date.now() - startTime;
                const timing: LoadingTiming = {
                  actualTime,
                  perceivedTime,
                  wasExtended: true,
                  wasCapped: false
                };
                
                log(`Operação completa após delay. Tempo real: ${timing.actualTime}ms, tempo percebido: ${timing.perceivedTime}ms`);
                return resultTransformer ? resultTransformer(delayedValue, timing) : delayedValue;
              })
            );
          }),
          
          // Se maxTime for definido, limita o tempo total de execução
          takeUntil(maxTime ? timer(maxTime).pipe(
            tap(() => {
              log(`Tempo máximo de ${maxTime}ms atingido, forçando completar`);
            })
          ) : timer(Number.MAX_SAFE_INTEGER))
        );
      }
    };

    return descriptor;
  };
}

// Helpers para combinar resultado com timers
import { race, scan, filter, take } from 'rxjs/operators';
