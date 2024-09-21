import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, map, of, switchMap, tap, first} from 'rxjs';

import { Primitive } from '@enums/primitives/primitive.enum';
import { PrimitiveSignInResponse } from '@models/primitives/sign-in/sign-in-response.interface';
import { SignInterceptorsService } from '../interceptors/sign-interceptor';
import { Auth } from '../dtos/auth';
import {PrimitiveSignInRequest} from "@models/primitives/sign-in/sign-in-request.interface";
import {AuthCredentials} from "@entities/auth/models/auth-credentials.interface";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private readonly httpClient: HttpClient,
              private readonly signInterceptorsService: SignInterceptorsService) {}

    signIn(credencials: AuthCredentials): Observable<Auth> {
        return of(credencials)
            .pipe(
              first(),
              map(Auth.toDto),
              switchMap((credentialsDto: PrimitiveSignInRequest) => this.httpClient.post<PrimitiveSignInResponse>(Primitive.SIGN, credentialsDto)),
              map(Auth.fromDto),
              tap({
                  next: (response: Auth) => this.signInterceptorsService.executeSuccess(response)
              }),
        );
    }
}
