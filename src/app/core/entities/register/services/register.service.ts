import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, map, of, switchMap, tap } from 'rxjs';

import { Primitive } from '@enums/primitives/primitive.enum';
import { PrimitiveSignInResponse } from '@models/primitives/sign-in/sign-in-response.interface';
import { RegisterForm } from '@features/register/models/register-form.interface';
import { Register } from '../dtos/register';
import { RegisterInterceptorsService } from '../interceptors/register-interceptor';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  constructor(private readonly httpClient: HttpClient,
              private readonly registerInterceptorsService: RegisterInterceptorsService
  ) {}

  register(registerForm: FormGroup<RegisterForm>): Observable<Register> {
    return of(registerForm)
      .pipe(
        map(Register.toDto),
        switchMap((registerDto) => this.httpClient.post<PrimitiveSignInResponse>(Primitive.REGISTER, registerDto)),
        map(Register.fromDto),
        tap({
          next: (response) => this.registerInterceptorsService.executeSuccess(response)
        }),
      );
  }
}
