/**
 * Exemplos de uso dos decorators de Observable
 * 
 * Este arquivo demonstra como usar os novos decorators de Observable
 * em um serviço Angular típico para otimizar a gestão de streams.
 */
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';

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
  //@TraceOperations({
  //  operationName: 'getEmployee',
  //  traceLevel: 'detailed'
  //})
  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(`/api/employees/${id}`);
  }
  
  /**
   * Exemplo: CatchAndRetryWithBackoff
   * 
   * Implementa retry com backoff exponencial para falhas transitórias
   */
  //@CatchAndRetryWithBackoff({
  //  maxRetries: 3,
  //  initialDelay: 1000,
  //  backoffFactor: 2,
  //  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  //  fallbackValue: []
  //})
  getEmployeeList(): Observable<Employee[]> {
    return this.http.get<Employee[]>('/api/employees');
  }
  
  /**
   * Exemplo: StateManager
   * 
   * Gerencia automaticamente estados de loading/erro/dados
   */
  //@StateManager<Employee[]>({
  //  stateName: 'employeeState$',
  //  emitLoadingState: true
  //})
  loadEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>('/api/employees');
  }
  
  /**
   * Exemplo: ConditionalOperator
   * 
   * Aplica debounce apenas quando não estiver em modo de busca instantânea
   */
  //@ConditionalOperator<Employee[]>({
  //  condition: 'instantSearch',
  //  trueOperator: source => source,
  //  falseOperator: source => source.pipe(debounceTime(300))
  //})
  searchEmployees(term: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`/api/employees/search?q=${term}`);
  }
  
  /**
   * Exemplo: MinimumLoadingTime
   * 
   * Garante tempo mínimo de loading para evitar flickering
   */
  //@MinimumLoadingTime({
  //  minTime: 800
  //})
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
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
