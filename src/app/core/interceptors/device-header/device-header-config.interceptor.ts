import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { DeviceInfoEnum } from "@utils/device/device-info-enum";
import { DeviceUtils } from "@utils/device/device-utils";

import { Observable } from "rxjs";

export function deviceHeaderConfigInterceptor(originalRequest: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const request: HttpRequest<unknown> = originalRequest.clone({
        headers: originalRequest.headers
            .set(DeviceInfoEnum.DEVICE_TYPE, DeviceUtils.getOperacionalSystem())
            .set(DeviceInfoEnum.BROWSER_VERSION, navigator.appVersion)
            .set(DeviceInfoEnum.USER_AGENT, navigator.userAgent)
            .set(DeviceInfoEnum.PLATFORM, navigator.platform)
    });

    return next(request);
  }
