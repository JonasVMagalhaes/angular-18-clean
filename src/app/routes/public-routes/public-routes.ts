import { Routes } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';
import { LoginComponent } from '@features/login/login.component';
import { RecoveryPasswordComponent } from '@features/recovery-password/recovery-password.component';
import { RegisterComponent } from '@features/register/register.component';
import { ResetPasswordComponent } from '@features/reset-password/reset-password.component';

export const publicRoutes: Routes = [
  {
    path: RouteEnum.EMPTY,
    title: 'Project name',
    pathMatch: 'full',
    loadComponent: () => LoginComponent,
  },
  {
    path: RouteEnum.LOGIN,
    redirectTo: RouteEnum.EMPTY,
  },
  {
    path: RouteEnum.REGISTER,
    title: 'Register',
    loadComponent: () => RegisterComponent,
  },
  {
    path: RouteEnum.RECOVERY_PASSWORD,
    title: 'Recovery Password',
    loadComponent: () => RecoveryPasswordComponent,
  },
  {
    path: RouteEnum.RESET_PASSWORD,
    title: 'Reset Password',
    loadComponent: () => ResetPasswordComponent,
  }
];
