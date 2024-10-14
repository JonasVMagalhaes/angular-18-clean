
import { TestBed } from '@angular/core/testing';

import {AuthStoreService} from "@entities/auth/store/auth-store.service";
import {Auth} from "@entities/auth/dtos/auth";

describe(AuthStoreService.name, () => {
  let service: AuthStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe("save", () => {
    it("must be call cache.save", () => {
      const spyCacheSave = spyOn(service['cacheService'], 'save');

      service.save({} as Auth);

      expect(spyCacheSave).toHaveBeenCalledTimes(1);
    });
  });
});
