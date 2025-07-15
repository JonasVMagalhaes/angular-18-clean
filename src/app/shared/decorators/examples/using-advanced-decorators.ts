import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import {
  ObservableWithProgress,
  LocalStorageCache,
  DebouncedMethod,
  FeatureToggle,
  I18nSupport,
  FormStateTracking
} from '~shared/decorators';

/**
 * Exemplo de serviço com os novos decoradores
 */
@Injectable({
  providedIn: 'root'
})
export class AdvancedOnboardingService {
  constructor(
    private http: HttpClient,
    private translateService: TranslateService,
    private featureToggleService: FeatureToggleService
  ) {}

  /**
   * Exemplo de método com suporte a rastreamento de progresso
   * - Permite monitorar o progresso do upload de documentos de onboarding
   */
  @ObservableWithProgress({
    debug: true
  })
  uploadOnboardingDocuments(employeeId: string, files: File[]): Observable<DocumentUploadResponse> {
    // O método injetou a propriedade uploadOnboardingDocumentsProgress$ neste serviço

    const formData = new FormData();
    formData.append('employeeId', employeeId);
    
    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    return this.http.post<DocumentUploadResponse>('/api/employees/documents/upload', formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      // Aqui você usaria tap para reportar o progresso:
      // tap(event => {
      //   if (event.type === HttpEventType.UploadProgress && event.total) {
      //     this.uploadOnboardingDocumentsProgress$.next(event.loaded / event.total);
      //   }
      // })
      // ... outros operadores
    );
  }

  /**
   * Exemplo de método com cache em localStorage
   * - Armazena resultados no localStorage por 24 horas
   * - Usa atualização em background para manter dados frescos
   */
  @LocalStorageCache({
    keyPrefix: 'onboarding_model_',
    ttl: 24 * 60 * 60 * 1000, // 24 horas
    backgroundRefresh: true
  })
  getOnboardingModelById(id: string): Observable<OnboardingInviteModel> {
    return this.http.get<OnboardingInviteModel>(`/api/onboarding-models/${id}`);
  }

  /**
   * Exemplo de método com controle de feature flag
   * - Só executa se a feature estiver habilitada
   * - Usa um método alternativo como fallback
   */
  @FeatureToggle({
    featureName: 'contentGenerator',
    whenDisabled: 'fallback',
    fallbackMethod: 'getBasicTemplateContent'
  })
  getGeneratedContent(model: OnboardingInviteModel): Observable<GeneratedContent> {
    return this.http.post<GeneratedContent>('/api/content-generator', model);
  }

  /**
   * Método de fallback para quando a feature de geração de conteúdo estiver desabilitada
   */
  getBasicTemplateContent(model: OnboardingInviteModel): Observable<GeneratedContent> {
    return this.http.get<GeneratedContent>(`/api/templates/basic/${model.templateId}`);
  }

  /**
   * Exemplo de método com debounce
   * - Evita múltiplas chamadas durante digitação
   */
  @DebouncedMethod({
    wait: 500,
    contextKey: 'searchEmployees'
  })
  searchEmployees(term: string): void {
    this.performEmployeeSearch(term).subscribe(results => {
      // Processa resultados...
    });
  }

  private performEmployeeSearch(term: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/employees/search?term=${term}`);
  }

  /**
   * Exemplo de método com suporte a tradução
   * - Traduz automaticamente campos específicos no objeto retornado
   */
  @I18nSupport({
    translateFields: ['title', 'description', 'welcomeMessage']
  })
  getOnboardingDialogConfig(type: string): Observable<OnboardingDialogConfig> {
    return this.http.get<OnboardingDialogConfig>(`/api/onboarding/dialog-config/${type}`).pipe(
      // No retorno, todos os campos 'title', 'description' e 'welcomeMessage'
      // que contenham chaves de tradução serão automaticamente traduzidos
    );
  }
}

/**
 * Exemplo de componente que combina vários decorators
 */
@Component({
  selector: 'app-onboarding-form',
  templateUrl: './onboarding-form.component.html'
})
@FormStateTracking({
  trackHistory: true,
  historySize: 5,
  debug: true
})
export class OnboardingFormComponent implements OnInit, OnDestroy {
  // Propriedades necessárias para o FormStateTracking
  public form: FormGroup;
  public formDirty: boolean; // Injetado pelo decorator
  public formStateChanged: Subject<{dirty: boolean, value: any}>; // Injetado pelo decorator

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private onboardingService: AdvancedOnboardingService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Exemplo de uso das propriedades injetadas pelo FormStateTracking
    this.formStateChanged.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      if (state.dirty) {
        console.log('Formulário foi modificado:', state.value);
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      departmentId: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null],
      welcomeMessage: [''],
      documents: this.fb.array([])
    });
  }

  /**
   * Exemplo de uso do método uploadOnboardingDocuments com progresso
   */
  uploadDocuments(): void {
    const employeeId = '12345';
    const files = []; // Obter arquivos selecionados
    
    // Assina o subject de progresso
    this.onboardingService.uploadOnboardingDocumentsProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        const percentage = Math.round(progress * 100);
        console.log(`Upload progress: ${percentage}%`);
        // Atualizar UI com o progresso
      });
    
    // Executa o upload
    this.onboardingService.uploadOnboardingDocuments(employeeId, files)
      .subscribe({
        next: result => {
          console.log('Upload concluído:', result);
          // Processar resultado
        },
        error: err => {
          console.error('Erro no upload:', err);
          // Tratar erro
        }
      });
  }

  /**
   * Exemplo de uso do método de pesquisa com debounce
   */
  onSearchInput(term: string): void {
    // Este método não será chamado a cada tecla, apenas após 500ms de inatividade
    this.onboardingService.searchEmployees(term);
  }

  /**
   * Exemplo de uso do método undoFormChange injetado pelo FormStateTracking
   */
  undoLastChange(): void {
    // Este método é injetado pelo decorator FormStateTracking
    (this as any).undoFormChange();
  }

  /**
   * Exemplo de uso do método resetFormToOriginal injetado pelo FormStateTracking
   */
  discardAllChanges(): void {
    // Este método é injetado pelo decorator FormStateTracking
    (this as any).resetFormToOriginal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Interfaces de exemplo para o código acima

interface DocumentUploadResponse {
  uploadedFiles: number;
  successfulUploads: string[];
  failedUploads: string[];
}

interface OnboardingInviteModel {
  id: string;
  title: string;
  description: string;
  templateId: string;
  // ... outros campos
}

interface GeneratedContent {
  welcomeMessage: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  // ... outros campos
}

interface OnboardingDialogConfig {
  title: string;
  description: string;
  welcomeMessage: string;
  buttons: Array<{
    text: string;
    action: string;
  }>;
}

// Serviço simplificado para verificação de features
@Injectable({
  providedIn: 'root'
})
class FeatureToggleService {
  private features = {
    contentGenerator: false,
    advancedAnalytics: false,
    customEmailTemplates: true
  };
  
  isFeatureEnabled(featureName: string): Observable<boolean> {
    const isEnabled = this.features[featureName] || false;
    return new Observable(observer => {
      observer.next(isEnabled);
      observer.complete();
    });
  }
}
