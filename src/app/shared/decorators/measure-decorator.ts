import { Observable, from } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

interface PerformanceMetric {
  methodName: string;
  timestamp: number;
  executionTime: number;
  success: boolean;
}

interface MeasureOptions {
  /**
   * Nome personalizado para o método (opcional)
   */
  name?: string;
  
  /**
   * Limite de tempo em ms considerado aceitável
   */
  threshold?: number;
  
  /**
   * Se true, envia métricas para um serviço de telemetria
   */
  reportToTelemetry?: boolean;
  
  /**
   * Função para relatório personalizado de desempenho
   */
  reporter?: (metric: PerformanceMetric) => void;
}

// Armazena métricas para análise posterior
const performanceData: PerformanceMetric[] = [];

/**
 * Retorna todas as métricas de desempenho coletadas
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...performanceData];
}

/**
 * Limpa todas as métricas de desempenho armazenadas
 */
export function clearPerformanceMetrics(): void {
  performanceData.length = 0;
}

/**
 * Decorador que mede o tempo de execução de um método
 * Pode relatar quando o tempo excede um limite definido
 * 
 * @example
 * // Medição simples
 * @Measure()
 * public processEmployeeData(data: EmployeeData): Observable<ProcessedData> {...}
 * 
 * @example
 * // Medição com limite de 1 segundo e relatório
 * @Measure({
 *   name: 'ReportGenerator',
 *   threshold: 1000,
 *   reportToTelemetry: true,
 *   reporter: (metric) => {
 *     if (metric.executionTime > 2000) {
 *       this.alertService.warn(`Operação lenta: ${metric.methodName} levou ${metric.executionTime}ms`);
 *     }
 *   }
 * })
 * public generateLargeReport(filters: ReportFilters): Observable<Report> {...}
 */
export function Measure(options: MeasureOptions = {}) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    const {
      name = `${target.constructor.name}.${propertyKey}`,
      threshold,
      reportToTelemetry = false,
      reporter
    } = options;
    
    descriptor.value = function(...args: any[]) {
      const startTime = performance.now();
      let success = true;
      
      try {
        const result = originalMethod.apply(this, args);
        
        // Tratamento para Observable
        if (result instanceof Observable) {
          return result.pipe(
            finalize(() => {
              const endTime = performance.now();
              const executionTime = endTime - startTime;
              
              const metric: PerformanceMetric = {
                methodName: name,
                timestamp: Date.now(),
                executionTime,
                success
              };
              
              handlePerformanceMetric(metric, threshold, reportToTelemetry, reporter);
            }),
            tap({
              error: () => {
                success = false;
              }
            })
          );
        }
        
        // Tratamento para Promise
        if (result instanceof Promise) {
          return from(result
            .then(value => {
              const endTime = performance.now();
              const executionTime = endTime - startTime;
              
              const metric: PerformanceMetric = {
                methodName: name,
                timestamp: Date.now(),
                executionTime,
                success: true
              };
              
              handlePerformanceMetric(metric, threshold, reportToTelemetry, reporter);
              
              return value;
            })
            .catch(error => {
              const endTime = performance.now();
              const executionTime = endTime - startTime;
              
              const metric: PerformanceMetric = {
                methodName: name,
                timestamp: Date.now(),
                executionTime,
                success: false
              };
              
              handlePerformanceMetric(metric, threshold, reportToTelemetry, reporter);
              
              throw error;
            })).toPromise();
        }
        
        // Tratamento para método síncrono
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        const metric: PerformanceMetric = {
          methodName: name,
          timestamp: Date.now(),
          executionTime,
          success: true
        };
        
        handlePerformanceMetric(metric, threshold, reportToTelemetry, reporter);
        
        return result;
      } catch (error) {
        success = false;
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        const metric: PerformanceMetric = {
          methodName: name,
          timestamp: Date.now(),
          executionTime,
          success: false
        };
        
        handlePerformanceMetric(metric, threshold, reportToTelemetry, reporter);
        
        throw error;
      }
    };
    
    return descriptor;
  };
}

function handlePerformanceMetric(
  metric: PerformanceMetric,
  threshold?: number,
  reportToTelemetry?: boolean,
  reporter?: (metric: PerformanceMetric) => void
): void {
  // Armazenar para análise
  performanceData.push(metric);
  
  // Verificar se excedeu o limite
  if (threshold && metric.executionTime > threshold) {
    console.warn(`⚠️ Desempenho: ${metric.methodName} executou em ${metric.executionTime.toFixed(2)}ms, acima do limite de ${threshold}ms`);
  }
  
  // Enviar para telemetria se configurado
  if (reportToTelemetry) {
    // Integração com o serviço de telemetria da empresa
    // Exemplo: this.telemetryService.trackPerformanceMetric(metric);
    console.log(`📊 [Telemetria] ${metric.methodName}: ${metric.executionTime.toFixed(2)}ms, sucesso: ${metric.success}`);
  }
  
  // Executar reporter personalizado
  if (reporter && typeof reporter === 'function') {
    reporter(metric);
  }
}
