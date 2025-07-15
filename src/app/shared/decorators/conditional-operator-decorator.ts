import { Observable, isObservable } from 'rxjs';

/**
 * Interface para opções do decorator ConditionalOperator
 */
export interface ConditionalOperatorOptions<T = any> {
  /**
   * Predicado que determina se o operador será aplicado
   * Pode ser uma função que avalia os argumentos do método
   * ou uma propriedade da instância
   */
  condition: ((...args: any[]) => boolean) | string;
  
  /**
   * Operador RxJS a ser aplicado quando a condição é verdadeira
   * Deve ser uma função que recebe um Observable e retorna um Observable
   */
  trueOperator: (source: Observable<T>) => Observable<any>;
  
  /**
   * Operador RxJS opcional a ser aplicado quando a condição é falsa
   * Se não fornecido, o Observable original é retornado
   */
  falseOperator?: (source: Observable<T>) => Observable<any>;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que aplica operadores RxJS condicionalmente baseado em um predicado.
 * 
 * Características:
 * - Aplica operadores RxJS dinamicamente baseado em condições
 * - Suporta avaliação de condição por função ou propriedade
 * - Permite aplicar operadores diferentes baseado na condição
 * - Facilita implementações de lógicas condicionais complexas
 * 
 * @example
 * ```typescript
 * // Aplicar debounceTime apenas se o modo de busca rápida estiver desativado
 * @ConditionalOperator({
 *   condition: 'isInstantSearchMode', // propriedade da classe
 *   trueOperator: source => source, // passa direto
 *   falseOperator: source => source.pipe(debounceTime(300)) // aplica debounce
 * })
 * search(term: string): Observable<SearchResult[]> {
 *   return this.http.get<SearchResult[]>(`/api/search?q=${term}`);
 * }
 * 
 * // Aplicar loading state apenas se um parâmetro for true
 * @ConditionalOperator({
 *   condition: (id, showLoading) => showLoading === true,
 *   trueOperator: source => concat(
 *     of({ loading: true, data: null }),
 *     source.pipe(map(data => ({ loading: false, data })))
 *   ),
 *   falseOperator: source => source.pipe(map(data => ({ loading: false, data })))
 * })
 * getItemDetails(id: string, showLoading: boolean): Observable<ItemDetails> {
 *   return this.http.get<ItemDetails>(`/api/items/${id}`);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function ConditionalOperator<T = any>(options: ConditionalOperatorOptions<T>) {
  const {
    condition,
    trueOperator,
    falseOperator,
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
        console.log(`[ConditionalOperator:${methodName}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      // Avalia a condição baseada em seu tipo
      let conditionResult: boolean;
      
      if (typeof condition === 'string') {
        // Condição é uma propriedade da instância
        conditionResult = Boolean(this[condition]);
        log(`Condição avaliada da propriedade '${condition}': ${conditionResult}`);
      } else if (typeof condition === 'function') {
        // Condição é uma função
        conditionResult = condition.apply(this, args);
        log(`Condição avaliada da função: ${conditionResult}`);
      } else {
        // Tipo de condição inválido
        console.error(`[ConditionalOperator:${methodName}] Tipo de condição inválido`);
        return originalMethod.apply(this, args);
      }
      
      const result = originalMethod.apply(this, args);
      
      if (!isObservable(result)) {
        return result;
      }
      
      // Aplica o operador apropriado baseado na condição
      if (conditionResult) {
        log('Aplicando operador para condição verdadeira');
        return trueOperator.call(this, result);
      } else if (falseOperator) {
        log('Aplicando operador para condição falsa');
        return falseOperator.call(this, result);
      } else {
        log('Condição falsa e nenhum operador alternativo definido, retornando original');
        return result;
      }
    };

    return descriptor;
  };
}
