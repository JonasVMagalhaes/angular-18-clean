import { Observable, of, EMPTY, isObservable } from 'rxjs';
import { filter, finalize, tap } from 'rxjs/operators';

/**
 * Interface para configurar o comportamento do BlockUntilComplete
 */
export interface BlockUntilCompleteOptions {
  /**
   * Mensagem de log quando uma operação é bloqueada
   */
  blockMessage?: string;
  
  /**
   * Se deve retornar um Observable vazio ou um filtrado
   * Por padrão é true (retorna EMPTY)
   */
  returnEmpty?: boolean;
  
  /**
   * Ação a ser executada quando uma chamada é bloqueada
   */
  onBlock?: (methodName: string, args: any[]) => void;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que impede execuções simultâneas de um método.
 * 
 * Quando o método já está em execução e é chamado novamente, a segunda chamada
 * é bloqueada e retorna um Observable vazio ou um Observable filtrado.
 * 
 * Características:
 * - Evita execuções concorrentes do mesmo método
 * - Útil para operações que não devem ser executadas em paralelo
 * - Protege contra cliques duplos ou chamadas indevidas durante processamento
 * - Permite personalizar o comportamento quando uma chamada é bloqueada
 * 
 * @example
 * ```typescript
 * // Configuração básica - bloqueia chamadas durante execução
 * @BlockUntilComplete()
 * saveUserData(userData: UserData): Observable<SaveResult> {
 *   return this.http.post<SaveResult>('/api/users', userData);
 * }
 * 
 * // Configuração avançada com notificação
 * @BlockUntilComplete({
 *   blockMessage: 'Operação já está em andamento',
 *   onBlock: () => this.notificationService.info('Aguarde, já existe um processamento em andamento')
 * })
 * processPayment(payment: Payment): Observable<PaymentResult> {
 *   return this.paymentService.process(payment);
 * }
 * ```
 * 
 * @param options Opções de configuração do bloqueio
 */
export function BlockUntilComplete(options: BlockUntilCompleteOptions = {}) {
  const {
    blockMessage = 'Operation already in progress',
    returnEmpty = true,
    onBlock,
    debug = false
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${propertyKey}`;
    
    // Usamos um Map para rastrear o estado de execução por instância
    // Isso permite que diferentes instâncias da classe executem o método independentemente
    const executionStateMap = new WeakMap<object, boolean>();
    
    const log = (message: string) => {
      if (debug) {
        console.log(`[BlockUntilComplete:${methodName}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const instance = this;
      
      // Verifica se o método já está em execução nesta instância
      if (executionStateMap.get(instance)) {
        log(`Blocked execution: ${blockMessage}`);
        
        // Executa callback de bloqueio, se definido
        if (onBlock && typeof onBlock === 'function') {
          onBlock(methodName, args);
        }
        
        // Retorna Observable vazio ou filtrado conforme configuração
        return returnEmpty ? EMPTY : of(null).pipe(filter(Boolean));
      }

      // Executa o método original
      const result = originalMethod.apply(this, args);
      
      // Se o resultado for um Observable, configura controle de execução
      if (isObservable(result)) {
        // Marca como em execução
        executionStateMap.set(instance, true);
        log('Started execution');
        
        // Libera o bloqueio quando a execução terminar
        return result.pipe(
          tap({
            error: (err) => log(`Execution failed: ${err}`)
          }),
          finalize(() => {
            executionStateMap.set(instance, false);
            log('Completed execution');
          })
        );
      } 
      
      // Para outros tipos de retorno, simplesmente retorna o resultado
      return result;
    };

    return descriptor;
  };
}
