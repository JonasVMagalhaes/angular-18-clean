import {HttpEvent, HttpHandlerFn, HttpRequest} from "@angular/common/http";

import {Observable} from "rxjs";
import { environment } from "../../../../environments/environment";

export function urlInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(request.clone({
    url: environment.apiUrl + request.url,
  }));
}
