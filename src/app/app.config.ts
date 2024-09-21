import { ApplicationConfig } from '@angular/core';

import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import {ProvideRouter} from "./configs/provide-router/provide-router-config";
import {ProvideHttpClient} from "./configs/provide-http-client/provide-http-client-config";

export const appConfig: ApplicationConfig = {
  providers: [
    ProvideRouter.getConfig(),
    ProvideRouter.getTitleRouterStrategy(),
    ProvideHttpClient.getConfig(),
    provideClientHydration(),
    provideAnimations(),
    provideAnimationsAsync()
  ]
};
