import { Observable, isObservable, BehaviorSubject, Subject, of } from 'rxjs';
import { map, tap, catchError, finalize, share } from 'rxjs/operators';

/**
 * Interface para estado gerenciado pelo decorator
 */
export interface ManagedState<T = any> {
  /** Dados atuais */
  data: T | null;
  
  /** Status de carregamento */
  loading: boolean;
  
  /** Erro, se houver */
  error: any | null;
  
  /** Se o fluxo já completou */
  completed: boolean;
  
  /** Timestamp da última atualização */
  lastUpdated: number | null;
}

/**
 * Interface para opções do decorator StateManager
 */
export interface StateManagerOptions<T = any> {
  /**
   * Nome do BehaviorSubject a ser usado/criado na classe
   * Por padrão é '{propertyName}State$'
   */
  stateName?: string;

  /**
   * Estado inicial
   */
  initialState?: Partial<ManagedState<T>>;
  
  /**
   * Se verdadeiro, automaticamente emite estado de loading no início
   * Por padrão é true
   */
  emitLoadingState?: boolean;
  
  /**
   * Se verdadeiro, mescla os dados em vez de substituí-los
   * (útil para acumulações ou paginação)
   * Por padrão é false
   */
  mergeData?: boolean;
  
  /**
   * Função de mesclagem para quando mergeData é true
   */
  mergeFunction?: (currentData: T | null, newData: T) => T;
  
  /**
   * Se verdadeiro, notificações de erro não completam o fluxo
   * Por padrão é true
   */
  continueOnError?: boolean;
  
  /**
   * Se deve registrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que automatiza gerenciamento de estado em componentes,
 * criando um BehaviorSubject que contém o estado (dados, carregando, erro)
 * e atualizando-o conforme o Observable original emite valores.
 * 
 * Características:
 * - Gerencia automaticamente estados de loading, erro e dados
 * - Facilita integração com templates Angular via async pipe
 * - Suporta mesclagem de dados para paginação/infinite scroll
 * - Unifica padrão de gerenciamento de estado em componentes
 * 
 * @example
 * ```typescript
 * @Component({...})
 * export class UserListComponent implements OnInit {
 *   // Será criado automaticamente pelo decorator
 *   public usersState$: BehaviorSubject<ManagedState<User[]>>;
 *   
 *   // Gerenciamento automático de estados de loading/erro
 *   @StateManager<User[]>()
 *   loadUsers(): Observable<User[]> {
 *     return this.userService.getUsers();
 *   }
 *   
 *   // Modo de mesclagem para paginação
 *   @StateManager<User[]>({
 *     stateName: 'usersState$', // mesmo estado do método anterior
 *     mergeData: true,
 *     mergeFunction: (current, newUsers) => [...(current || []), ...newUsers]
 *   })
 *   loadMoreUsers(page: number): Observable<User[]> {
 *     return this.userService.getUsersByPage(page);
 *   }
 *   
 *   ngOnInit() {
 *     this.loadUsers();
 *     
 *     // No template: *ngIf="usersState$ | async as state"
 *     // state.loading, state.data, state.error
 *   }
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function StateManager<T = any>(options: StateManagerOptions<T> = {}) {
  const {
    initialState = {},
    emitLoadingState = true,
    mergeData = false,
    continueOnError = true,
    debug = false
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${propertyKey}`;
    
    // Determina o nome do subject de estado
    const stateName = options.stateName || `${propertyKey}State$`;
    const mergeFunction = options.mergeFunction || 
      ((current: T | null, newData: T) => Array.isArray(newData) && Array.isArray(current) 
        ? [...current, ...newData] as any
        : newData);
    
    const log = (message: string) => {
      if (debug) {
        console.log(`[StateManager:${methodName}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      // Inicializa o subject de estado se não existir
      if (!this[stateName]) {
        const defaultState: ManagedState<T> = {
          data: null,
          loading: false,
          error: null,
          completed: false,
          lastUpdated: null,
          ...initialState
        };
        
        this[stateName] = new BehaviorSubject<ManagedState<T>>(defaultState);
        log(`Estado inicial criado: ${stateName}`);
      }
      
      // Obtém o estado atual
      const currentState = this[stateName].getValue();
      
      // Emite estado de loading se configurado
      if (emitLoadingState) {
        this[stateName].next({
          ...currentState,
          loading: true,
          error: null
        });
        log('Estado de carregamento emitido');
      }
      
      // Executa o método original
      const result = originalMethod.apply(this, args);
      
      if (!isObservable(result)) {
        log('Método não retornou um Observable, retornando resultado original');
        return result;
      }
      
      // Processa o fluxo de dados
      const managedResult = result.pipe(
        tap(
          // Next handler
          (data: T) => {
            const current = this[stateName].getValue();
            const mergedData = mergeData ? mergeFunction(current.data, data) : data;
            
            this[stateName].next({
              ...current,
              data: mergedData,
              loading: false,
              error: null,
              lastUpdated: Date.now()
            });
            
            log(`Dados atualizados${mergeData ? ' (mesclados)' : ''}`);
          }
        ),
        catchError(error => {
          log(`Erro capturado: ${error}`);
          
          const current = this[stateName].getValue();
          this[stateName].next({
            ...current,
            loading: false,
            error: error,
            lastUpdated: Date.now()
          });
          
          if (continueOnError) {
            // Continua o fluxo sem dados
            return of(null);
          } else {
            // Propaga o erro para o caller
            throw error;
          }
        }),
        finalize(() => {
          if (this[stateName]) {
            const current = this[stateName].getValue();
            
            if (current.loading) {
              this[stateName].next({
                ...current,
                loading: false,
                completed: true
              });
              
              log('Fluxo finalizado');
            }
          }
        }),
        // Compartilha a execução entre múltiplos subscribers
        share()
      );
      
      return managedResult;
    };

    return descriptor;
  };
}
