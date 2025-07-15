import { Observable, Subject, isObservable, from } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

/**
 * Interface para opções do decorator ObservableWithProgress
 */
export interface ObservableWithProgressOptions {
  /**
   * Função que retorna uma instância de Subject<number> para emitir o progresso
   * Se não fornecido, um novo Subject será criado para cada execução
   */
  progressSubject?: () => Subject<number>;

  /**
   * Se deve compartilhar o mesmo Subject de progresso entre todas as instâncias
   * (alternativa ao progressSubject)
   */
  shareProgressSubject?: boolean;

  /**
   * Se deve mostrar logs de debug
   */
  debug?: boolean;
}

/**
 * Decorator que adiciona suporte a rastreamento de progresso para operações Observables.
 * Útil para uploads, downloads, processamento em lote ou qualquer operação de longa duração.
 * 
 * O método decorado deve emitir eventos de progresso na forma de números entre 0 e 1 (0% a 100%).
 * 
 * Características:
 * - Cria ou reutiliza um Subject para emitir eventos de progresso
 * - Expõe o Subject através da propriedade `[methodName]Progress$` 
 * - Completa automaticamente o Subject de progresso quando a operação termina
 * 
 * @example
 * ```typescript
 * @ObservableWithProgress()
 * uploadFiles(files: File[]): Observable<UploadResult> {
 *   // O Subject de progresso estará disponível como this.uploadFilesProgress$
 *   return this.httpClient.post('/api/upload', formData, {
 *     reportProgress: true,
 *     observe: 'events'
 *   }).pipe(
 *     tap(event => {
 *       if (event.type === HttpEventType.UploadProgress && event.total) {
 *         // Emite o progresso para o Subject
 *         this.uploadFilesProgress$.next(event.loaded / event.total);
 *       }
 *     }),
 *     filter(event => event.type === HttpEventType.Response),
 *     map(event => event.body)
 *   );
 * }
 * 
 * // Uso:
 * ngOnInit() {
 *   this.service.uploadFilesProgress$.subscribe(progress => {
 *     this.progressValue = Math.round(progress * 100);
 *   });
 *   this.service.uploadFiles(this.selectedFiles).subscribe(result => {
 *     this.showSuccess('Upload concluído!');
 *   });
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function ObservableWithProgress(options: ObservableWithProgressOptions = {}) {
  const { 
    progressSubject, 
    shareProgressSubject = false,
    debug = false
  } = options;
  
  // Subject compartilhado entre todas as instâncias se shareProgressSubject=true
  let sharedProgressSubject: Subject<number> | null = null;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = propertyKey;
    const progressPropertyName = `${methodName}Progress$`;
    
    const log = (message: string) => {
      if (debug) {
        console.log(`[ObservableWithProgress:${target.constructor.name}.${methodName}] ${message}`);
      }
    };
    
    descriptor.value = function (...args: any[]) {
      // Cria ou reutiliza o Subject de progresso
      let currentProgressSubject: Subject<number>;
      
      if (shareProgressSubject) {
        if (!sharedProgressSubject) {
          sharedProgressSubject = new Subject<number>();
          log('Criado Subject de progresso compartilhado');
        }
        currentProgressSubject = sharedProgressSubject;
      } else if (progressSubject) {
        currentProgressSubject = progressSubject.call(this);
        log('Usando Subject de progresso fornecido');
      } else {
        // Cria um novo Subject para esta execução
        currentProgressSubject = new Subject<number>();
        log('Criado novo Subject de progresso');
      }
      
      // Expõe o Subject como uma propriedade da instância
      this[progressPropertyName] = currentProgressSubject;
      
      // Executa o método original
      const result = originalMethod.apply(this, args);
      let observable: Observable<any>;
      
      if (isObservable(result)) {
        observable = result;
      } else if (result instanceof Promise) {
        observable = from(result);
      } else {
        log('O método não retornou um Observable ou Promise');
        return result;
      }
      
      // Adiciona o finalize para completar o Subject quando o Observable completar
      return observable.pipe(
        finalize(() => {
          if (!shareProgressSubject) {
            log('Completando Subject de progresso');
            currentProgressSubject.complete();
          }
        })
      );
    };
    
    return descriptor;
  };
}
