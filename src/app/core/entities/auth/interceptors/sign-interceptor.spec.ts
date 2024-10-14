
import { TestBed } from '@angular/core/testing';

import {SignInterceptorsService} from "@entities/auth/interceptors/sign-interceptor";
import {Auth} from "@entities/auth/dtos/auth";

describe(SignInterceptorsService.name, () => {
  let service: SignInterceptorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignInterceptorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe("executeSuccess", () => {
    it("must be call store.save", () => {
      const spyStoreSave = spyOn(service['authStoreService'], 'save');

      service.executeSuccess({} as Auth);

      expect(spyStoreSave).toHaveBeenCalledTimes(1);
    });
  });
});
