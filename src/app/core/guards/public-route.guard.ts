import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { KeysCacheEnum } from '@enums/keys/keys-cache.enum';
import { RouteEnum } from '@enums/routes/route.enum';
import { CacheService } from '@services/cache/cache.service';
import {map, Observable, of, tap} from 'rxjs';

export const publicRouteGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const platformId: Object = inject(PLATFORM_ID);
  const cacheService: CacheService = inject(CacheService);
  const router: Router = inject(Router);

  if (isPlatformBrowser(platformId)) {
    return cacheService.get(KeysCacheEnum.AUTH)
      .pipe(
        tap((key: string) => key && router.navigate([RouteEnum.HOME])),
        map(authenticated => Boolean(!authenticated)),
      );
  } else {
    return of(false);
  }
};
