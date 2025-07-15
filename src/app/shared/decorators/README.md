# Decorators Utilitários

Este documento descreve os decorators utilitários disponíveis no projeto e como utilizá-los para aumentar a produtividade.

## Índice

- [Cache e Compartilhamento](#cache-e-compartilhamento)
  - [Cache](#cache)
  - [ShareReplay](#sharereplay)
  - [ShareExecution](#shareexecution)
  - [BlockUntilComplete](#blockuntilcomplete)
- [Tratamento de Erros](#tratamento-de-erros)
  - [ErrorHandling](#errorhandling)
  - [WithFallback](#withfallback)
  - [Retry](#retry)
- [Performance](#performance)
  - [Throttle](#throttle)
  - [Debounce](#debounce)
  - [Measure](#measure)
- [Logging](#logging)
  - [Log](#log)
- [Combinando Decorators](#combinando-decorators)

## Cache e Compartilhamento

### Cache

O decorator `Cache` permite armazenar resultados de métodos para evitar chamadas repetidas à API ou operações caras.

```typescript
import { Cache, clearCache } from '~shared/decorators';

@Injectable()
export class EmployeeService {
  // Cache com expiração de 5 minutos
  @Cache({ expirationTime: 5 * 60 * 1000 })
  getEmployeeData(employeeId: string): Observable<EmployeeData> {
    return this.http.get<EmployeeData>(`/api/employees/${employeeId}`);
  }
  
  // Cache com chave personalizada
  @Cache({
    keyGenerator: (employeeId, date) => `${employeeId}_${date.getMonth()}`
  })
  getEmployeeReport(employeeId: string, date: Date): Observable<Report> {
    return this.http.get<Report>(`/api/reports/employees/${employeeId}?month=${date.getMonth()}`);
  }
  
  // Exemplo de limpeza de cache
  clearEmployeeCache() {
    clearCache(this, 'getEmployeeData');
  }
}
```

### ShareReplay

O decorator `ShareReplay` permite compartilhar a execução de métodos que retornam Observable ou Promise, evitando chamadas múltiplas para a mesma operação e mantendo o resultado em cache pelo tempo especificado.

```typescript
import { ShareReplay, Duration } from '~shared/decorators';

@Injectable()
export class DataService {
  // Compartilha a execução e mantém o resultado por 5 segundos
  @ShareReplay(5000)
  loadInitialData(): Observable<Data> {
    return this.http.get<Data>('/api/data');
  }
  
  // Compartilha a execução e mantém o resultado indefinidamente
  @ShareReplay(Duration.INDETERMINATED)
  loadConfiguration(): Observable<Config> {
    return this.http.get<Config>('/api/config');
  }
  
  // Configuração avançada com chave de cache personalizada
  @ShareReplay({
    duration: 10 * 60 * 1000, // 10 minutos
    keyGenerator: (country, category) => `${country}_${category}`,
    bufferSize: 1,
    debug: true
  })
  getProductsByCountry(country: string, category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`/api/products/${country}/${category}`);
  }
}
```

### ShareExecution

O decorator `ShareExecution` compartilha a execução de métodos que retornam Observable ou Promise durante uma única chamada. Diferente do `ShareReplay`, o resultado não é mantido em cache após a conclusão.

```typescript
import { ShareExecution } from '~shared/decorators';

@Injectable()
export class DataService {
  // Compartilha a execução durante operações concorrentes
  @ShareExecution()
  fetchUserData(userId: string): Observable<UserData> {
    return this.http.get<UserData>(`/api/users/${userId}`);
  }
  
  // Compartilha com chave personalizada
  @ShareExecution({
    keyGenerator: (id, options) => `${id}_${options.includeDetails}`,
    bufferSize: 1,
    debug: false
  })
  loadReport(id: string, options: ReportOptions): Observable<Report> {
    return this.http.post<Report>('/api/reports/generate', { id, ...options });
  }
}
```

### BlockUntilComplete

O decorator `BlockUntilComplete` impede execuções simultâneas de um método, bloqueando chamadas subsequentes até que a primeira seja concluída.

```typescript
import { BlockUntilComplete } from '~shared/decorators';

@Injectable()
export class PaymentService {
  // Configuração básica - bloqueia chamadas durante execução
  @BlockUntilComplete()
  processPayment(payment: Payment): Observable<PaymentResult> {
    return this.http.post<PaymentResult>('/api/payments', payment);
  }
  
  // Configuração avançada com notificação
  @BlockUntilComplete({
    blockMessage: 'Operação já está em andamento',
    returnEmpty: true,
    onBlock: (methodName, args) => {
      this.notificationService.info('Aguarde, já existe um processamento em andamento');
      console.log(`Método ${methodName} bloqueado com argumentos:`, args);
    },
    debug: true
  })
  submitForm(formData: FormData): Observable<SubmitResult> {
    return this.http.post<SubmitResult>('/api/forms/submit', formData);
  }
}
```

## Tratamento de Erros

### ErrorHandling

O decorator `ErrorHandling` adiciona tratamento de erros e retentativas em métodos que retornam Observable.

```typescript
import { ErrorHandling } from '~shared/decorators';

@Injectable()
export class ApiService {
  // Tentar 3 vezes antes de falhar
  @ErrorHandling(3)
  fetchData(): Observable<Data> {
    return this.http.get<Data>('/api/data');
  }
  
  // Tentar 2 vezes e tratar erro personalizado
  @ErrorHandling(2, (error, source) => {
    this.logger.error('Falha ao carregar dados', error);
    this.messageService.error('Não foi possível carregar os dados.');
    return throwError(() => new CustomError('Falha ao carregar dados', error));
  })
  fetchCriticalData(): Observable<CriticalData> {
    return this.http.get<CriticalData>('/api/critical-data');
  }
}
```

### WithFallback

O decorator `WithFallback` permite definir um valor alternativo em caso de erro.

```typescript
import { WithFallback } from '~shared/decorators';

@Injectable()
export class ProductService {
  // Em caso de erro, retorna um array vazio
  @WithFallback([])
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products');
  }
  
  // Tenta 2 vezes e retorna um objeto padrão em caso de falha
  @WithFallback({ id: '0', name: 'Default User' }, 2)
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`/api/users/${userId}`);
  }
}
```

### Retry

O decorator `Retry` implementa retentativa com backoff exponencial para operações de rede.

```typescript
import { Retry } from '~shared/decorators';

@Injectable()
export class SyncService {
  // Configuração básica (3 tentativas)
  @Retry()
  fetchRemoteData(): Observable<RemoteData> {
    return this.http.get<RemoteData>('/api/data');
  }
  
  // Configuração avançada
  @Retry({
    maxRetries: 5,
    initialInterval: 1000,
    backoffFactor: 2,
    maxInterval: 30000,
    shouldRetry: (err) => err.status === 429 || err.status === 503,
    logRetry: true
  })
  synchronizeData(): Observable<SyncResult> {
    return this.http.post<SyncResult>('/api/sync', {});
  }
}
```

## Performance

### Throttle

O decorator `Throttle` limita a execução de métodos a uma vez a cada intervalo especificado.

```typescript
import { Throttle } from '~shared/decorators';

@Component({...})
export class ScrollComponent {
  // Limitar a uma chamada a cada 500ms
  @Throttle(500)
  handleScroll(event: Event): void {
    // Processamento pesado que não deve ser executado a cada evento de scroll
    this.processScrollData(event);
  }
}
```

### Debounce

O decorator `Debounce` atrasa a execução do método até que um certo tempo tenha passado sem chamadas adicionais.

```typescript
import { Debounce } from '~shared/decorators';

@Component({...})
export class SearchComponent {
  // Esperar 300ms de inatividade antes de fazer a busca
  @Debounce(300)
  searchProducts(term: string): Observable<Product[]> {
    return this.productService.search(term);
  }
  
  // Executar imediatamente na primeira chamada e depois aplicar debounce
  @Debounce(500, true)
  saveChanges(formData: any): void {
    this.dataService.save(formData);
  }
}
```

### Measure

O decorator `Measure` mede o tempo de execução de um método e pode gerar alertas quando o tempo excede um limite.

```typescript
import { Measure } from '~shared/decorators';

@Injectable()
export class ReportService {
  // Medição simples
  @Measure()
  processData(data: any[]): Observable<ProcessedData> {
    // Processamento complexo...
    return result$;
  }
  
  // Medição com limite de 1 segundo e relatório
  @Measure({
    name: 'ReportGenerator',
    threshold: 1000,
    reportToTelemetry: true,
    reporter: (metric) => {
      if (metric.executionTime > 2000) {
        this.alertService.warn(`Operação lenta: ${metric.methodName} levou ${metric.executionTime}ms`);
      }
    }
  })
  generateLargeReport(filters: ReportFilters): Observable<Report> {
    // Geração de relatório...
    return report$;
  }
}
```

## Logging

### Log

O decorator `Log` adiciona logs de entrada e saída de métodos para depuração e monitoramento.

```typescript
import { Log } from '~shared/decorators';

@Injectable()
export class UserService {
  // Log básico
  @Log()
  getUserData(userId: string): Observable<UserData> {
    return this.http.get<UserData>(`/api/users/${userId}`);
  }
  
  // Log completo
  @Log({
    name: 'UserService.fetchProfile',
    logArguments: true,
    logResult: true,
    logTiming: true,
    entryLogLevel: 'info',
    exitLogLevel: 'info',
    filter: (userId) => userId.startsWith('admin-')
  })
  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`/api/users/${userId}`);
  }
}
```

## Combinando Decorators

É possível combinar múltiplos decorators para obter funcionalidades avançadas. A ordem de declaração é importante, pois os decorators são aplicados de baixo para cima.

### Cenário 1: Operação de Leitura Otimizada

```typescript
// Cache + Retry + Fallback + Logging
@Cache(5 * 60 * 1000) // 5 minutos de cache
@Retry({ 
  maxRetries: 3,
  backoffFactor: 1.5 
}) // Tentativas com backoff exponencial
@WithFallback([]) // Array vazio em caso de falha
@Log({ 
  name: 'DataService.getProducts', 
  logTiming: true 
}) // Monitoramento
getProducts(category: string): Observable<Product[]> {
  return this.http.get<Product[]>(`/api/products?category=${category}`);
}
```

### Cenário 2: Operação de Escrita Segura

```typescript
// Bloqueio de chamadas simultâneas + Medição + Retry
@BlockUntilComplete({
  onBlock: () => this.notificationService.info('Operação em andamento...')
}) // Evita cliques duplos
@Measure({
  threshold: 2000,
  reportToTelemetry: true
}) // Monitoramento de performance
@Retry({
  maxRetries: 2,
  shouldRetry: err => err.status >= 500
}) // Tentativas para erros de servidor
@Log({
  name: 'PaymentService.processPayment',
  entryLogLevel: 'warn',
  exitLogLevel: 'info',
  logArguments: false // Não loga dados sensíveis
}) // Auditoria
processPayment(payment: Payment): Observable<PaymentResult> {
  return this.http.post<PaymentResult>('/api/payments', payment);
}
```

### Cenário 3: Compartilhamento de Estado entre Componentes

```typescript
// ShareReplay + Cache + Medição
@ShareReplay({
  duration: Duration.INDETERMINATED, // Mantém estado enquanto aplicação estiver ativa
  debug: true
})
@Measure({
  name: 'AppState.load',
  threshold: 500
})
@Cache(0) // Cache apenas durante execução
loadApplicationState(): Observable<AppState> {
  return this.http.get<AppState>('/api/app-state');
}
```

Ao combinar decorators, considere cuidadosamente a ordem e as interações entre eles para garantir o comportamento desejado.

## Decorators Avançados para Observable

### TraceOperations

O decorator `TraceOperations` permite rastrear operações em streams de Observable para facilitar debugging e monitoramento de performance.

```typescript
import { TraceOperations } from '~shared/decorators';

@Injectable()
export class AnalyticsService {
  // Rastreamento básico
  @TraceOperations({ operationName: 'carregarDados' })
  loadData(): Observable<Data[]> {
    return this.dataService.getData();
  }
  
  // Rastreamento detalhado com formatação personalizada
  @TraceOperations({
    operationName: 'buscaUsuários',
    traceLevel: 'detailed',
    valueFormatter: (users) => users.map(u => ({ id: u.id, name: u.name })),
    sendToTelemetry: true
  })
  searchUsers(filter: string): Observable<User[]> {
    return this.userService.search(filter);
  }
}
```

### CatchAndRetryWithBackoff

O decorator `CatchAndRetryWithBackoff` implementa estratégia de retry com backoff exponencial para tratar falhas transitórias em chamadas HTTP ou outras operações assíncronas.

```typescript
import { CatchAndRetryWithBackoff } from '~shared/decorators';

@Injectable()
export class ApiService {
  // Configuração básica
  @CatchAndRetryWithBackoff()
  fetchData(): Observable<Data> {
    return this.http.get<Data>('/api/data');
  }
  
  // Configuração avançada
  @CatchAndRetryWithBackoff({
    maxRetries: 5,
    initialDelay: 500,
    backoffFactor: 1.5,
    maxDelay: 10000,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],
    fallbackValue: { data: [] },
    onRetry: (err, count) => this.notifyUser(`Tentativa ${count} falhou, tentando novamente...`),
    onFailed: (err) => this.notifyUser('Serviço indisponível no momento')
  })
  importantApiCall(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>('/api/critical-operation', data);
  }
}
```

### ConditionalOperator

O decorator `ConditionalOperator` aplica operadores RxJS condicionalmente baseado em um predicado.

```typescript
import { ConditionalOperator } from '~shared/decorators';
import { debounceTime } from 'rxjs/operators';

@Injectable()
export class SearchService {
  // Propriedade da classe que controla o comportamento
  isInstantSearchMode = false;
  
  // Aplicar debounceTime apenas se o modo de busca rápida estiver desativado
  @ConditionalOperator({
    condition: 'isInstantSearchMode', // propriedade da classe
    trueOperator: source => source, // passa direto
    falseOperator: source => source.pipe(debounceTime(300)) // aplica debounce
  })
  search(term: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`/api/search?q=${term}`);
  }
}
```

### StateManager

O decorator `StateManager` automatiza gerenciamento de estado em componentes, criando um BehaviorSubject que contém o estado (dados, carregando, erro) e atualizando-o conforme o Observable original emite valores.

```typescript
import { StateManager, ManagedState } from '~shared/decorators';

@Component({...})
export class UserListComponent implements OnInit {
  // Será criado automaticamente pelo decorator
  public usersState$: BehaviorSubject<ManagedState<User[]>>;
  
  // Gerenciamento automático de estados de loading/erro
  @StateManager<User[]>()
  loadUsers(): Observable<User[]> {
    return this.userService.getUsers();
  }
  
  // Modo de mesclagem para paginação
  @StateManager<User[]>({
    stateName: 'usersState$', // mesmo estado do método anterior
    mergeData: true,
    mergeFunction: (current, newUsers) => [...(current || []), ...newUsers]
  })
  loadMoreUsers(page: number): Observable<User[]> {
    return this.userService.getUsersByPage(page);
  }
  
  ngOnInit() {
    this.loadUsers();
    
    // No template: *ngIf="usersState$ | async as state"
    // state.loading, state.data, state.error
  }
}
```

### MinimumLoadingTime

O decorator `MinimumLoadingTime` garante um tempo mínimo de loading para evitar flickering de UI e proporcionar uma experiência mais consistente ao usuário.

```typescript
import { MinimumLoadingTime } from '~shared/decorators';

@Injectable()
export class DashboardService {
  // Tempo mínimo de loading de 800ms
  @MinimumLoadingTime({ minTime: 800 })
  searchUsers(term: string): Observable<User[]> {
    return this.userService.search(term);
  }
  
  // Com transformação de resultado para state object
  @MinimumLoadingTime({
    minTime: 500,
    maxTime: 10000,
    resultTransformer: (data, timing) => ({
      data,
      timing,
      loading: false
    })
  })
  fetchDashboardData(): Observable<DashboardData> {
    return this.dashboardService.getData();
  }
}
```
