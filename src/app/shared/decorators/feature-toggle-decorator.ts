import { Observable, of, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Interface para o service que gerencia feature toggles
 */
export interface FeatureToggleService {
  isFeatureEnabled(featureName: string): Observable<boolean>;
}

/**
 * Interface para opções do decorator FeatureToggle
 */
export interface FeatureToggleOptions {
  /**
   * Nome da feature flag
   */
  featureName: string;

  /**
   * Ação alternativa quando feature desabilitada
   * - 'throw': lança um erro
   * - 'empty': retorna Observable vazio 
   * - 'warn': exibe aviso e retorna Observable vazio
   * - 'redirect': redireciona para outra página (requer redirectTo)
   * - 'fallback': usa método alternativo (requer fallbackMethod)
   * @default 'warn'
   */
  whenDisabled?: 'throw' | 'empty' | 'warn' | 'redirect' | 'fallback';
  
  /**
   * Rota para redirecionamento quando whenDisabled='redirect'
   */
  redirectTo?: string;
  
  /**
   * Nome do método de fallback quando whenDisabled='fallback'
   */
  fallbackMethod?: string;
  
  /**
   * Mensagem de erro personalizada
   * @default 'Esta funcionalidade está desativada'
   */
  errorMessage?: string;
  
  /**
   * Se deve mostrar logs de debug
   * @default false
   */
  debug?: boolean;
  
  /**
   * Service que será injetado para verificar status da feature
   * (deve implementar FeatureToggleService)
   * @default 'featureToggleService'
   */
  toggleServiceName?: string;
}

/**
 * Decorator que condiciona a execução de um método à ativação de uma feature flag.
 * 
 * Características:
 * - Verifica se uma feature está habilitada antes de executar o método
 * - Suporta várias ações quando a feature está desabilitada
 * - Integra-se com sistema de feature toggles
 * - Permite fallback para métodos alternativos
 * 
 * Requisitos:
 * - A classe deve ter uma propriedade chamada 'featureToggleService' ou usar toggleServiceName
 *   para especificar o nome do serviço que implementa FeatureToggleService
 * - O serviço de feature toggle deve ter um método isFeatureEnabled(featureName: string): Observable<boolean>
 * 
 * @example
 * ```typescript
 * // Simples - exibe aviso quando feature desabilitada
 * @FeatureToggle({ featureName: 'contentGenerator' })
 * generateOnboardingContent(model: OnboardingModel): Observable<ContentResult> {
 *   return this.contentService.generateFor(model);
 * }
 * 
 * // Lança erro quando feature desabilitada
 * @FeatureToggle({
 *   featureName: 'customEmailTemplates',
 *   whenDisabled: 'throw',
 *   errorMessage: 'Templates personalizados não estão disponíveis para sua licença'
 * })
 * saveEmailTemplate(template: EmailTemplate): Observable<EmailTemplate> {
 *   return this.httpClient.post('/api/email-templates', template);
 * }
 * 
 * // Usa método alternativo quando feature desabilitada
 * @FeatureToggle({
 *   featureName: 'advancedAnalytics',
 *   whenDisabled: 'fallback',
 *   fallbackMethod: 'getBasicAnalytics'
 * })
 * getAdvancedAnalytics(params: AnalyticsParams): Observable<AnalyticsData> {
 *   return this.analyticsService.getAdvanced(params);
 * }
 * 
 * // Método de fallback
 * getBasicAnalytics(params: AnalyticsParams): Observable<AnalyticsData> {
 *   return this.analyticsService.getBasic(params);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function FeatureToggle(options: FeatureToggleOptions) {
  const {
    featureName,
    whenDisabled = 'warn',
    redirectTo,
    fallbackMethod,
    errorMessage = 'Esta funcionalidade está desativada',
    debug = false,
    toggleServiceName = 'featureToggleService'
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    const log = (message: string) => {
      if (debug) {
        console.log(`[FeatureToggle:${target.constructor.name}.${propertyKey}] ${message}`);
      }
    };

    descriptor.value = function (...args: any[]) {
      const service: FeatureToggleService = this[toggleServiceName];
      
      if (!service || typeof service.isFeatureEnabled !== 'function') {
        console.error(`[FeatureToggle:${propertyKey}] O serviço '${toggleServiceName}' não está disponível ou não implementa isFeatureEnabled()`);
        return originalMethod.apply(this, args);
      }
      
      // Verifica se a feature está habilitada
      return service.isFeatureEnabled(featureName).pipe(
        mergeMap(enabled => {
          if (enabled) {
            log(`Feature '${featureName}' habilitada, executando método original`);
            return originalMethod.apply(this, args);
          } else {
            log(`Feature '${featureName}' desabilitada`);
            
            // Executa ação com base na configuração whenDisabled
            switch (whenDisabled) {
              case 'throw':
                return throwError(() => new Error(errorMessage));
                
              case 'empty':
                return of(null);
                
              case 'warn':
                console.warn(`[FeatureToggle] ${errorMessage} (${featureName})`);
                return of(null);
                
              case 'redirect':
                if (redirectTo) {
                  const router = this['router'];
                  if (router && typeof router.navigate === 'function') {
                    log(`Redirecionando para ${redirectTo}`);
                    router.navigate([redirectTo]);
                  } else {
                    console.error(`[FeatureToggle:${propertyKey}] Router não disponível para redirecionamento`);
                  }
                }
                return of(null);
                
              case 'fallback':
                if (fallbackMethod && typeof this[fallbackMethod] === 'function') {
                  log(`Usando método fallback: ${fallbackMethod}`);
                  return this[fallbackMethod].apply(this, args);
                } else {
                  console.error(`[FeatureToggle:${propertyKey}] Método fallback '${fallbackMethod}' não existe`);
                  return of(null);
                }
                
              default:
                return of(null);
            }
          }
        })
      );
    };

    return descriptor;
  };
}
