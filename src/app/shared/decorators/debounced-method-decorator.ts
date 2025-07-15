/**
 * Opções para o decorator DebouncedMethod
 */
export interface DebouncedMethodOptions {
  /**
   * Tempo de espera em milissegundos antes da execução do método
   * @default 300
   */
  wait?: number;

  /**
   * Se deve executar o método imediatamente na primeira chamada
   * @default false
   */
  immediate?: boolean;

  /**
   * Se deve usar uma chave de contexto específica para distinguir entre instâncias
   * @default 'default'
   */
  contextKey?: string;

  /**
   * Se deve mostrar logs de debug
   * @default false
   */
  debug?: boolean;
}

/**
 * Decorator que aplica debounce a um método, garantindo que ele só será executado
 * após um determinado período de inatividade.
 * 
 * Características:
 * - Controla a frequência de execução de métodos
 * - Útil para eventos de entrada do usuário como digitação
 * - Suporta opção de execução imediata para primeira chamada
 * - Mantém separação entre instâncias para evitar interferências
 * 
 * @example
 * ```typescript
 * // Método simples com debounce de 300ms
 * @DebouncedMethod()
 * search(term: string): void {
 *   this.searchService.performSearch(term);
 * }
 * 
 * // Método com execução imediata e debounce configurado
 * @DebouncedMethod({
 *   wait: 500,
 *   immediate: true,
 *   contextKey: 'searchField'
 * })
 * filterResults(filters: any): void {
 *   this.applyFilters(filters);
 * }
 * ```
 * 
 * @param options Opções de configuração do debounce
 */
export function DebouncedMethod(options: DebouncedMethodOptions = {}) {
  const {
    wait = 300,
    immediate = false,
    contextKey = 'default',
    debug = false
  } = options;

  // Armazena os timers de debounce para cada instância e método
  const timers = new WeakMap<any, { [key: string]: any }>();

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    const log = (message: string) => {
      if (debug) {
        console.log(`[DebouncedMethod:${target.constructor.name}.${propertyKey}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      const context = this;
      
      // Cria uma chave única para esta instância e método
      const instanceKey = `${contextKey}_${propertyKey}`;
      
      // Recupera ou cria o mapa de timers para esta instância
      let instanceTimers = timers.get(context);
      if (!instanceTimers) {
        instanceTimers = {};
        timers.set(context, instanceTimers);
      }

      // Limpa o timer anterior se existir
      const existingTimer = instanceTimers[instanceKey];
      if (existingTimer) {
        clearTimeout(existingTimer);
        log(`Timer anterior cancelado para ${instanceKey}`);
      }

      // Decide se executa imediatamente ou agenda
      const callNow = immediate && !existingTimer;
      
      if (callNow) {
        log(`Executando imediatamente ${instanceKey}`);
        originalMethod.apply(context, args);
      }

      // Cria novo timer
      instanceTimers[instanceKey] = setTimeout(() => {
        if (!callNow) {
          log(`Executando método após debounce de ${wait}ms para ${instanceKey}`);
          originalMethod.apply(context, args);
        }
        
        // Limpa referência do timer
        instanceTimers[instanceKey] = null;
      }, wait);
      
      log(`Método agendado com debounce de ${wait}ms para ${instanceKey}`);
    };

    return descriptor;
  };
}
