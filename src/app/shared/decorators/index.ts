/**
 * Índice de exportação para todos os decorators disponíveis
 * 
 * Este arquivo centraliza todas as exportações de decorators para facilitar
 * a importação em outros arquivos do projeto.
 * 
 * @example
 * // Importar múltiplos decorators
 * import { Cache, Log, Measure, Retry, ShareReplay, ShareExecution } from '~shared/decorators';
 *
 * @example
 * // Exemplo de uso combinado de decorators
 * 
 * // Operação de leitura com cache e tratamento de falhas
 * @Cache(5 * 60 * 1000) // Cache por 5 minutos
 * @Retry({ maxRetries: 3 })
 * @WithFallback([]) // Retorna array vazio em caso de erro
 * @Log({ name: 'ProductService.getProducts' })
 * getProducts(category: string): Observable<Product[]> {
 *   return this.http.get<Product[]>(`/api/products?category=${category}`);
 * }
 * 
 * // Operação de escrita com controles de execução e performance
 * @BlockUntilComplete({ 
 *   onBlock: () => this.toastService.info('Processamento em andamento...') 
 * })
 * @Measure({ threshold: 1000, reportToTelemetry: true })
 * @Retry({ maxRetries: 2 })
 * @Log({ name: 'PaymentService.processPayment', entryLogLevel: 'warn' })
 * processPayment(payment: Payment): Observable<PaymentResult> {
 *   return this.http.post<PaymentResult>('/api/payments', payment);
 * }
 */

// Cache e compartilhamento de execução
export { Cache, clearCache } from './cache-decorator';
export { ShareReplay, Duration } from './share-replay-decorator';
export { ShareExecution } from './share-execution-decorator';
export { BlockUntilComplete } from './block-until-complete';

// Tratamento de erros e retentativas
export { ErrorHandling, WithFallback } from './error-handling-decorator';
export { Retry } from './retry-decorator';

// Controle de desempenho
export { Throttle, Debounce } from './performance-decorator';
export { 
  Measure, 
  getPerformanceMetrics, 
  clearPerformanceMetrics 
} from './measure-decorator';

// Logging
export { Log } from './log-decorator';

// Transformação e processamento de dados
export { Transform } from './transform-decorator';
export { Distinct } from './distinct-decorator';
export { DelayExecution } from './delay-execution-decorator';
export { Batch } from './batch-decorator';

// Gerenciamento de ciclo de vida
export { AutoUnsubscribe } from './auto-unsubscribe-decorator';

// Novos decorators para observables
export { TraceOperations } from './trace-operations-decorator';
export { CatchAndRetryWithBackoff } from './catch-and-retry-with-backoff-decorator';
export { ConditionalOperator } from './conditional-operator-decorator';
export { StateManager, ManagedState } from './state-manager-decorator';
export { MinimumLoadingTime, LoadingTiming } from './minimum-loading-time-decorator';

// Decorators adicionais para observables
export { ObservableQueue } from './observable-queue-decorator';
export { BulkOperator } from './bulk-operator-decorator';
export { PollingObservable } from './polling-observable-decorator';
export { ObservableMemoize } from './observable-memoize-decorator';
export { SmartRetry, RetryStrategy } from './smart-retry-decorator';

// Decorators avançados para casos específicos
export { ObservableWithProgress } from './observable-with-progress-decorator';
export { LocalStorageCache } from './local-storage-cache-decorator';
export { DebouncedMethod } from './debounced-method-decorator';
export { FeatureToggle } from './feature-toggle-decorator';
export { I18nSupport } from './i18n-support-decorator';
export { FormStateTracking } from './form-state-tracking-decorator';
