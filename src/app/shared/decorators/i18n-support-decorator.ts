import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/**
 * Interface para opções do decorator I18nSupport
 */
export interface I18nSupportOptions {
  /**
   * Nome do serviço de tradução na instância
   * @default 'translateService'
   */
  translateServiceName?: string;
  
  /**
   * Se deve traduzir automaticamente strings no formato 'KEY.SUBKEY' que são
   * retornadas pelo método original
   * @default false
   */
  autoTranslate?: boolean;
  
  /**
   * Se deve traduzir automaticamente strings específicas dentro de objetos retornados
   * @example ['title', 'description', 'message']
   */
  translateFields?: string[];
  
  /**
   * Se deve processar todos os argumentos passados para o método original para
   * traduzir chaves de tradução contidas neles
   * @default false
   */
  processArgs?: boolean;
  
  /**
   * Se deve mostrar logs de debug
   * @default false
   */
  debug?: boolean;
}

/**
 * Decorator que facilita o uso de traduções em métodos.
 * 
 * Características:
 * - Traduz automaticamente strings de tradução retornadas pelo método
 * - Processa campos específicos em objetos retornados para tradução
 * - Pode traduzir chaves de tradução nos argumentos do método
 * - Compatível com métodos que retornam Observable, Promise ou valor direto
 * 
 * Requisitos:
 * - A classe deve ter uma propriedade chamada 'translateService' ou usar translateServiceName
 *   para especificar o nome do serviço que implementa TranslateService
 * 
 * @example
 * ```typescript
 * // Tradução automática de strings retornadas
 * @I18nSupport({ autoTranslate: true })
 * getErrorMessage(code: string): string {
 *   switch (code) {
 *     case '404': return 'ERRORS.NOT_FOUND';
 *     case '403': return 'ERRORS.FORBIDDEN';
 *     default: return 'ERRORS.UNKNOWN';
 *   }
 * }
 * 
 * // Tradução de campos específicos em objetos
 * @I18nSupport({ 
 *   translateFields: ['title', 'description', 'buttonText']
 * })
 * getDialogConfig(type: string): DialogConfig {
 *   return {
 *     title: 'DIALOG.CONFIRMATION_TITLE',
 *     description: 'DIALOG.DELETE_CONFIRMATION',
 *     buttonText: 'COMMON.CONFIRM',
 *     icon: 'warning',  // não será traduzido
 *     width: '400px'    // não será traduzido
 *   };
 * }
 * 
 * // Processamento de argumentos
 * @I18nSupport({ 
 *   processArgs: true,
 *   debug: true
 * })
 * showNotification(message: string, type: string): void {
 *   // Se message for 'SUCCESS.SAVED', será traduzido antes de chamar este método
 *   this.notificationService.show(message, type);
 * }
 * ```
 * 
 * @param options Opções de configuração
 */
export function I18nSupport(options: I18nSupportOptions = {}) {
  const {
    translateServiceName = 'translateService',
    autoTranslate = false,
    translateFields = [],
    processArgs = false,
    debug = false
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    const log = (message: string) => {
      if (debug) {
        console.log(`[I18nSupport:${target.constructor.name}.${propertyKey}] ${message}`);
      }
    };

    /**
     * Verifica se uma string é uma chave de tradução
     */
    const isTranslationKey = (value: any): boolean => {
      return typeof value === 'string' && 
             /^[A-Z0-9_]+(\.[A-Z0-9_]+)+$/i.test(value);
    };

    /**
     * Processa um valor para tradução
     */
    const processValue = async (value: any, translateService: TranslateService): Promise<any> => {
      if (!value) return value;
      
      // String simples que pode ser chave de tradução
      if (typeof value === 'string') {
        if (autoTranslate && isTranslationKey(value)) {
          return translateService.instant(value);
        }
        return value;
      }
      
      // Array - processa cada item recursivamente
      if (Array.isArray(value)) {
        return Promise.all(value.map(item => processValue(item, translateService)));
      }
      
      // Objeto - processa campos especificados
      if (typeof value === 'object' && value !== null) {
        const result = { ...value };
        
        // Processa apenas os campos especificados
        if (translateFields.length > 0) {
          for (const field of translateFields) {
            if (result.hasOwnProperty(field) && isTranslationKey(result[field])) {
              result[field] = translateService.instant(result[field]);
              log(`Traduzido campo '${field}': ${result[field]}`);
            }
          }
        }
        
        return result;
      }
      
      return value;
    };

    /**
     * Processa os argumentos do método para tradução
     */
    const processArguments = async (args: any[], translateService: TranslateService): Promise<any[]> => {
      if (!processArgs) return args;
      
      log('Processando argumentos para tradução');
      return Promise.all(args.map(arg => processValue(arg, translateService)));
    };

    descriptor.value = function (...args: any[]) {
      const translateService: TranslateService = this[translateServiceName];
      
      if (!translateService) {
        console.error(`[I18nSupport:${propertyKey}] Serviço de tradução '${translateServiceName}' não disponível`);
        return originalMethod.apply(this, args);
      }
      
      // Processa argumentos se necessário
      return new Promise(resolve => {
        processArguments(args, translateService).then(processedArgs => {
          const result = originalMethod.apply(this, processedArgs);
          resolve(result);
        });
      }).then((result: any) => {
        // Se for Observable
        if (result && typeof result.pipe === 'function') {
          return result.pipe(
            switchMap((value: any) => {
              return of(value).pipe(
                map(async (v) => await processValue(v, translateService))
              );
            })
          );
        }
        
        // Se for Promise
        if (result && typeof result.then === 'function') {
          return result.then((value: any) => processValue(value, translateService));
        }
        
        // Valor direto
        return processValue(result, translateService);
      });
    };

    return descriptor;
  };
}
