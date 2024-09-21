import { Routes } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';
import { LoginComponent } from '@features/login/login.component';
import { RecoveryPasswordComponent } from '@features/recovery-password/recovery-password.component';
import { RegisterComponent } from '@features/register/register.component';
import { ResetPasswordComponent } from '@features/reset-password/reset-password.component';

export const publicRoutes: Routes = [
  {
    path: RouteEnum.EMPTY,
    title: "Login",
    pathMatch: 'full',
    loadComponent: () => LoginComponent,
  },
  {
    path: RouteEnum.LOGIN,
    redirectTo: RouteEnum.EMPTY,
  },
  // {
  //   path: RouteEnum.REGISTER,
  //   component: RegisterComponent,
  // },
  // {
  //   path: RouteEnum.RECOVERY_PASSWORD,
  //   component: RecoveryPasswordComponent,
  // },
  // {
  //   path: RouteEnum.RESET_PASSWORD,
  //   component: ResetPasswordComponent,
  // },
];
