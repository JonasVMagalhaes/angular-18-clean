import {provideRouter, TitleStrategy, withComponentInputBinding} from "@angular/router";

import {routes} from "../../app.routes";
import {EnvironmentProviders} from "@angular/core";
import {TemplatePageTitleStrategy} from "./template-page-title-strategy";

export class ProvideRouter {
    static getConfig(): EnvironmentProviders {
      return provideRouter(routes, withComponentInputBinding());
    }

    static getTitleRouterStrategy() {
      return { provide: TitleStrategy, useClass: TemplatePageTitleStrategy };
    }
}
