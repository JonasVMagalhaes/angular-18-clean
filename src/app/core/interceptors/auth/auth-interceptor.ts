import {HttpEvent, HttpHandlerFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {Auth} from "@entities/auth/dtos/auth";
import {KeysCacheEnum} from "@enums/keys/keys-cache.enum";
import {Primitive} from "@enums/primitives/primitive.enum";

import {CacheService} from "@services/cache/cache.service";
import {map, Observable, of, switchMap} from "rxjs";

const authenticatedPrimitives: Primitive[] = [
  Primitive.SCHEDULE,
  Primitive.PATIENT
];

function getRequestAuthenticated(request: HttpRequest<unknown>, auth_token: Auth): HttpRequest<unknown> {
  return authenticatedPrimitives.includes(request.url as Primitive) ?
    request.clone({
      headers: request.headers.set("auth_token", auth_token.accessToken)
    }) :
    request;
}

export function authInterceptor(originalRequest: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const cacheService: CacheService = inject(CacheService);
    const auth_token: Auth = JSON.parse(cacheService.getValue(KeysCacheEnum.AUTH)) as Auth;

    return of(originalRequest)
      .pipe(
        map((request: HttpRequest<unknown>) => getRequestAuthenticated(request, auth_token)),
        switchMap(next)
      )
}
