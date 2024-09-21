import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'app/shared/shared.module';
import { RegisterInterceptorsService } from './interceptors/register-interceptor';
import { RegisterService } from './services/register.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: [
    RegisterInterceptorsService,
    RegisterService
  ]
})
export class RegisterEntityModule { }
