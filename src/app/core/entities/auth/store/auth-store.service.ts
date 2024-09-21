import { Injectable } from '@angular/core';

import { KeysCacheEnum } from '@enums/keys/keys-cache.enum';
import { Auth } from '../dtos/auth';
import { CacheService } from '@services/cache/cache.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStoreService {
  private keyCache: KeysCacheEnum = KeysCacheEnum.AUTH;

  constructor(private readonly cacheService: CacheService) { }

  save(value: Auth): void {
    this.cacheService.save(this.keyCache, JSON.stringify(value));
  }
}
