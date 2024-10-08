import {provideHttpClient, withFetch, withInterceptors} from "@angular/common/http";
import {deviceHeaderConfigInterceptor} from "@interceptors/device-header/device-header-config.interceptor";
import {authInterceptor} from "@interceptors/auth/auth-interceptor";
import {EnvironmentProviders} from "@angular/core";
import {urlInterceptor} from "@interceptors/url/url-interceptor";

export class ProvideHttpClient {
  static getConfig(): EnvironmentProviders {
    return provideHttpClient(
      withFetch(),
      withInterceptors([
        deviceHeaderConfigInterceptor,
        authInterceptor,
        urlInterceptor
      ])
    )
  }
}
