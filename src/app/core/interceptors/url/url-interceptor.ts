import {HttpEvent, HttpHandlerFn, HttpRequest} from "@angular/common/http";

import {map, Observable, of, switchMap, tap} from "rxjs";

function configureURL(request: HttpRequest<unknown>): HttpRequest<unknown> {
  return request.clone({
    url: "http://localhost:3000" + request.url,
  });
}

export function urlInterceptor(originalRequest: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return of(originalRequest)
    .pipe(
      map((request: HttpRequest<unknown>) => configureURL(request)),
      switchMap(next)
    )
}
