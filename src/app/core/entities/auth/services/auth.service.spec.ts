import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { provideHttpClient } from "@angular/common/http";
import { Auth } from "@entities/auth/dtos/auth";
import { tap } from "rxjs";
import { HttpTestingController, provideHttpClientTesting, TestRequest } from "@angular/common/http/testing";
import { AuthCredentials } from "@entities/auth/models/auth-credentials.interface";
import { Primitive } from "@enums/primitives/primitive.enum";

describe(AuthService.name, () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signIn', () => {
    let spyToDto: jasmine.Spy;
    let spyFromDto: jasmine.Spy;
    let spyExecuteSuccess: jasmine.Spy;

    const authCredentials: AuthCredentials = {
      password: 'password',
      username: 'username'
    }

    beforeEach(() => {
      spyToDto = spyOn(Auth, 'toDto');
      spyFromDto = spyOn(Auth, 'fromDto');
      spyExecuteSuccess = spyOn(service['signInterceptorsService'], 'executeSuccess').and.callFake(() => {});
    });

    it("must bem call dtos", () => {
      service.signIn(authCredentials)
        .subscribe(() => {
          expect(spyToDto).toHaveBeenCalledTimes(1);
          expect(spyFromDto).toHaveBeenCalledTimes(1);
        });

      const req: TestRequest = httpTesting.expectOne({
        method: 'POST',
        url: Primitive.SIGN
      });

      req.flush({} as Auth);
    });

    it("must be call executeSuccess", () => {
      service.signIn(authCredentials)
        .subscribe({
          next: () => expect(spyExecuteSuccess).toHaveBeenCalledTimes(1),
          error: () => fail("Should be successfully")
        });

      const req: TestRequest = httpTesting.expectOne({
        method: 'POST',
        url: Primitive.SIGN
      });

      req.flush({} as Auth);
    });

    it("must be not call executeSuccess", () => {
      const errorMessage = 'Requisition error';

      service.signIn(authCredentials)
        .subscribe({
          next: () => fail("Should be fail with error 401"),
          error: () => expect(spyExecuteSuccess).toHaveBeenCalledTimes(0)
        });

      const req: TestRequest = httpTesting.expectOne({
        method: 'POST',
        url: Primitive.SIGN
      });

      req.flush(errorMessage, { status: 401, statusText: "Unauthenticated error" })
    });
  });
});
