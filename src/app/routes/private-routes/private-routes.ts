import { RouteEnum } from '@enums/routes/route.enum';
import { HomeComponent } from '@features/home/home.component';
import {Routes} from "@angular/router";

export const privateRoutes: Routes = [
  {
    path: RouteEnum.HOME,
    title: "Bem vindo",
    loadComponent: () => HomeComponent,
  },
  {
    path: RouteEnum.CONFIG,
    title: "Configurações",
    loadComponent: () => HomeComponent,
  },
]
