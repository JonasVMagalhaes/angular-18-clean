import { Observable, isObservable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * Interface de opções do decorator Distinct
 */
export interface DistinctOptions {
  /**
   * Função de comparação personalizada para determinar igualdade
   * Se não fornecido, usa comparação de igualdade padrão (===)
   */
  comparator?: (previous: any, current: any) => boolean;
  
  /**
   * Função de seleção para extrair o valor a ser comparado
   * Se não fornecido, usa o valor inteiro
   */
  selector?: (value: any) => any;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que aplica o operador distinctUntilChanged ao Observable retornado.
 * Filtra emissões repetidas de acordo com a comparação de valores.
 * 
 * Características:
 * - Evita processamento desnecessário de valores repetidos
 * - Permite comparação personalizada e seleção de propriedades
 * - Útil para otimizar reatividade em interfaces de usuário
 * - Reduz o número de renderizações ou atualizações de estado
 * 
 * @example
 * ```typescript
 * // Filtra valores iguais consecutivos
 * @Distinct()
 * getUserStatus(userId: string): Observable<UserStatus> {
 *   return this.userService.getStatus(userId);
 * }
 * 
 * // Compara apenas por uma propriedade específica
 * @Distinct({
 *   selector: (product: Product) => product.price
 * })
 * getProductPrice(productId: string): Observable<Product> {
 *   return this.productService.getProduct(productId);
 * }
 * 
 * // Comparador personalizado
 * @Distinct({
 *   comparator: (prev, curr) => 
 *     prev.id === curr.id && prev.version === curr.version
 * })
 * getDocumentVersion(docId: string): Observable<Document> {
 *   return this.documentService.getDocument(docId);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function Distinct(options: DistinctOptions = {}) {
  const {
    comparator,
    selector,
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
        console.log(`[Distinct:${methodName}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (isObservable(result)) {
        log('Aplicando distinctUntilChanged');
        
        // Configura o operador de acordo com as opções
        if (comparator && selector) {
          return result.pipe(
            distinctUntilChanged((prev, curr) => 
              comparator(selector(prev), selector(curr))
            )
          );
        } else if (comparator) {
          return result.pipe(distinctUntilChanged(comparator));
        } else if (selector) {
          return result.pipe(distinctUntilChanged(
            (prev, curr) => prev === curr,
            selector
          ));
        } else {
          return result.pipe(distinctUntilChanged());
        }
      }
      
      return result;
    };

    return descriptor;
  };
}
