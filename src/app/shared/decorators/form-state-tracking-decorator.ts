import { FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

/**
 * Interface para opções do decorator FormStateTracking
 */
export interface FormStateTrackingOptions {
  /**
   * Nome da propriedade que contém o FormGroup
   * @default 'form'
   */
  formPropertyName?: string;
  
  /**
   * Nome da propriedade onde será armazenada a flag de formulário modificado
   * @default 'formDirty'
   */
  dirtyFlagPropertyName?: string;
  
  /**
   * Nome da propriedade onde será armazenado o estado original do formulário
   * @default 'originalFormValue'
   */
  originalValuePropertyName?: string;
  
  /**
   * Nome da propriedade que será criada para emitir eventos de mudança de estado
   * @default 'formStateChanged'
   */
  stateChangedSubjectName?: string;
  
  /**
   * Tempo de debounce para notificações de mudança em ms
   * @default 300
   */
  debounceTime?: number;
  
  /**
   * Se deve restaurar o formulário ao valor original na destruição do componente
   * @default false
   */
  resetOnDestroy?: boolean;
  
  /**
   * Se deve armazenar snapshot do estado do formulário
   * @default true
   */
  trackHistory?: boolean;
  
  /**
   * Tamanho máximo do histórico
   * @default 10
   */
  historySize?: number;
  
  /**
   * Se deve mostrar logs de debug
   * @default false
   */
  debug?: boolean;
}

/**
 * Decorator para componentes que gerencia e rastreia alterações de estado em formulários Angular.
 * 
 * Características:
 * - Monitora mudanças em um FormGroup
 * - Rastreia o estado original do formulário
 * - Fornece observáveis para mudanças de estado
 * - Gerencia histórico de alterações
 * - Oferece métodos para reverter mudanças
 * 
 * Requisitos:
 * - O componente deve implementar OnInit e OnDestroy
 * - O componente deve ter uma propriedade FormGroup (por padrão, 'form')
 * 
 * @example
 * ```typescript
 * @Component({...})
 * @FormStateTracking({
 *   trackHistory: true,
 *   historySize: 5,
 *   resetOnDestroy: true
 * })
 * export class UserFormComponent implements OnInit, OnDestroy {
 *   public form: FormGroup;
 *   
 *   // Estas propriedades serão injetadas pelo decorator:
 *   // formDirty: boolean;
 *   // originalFormValue: any;
 *   // formStateChanged: Subject<{dirty: boolean, value: any}>;
 *   
 *   constructor(private fb: FormBuilder) {}
 *   
 *   ngOnInit() {
 *     this.form = this.fb.group({
 *       name: ['', Validators.required],
 *       email: ['', [Validators.required, Validators.email]]
 *     });
 *     
 *     // Escutando mudanças de estado
 *     this.formStateChanged.subscribe(state => {
 *       console.log('Form changed:', state.dirty);
 *     });
 *   }
 *   
 *   discardChanges() {
 *     // Método adicionado pelo decorator
 *     this.resetFormToOriginal();
 *   }
 *   
 *   undoLastChange() {
 *     // Método adicionado pelo decorator
 *     this.undoFormChange();
 *   }
 *   
 *   ngOnDestroy() {}
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function FormStateTracking(options: FormStateTrackingOptions = {}) {
  const {
    formPropertyName = 'form',
    dirtyFlagPropertyName = 'formDirty',
    originalValuePropertyName = 'originalFormValue',
    stateChangedSubjectName = 'formStateChanged',
    debounceTime: debounceDuration = 300,
    resetOnDestroy = false,
    trackHistory = true,
    historySize = 10,
    debug = false
  } = options;

  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    return class extends constructor {
      private formStateSubscription: Subscription;
      private formHistoryStack: any[] = [];
      
      constructor(...args: any[]) {
        super(...args);
        
        // Inicializa propriedades
        this[dirtyFlagPropertyName] = false;
        this[originalValuePropertyName] = null;
        this[stateChangedSubjectName] = new Subject<{dirty: boolean, value: any}>();
        
        // Define método para resetar o formulário para o estado original
        this['resetFormToOriginal'] = () => {
          const form: FormGroup = this[formPropertyName];
          if (form && this[originalValuePropertyName]) {
            form.patchValue(this[originalValuePropertyName]);
            form.markAsPristine();
            this[dirtyFlagPropertyName] = false;
            this.log('Formulário restaurado ao estado original');
          }
        };
        
        // Define método para desfazer última alteração
        this['undoFormChange'] = () => {
          if (trackHistory && this.formHistoryStack.length > 0) {
            const previousState = this.formHistoryStack.pop();
            const form: FormGroup = this[formPropertyName];
            
            if (form && previousState) {
              form.patchValue(previousState);
              this[dirtyFlagPropertyName] = !this.isEqual(previousState, this[originalValuePropertyName]);
              this.log(`Alteração desfeita, histórico restante: ${this.formHistoryStack.length}`);
            }
          }
        };
        
        // Método auxiliar para comparar valores
        this['isEqual'] = (value1: any, value2: any) => {
          return JSON.stringify(value1) === JSON.stringify(value2);
        };
        
        // Substitui o método ngOnInit para adicionar nosso comportamento
        const originalOnInit = this['ngOnInit'];
        this['ngOnInit'] = function() {
          // Executa o ngOnInit original
          if (originalOnInit) {
            originalOnInit.apply(this);
          }
          
          // Espera até o próximo ciclo para ter certeza que o formulário foi inicializado
          setTimeout(() => this.setupFormTracking(), 0);
        };
        
        // Substitui o método ngOnDestroy para fazer limpeza
        const originalOnDestroy = this['ngOnDestroy'];
        this['ngOnDestroy'] = function() {
          // Limpa assinaturas
          if (this.formStateSubscription) {
            this.formStateSubscription.unsubscribe();
          }
          
          // Restaura formulário se configurado
          if (resetOnDestroy) {
            this.resetFormToOriginal();
          }
          
          // Executa o ngOnDestroy original
          if (originalOnDestroy) {
            originalOnDestroy.apply(this);
          }
        };
      }
      
      /**
       * Configura o rastreamento de mudanças no formulário
       */
      private setupFormTracking() {
        const form: FormGroup = this[formPropertyName];
        
        if (!form) {
          console.warn(`[FormStateTracking] Formulário '${formPropertyName}' não encontrado na instância`);
          return;
        }
        
        // Armazena valor original
        this[originalValuePropertyName] = form.getRawValue();
        this.log('Estado original do formulário armazenado');
        
        // Assina mudanças no formulário
        this.formStateSubscription = form.valueChanges.pipe(
          debounceTime(debounceDuration),
          distinctUntilChanged()
        ).subscribe(value => {
          // Determina se o formulário está modificado
          const currentValue = form.getRawValue();
          const isDirty = !this.isEqual(currentValue, this[originalValuePropertyName]);
          
          // Atualiza flag de modificado
          this[dirtyFlagPropertyName] = isDirty;
          
          // Adiciona ao histórico se estiver rastreando
          if (trackHistory && isDirty) {
            // Adiciona apenas se for diferente da última entrada
            const lastHistoryEntry = this.formHistoryStack[this.formHistoryStack.length - 1];
            
            if (!lastHistoryEntry || !this.isEqual(currentValue, lastHistoryEntry)) {
              // Limita tamanho do histórico
              if (this.formHistoryStack.length >= historySize) {
                this.formHistoryStack.shift();
              }
              
              this.formHistoryStack.push({ ...currentValue });
              this.log(`Estado adicionado ao histórico (total: ${this.formHistoryStack.length})`);
            }
          }
          
          // Emite evento de mudança
          this[stateChangedSubjectName].next({
            dirty: isDirty,
            value: currentValue
          });
        });
      }
      
      /**
       * Logs de debug
       */
      private log(message: string) {
        if (debug) {
          console.log(`[FormStateTracking] ${message}`);
        }
      }
    };
  };
}
