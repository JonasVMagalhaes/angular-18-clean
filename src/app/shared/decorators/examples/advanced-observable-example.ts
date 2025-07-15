/**
 * Exemplos de uso dos decorators de Observable
 * 
 * Este arquivo demonstra como usar os decorators avançados de Observable
 * em um serviço Angular típico para otimizar a gestão de streams.
 */
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap, delay } from 'rxjs/operators';
import {
  // Decorators existentes
  TraceOperations,
  CatchAndRetryWithBackoff,
  StateManager,
  ConditionalOperator,
  MinimumLoadingTime,
  AutoUnsubscribe,
  
  // Novos decorators
  ObservableQueue,
  BulkOperator,
  PollingObservable,
  ObservableMemoize,
  SmartRetry
} from '~shared/decorators';

// Interfaces de exemplo
interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

interface SearchFilters {
  term: string;
  page: number;
}

/**
 * Serviço demonstrativo para uso de decorators
 */
@Injectable()
export class EmployeeServiceExample implements OnDestroy {
  // Para uso com AutoUnsubscribe
  private destroy$ = new Subject<void>();
  
  // Para uso com StateManager
  public employeeState$: BehaviorSubject<any>;
  
  // Para uso com ConditionalOperator
  public instantSearch = false;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Exemplo: TraceOperations
   * 
   * Rastreia toda a execução e fluxo de dados em logs detalhados
   */
  @TraceOperations({
    operationName: 'getEmployee',
    traceLevel: 'detailed'
  })
  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(`/api/employees/${id}`);
  }
  
  /**
   * Exemplo: CatchAndRetryWithBackoff
   * 
   * Implementa retry com backoff exponencial para falhas transitórias
   */
  @CatchAndRetryWithBackoff({
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],
    fallbackValue: []
  })
  getEmployeeList(): Observable<Employee[]> {
    return this.http.get<Employee[]>('/api/employees');
  }
  
  /**
   * Exemplo: StateManager
   * 
   * Gerencia automaticamente estados de loading/erro/dados
   */
  @StateManager<Employee[]>({
    stateName: 'employeeState$',
    emitLoadingState: true
  })
  loadEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>('/api/employees');
  }
  
  /**
   * Exemplo: ConditionalOperator
   * 
   * Aplica debounce apenas quando não estiver em modo de busca instantânea
   */
  @ConditionalOperator<Employee[]>({
    condition: 'instantSearch',
    trueOperator: source => source,
    falseOperator: source => source.pipe(debounceTime(300))
  })
  searchEmployees(term: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`/api/employees/search?q=${term}`);
  }
  
  /**
   * Exemplo: MinimumLoadingTime
   * 
   * Garante tempo mínimo de loading para evitar flickering
   */
  @MinimumLoadingTime({
    minTime: 800
  })
  getDepartmentStats(id: string): Observable<any> {
    return this.http.get<any>(`/api/departments/${id}/stats`);
  }
  
  /**
   * Exemplo: Combinando múltiplos decorators
   * 
   * Demonstra como decorators podem ser combinados para funcionalidades avançadas
   */
  //@TraceOperations({ operationName: 'employeeSearch' })
  //@StateManager<Employee[]>()
  //@MinimumLoadingTime({ minTime: 500 })
  //@ConditionalOperator<Employee[]>({
  //  condition: (filters) => filters.term.length > 3,
  //  trueOperator: source => source.pipe(debounceTime(200)),
  //  falseOperator: source => source.pipe(debounceTime(500))
  //})
  //@CatchAndRetryWithBackoff({ maxRetries: 2, fallbackValue: [] })
  //@AutoUnsubscribe()
  advancedSearch(filters: SearchFilters): Observable<Employee[]> {
    return this.http.post<Employee[]>('/api/employees/advanced-search', filters)
      .pipe(
        tap(results => console.log(`Encontrados ${results.length} resultados`)),
        map(results => results.filter(emp => emp.id !== 'admin'))
      );
  }
  
  /**
   * Exemplo: ObservableQueue
   * 
   * Serializa execução de operações, garantindo que apenas uma seja executada por vez
   */
  @ObservableQueue({
    queueId: 'employee-operations',
    onEnqueue: (length) => console.log(`${length} operações aguardando na fila`)
  })
  saveEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>('/api/employees', employee).pipe(
      delay(1000) // Simulando operação demorada
    );
  }
  
  /**
   * Exemplo: BulkOperator
   * 
   * Processa coleções grandes em lotes menores
   */
  @BulkOperator<Employee, any>({
    batchSize: 20,
    parallel: true,
    maxConcurrent: 3,
    onBatchStart: (batch, index) => console.log(`Processando lote ${index + 1}`)
  })
  syncMultipleEmployees(employees: Employee[]): Observable<any[]> {
    return this.http.post<any[]>('/api/employees/sync', employees);
  }
  
  /**
   * Exemplo: PollingObservable
   * 
   * Implementa polling automático até que uma condição seja atendida
   */
  @PollingObservable<any>({
    interval: 2000,
    maxAttempts: 10,
    stopPredicate: (status) => status.completed === true
  })
  checkImportStatus(importId: string): Observable<any> {
    return this.http.get<any>(`/api/imports/${importId}/status`);
  }
  
  /**
   * Exemplo: ObservableMemoize
   * 
   * Memoiza resultados para evitar cálculos repetidos
   */
  @ObservableMemoize({
    expirationTime: 5 * 60 * 1000, // 5 minutos
    maxSize: 20
  })
  getEmployeeAnalytics(departmentId: string): Observable<any> {
    console.log('Calculando analytics - operação pesada');
    return this.http.get<any>(`/api/analytics/departments/${departmentId}`);
  }
  
  /**
   * Exemplo: SmartRetry
   * 
   * Implementa retry com estratégias avançadas
   */
  @SmartRetry({
    maxRetries: 4,
    strategy: 'fibonacci',
    initialDelay: 1000,
    maxDelay: 10000,
    beforeRetry: (err, count, delay) => console.log(`Tentativa ${count} falhou. Próxima em ${delay}ms`)
  })
  fetchEmployeeSchedule(employeeId: string): Observable<any> {
    return this.http.get<any>(`/api/employees/${employeeId}/schedule`);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
