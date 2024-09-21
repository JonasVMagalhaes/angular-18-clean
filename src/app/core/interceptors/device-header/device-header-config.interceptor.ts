import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from "@angular/common/http";
import { DeviceInfoEnum } from "@utils/device/device-info-enum";
import { DeviceUtils } from "@utils/device/device-utils";

import { Observable, tap } from "rxjs";

export function deviceHeaderConfigInterceptor(originalRequest: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const request: HttpRequest<unknown> = originalRequest.clone({
        headers: originalRequest.headers
            .set(DeviceInfoEnum.DEVICE_TYPE, DeviceUtils.getOperacionalSystem())
            .set(DeviceInfoEnum.BROWSER_VERSION, navigator.appVersion)
            .set(DeviceInfoEnum.USER_AGENT, navigator.userAgent)
            .set(DeviceInfoEnum.PLATFORM, navigator.platform)
    });
    
    return next(request).pipe(
        tap({
            next: (response: HttpEvent<unknown>) => response,
            error: (response: HttpErrorResponse) => response
        })
    );
  }