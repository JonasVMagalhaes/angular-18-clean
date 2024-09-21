import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from './services/auth.service';
import { SignInterceptorsService } from './interceptors/sign-interceptor';
import { SharedModule } from 'app/shared/shared.module';
import { AuthStoreService } from './store/auth-store.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: [
    AuthService,
    AuthStoreService,
    SignInterceptorsService
  ]
})
export class AuthEntityModule { }
