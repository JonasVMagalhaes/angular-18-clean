import { Observable, isObservable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

/**
 * Interface para opções do decorator TraceOperations
 */
export interface TraceOperationsOptions {
  /**
   * Nome da operação a ser rastreada
   */
  operationName?: string;

  /**
   * Nível de detalhamento dos logs
   * - basic: apenas início e fim (default)
   * - detailed: início, fim e valores
   * - performance: inclui métricas de tempo
   */
  traceLevel?: 'basic' | 'detailed' | 'performance';
  
  /**
   * Função personalizada para formatar os valores emitidos antes do log
   * Útil para sanitizar dados sensíveis ou reduzir tamanho de logs
   */
  valueFormatter?: (value: any) => any;
  
  /**
   * Se deve registrar também erros
   * Por padrão é true
   */
  traceErrors?: boolean;
  
  /**
   * Se deve enviar logs para telemetria
   * Por padrão é false
   */
  sendToTelemetry?: boolean;
  
  /**
   * Serviço de telemetria para envio dos logs
   * Opcional, se sendToTelemetry for true
   */
  telemetryService?: any;
}

/**
 * Decorator que rastreia operações em streams de Observable para facilitar
 * debugging e monitoramento de performance.
 * 
 * Características:
 * - Registra início e fim da execução do Observable
 * - Pode registrar valores emitidos (com formatação personalizada)
 * - Mede tempo de execução para análise de performance
 * - Pode enviar métricas para sistemas de telemetria
 * - Totalmente configurável para diferentes níveis de detalhamento
 * 
 * @example
 * ```typescript
 * // Rastreamento básico
 * @TraceOperations({ operationName: 'carregarDados' })
 * loadData(): Observable<Data[]> {
 *   return this.dataService.getData();
 * }
 * 
 * // Rastreamento detalhado com formatação personalizada
 * @TraceOperations({
 *   operationName: 'buscaUsuários',
 *   traceLevel: 'detailed',
 *   valueFormatter: (users) => users.map(u => ({ id: u.id, name: u.name })),
 *   sendToTelemetry: true
 * })
 * searchUsers(filter: string): Observable<User[]> {
 *   return this.userService.search(filter);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function TraceOperations(options: TraceOperationsOptions = {}) {
  const {
    operationName,
    traceLevel = 'basic',
    valueFormatter = (value) => value,
    traceErrors = true,
    sendToTelemetry = false,
    telemetryService = null
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (!isObservable(result)) {
        return result;
      }

      const startTime = Date.now();
      console.log(`[${methodName}] Iniciando operação`);
      
      if (traceLevel === 'detailed' || traceLevel === 'performance') {
        console.log(`[${methodName}] Argumentos:`, args);
      }
      
      if (sendToTelemetry && telemetryService) {
        telemetryService.trackEvent({
          name: `${methodName}.start`,
          properties: { arguments: JSON.stringify(args) }
        });
      }

      return result.pipe(
        tap(
          // Next handler
          (value) => {
            if (traceLevel === 'detailed' || traceLevel === 'performance') {
              console.log(`[${methodName}] Valor emitido:`, valueFormatter(value));
            }
            
            if (sendToTelemetry && telemetryService) {
              telemetryService.trackEvent({
                name: `${methodName}.value`,
                properties: { hasValue: true }
              });
            }
          },
          // Error handler
          (error) => {
            if (traceErrors) {
              console.error(`[${methodName}] Erro:`, error);
              
              if (traceLevel === 'performance') {
                const duration = Date.now() - startTime;
                console.log(`[${methodName}] Falhou após ${duration}ms`);
              }
              
              if (sendToTelemetry && telemetryService) {
                telemetryService.trackException({
                  exception: error,
                  properties: { 
                    methodName,
                    duration: Date.now() - startTime
                  }
                });
              }
            }
          }
        ),
        finalize(() => {
          const duration = Date.now() - startTime;
          
          if (traceLevel === 'basic') {
            console.log(`[${methodName}] Operação finalizada`);
          } else if (traceLevel === 'performance') {
            console.log(`[${methodName}] Operação finalizada em ${duration}ms`);
          }
          
          if (sendToTelemetry && telemetryService) {
            telemetryService.trackMetric({
              name: `${methodName}.duration`,
              value: duration
            });
          }
        })
      );
    };

    return descriptor;
  };
}
