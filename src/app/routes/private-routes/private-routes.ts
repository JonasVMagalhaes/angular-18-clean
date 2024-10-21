import { Routes } from "@angular/router";

import { RouteEnum } from '@enums/routes/route.enum';
import { ConfigurationComponent } from "@features/configuration/configuration.component";

export const privateRoutes: Routes = [
  {
    path: "",
    redirectTo: RouteEnum.CONFIG,
    pathMatch: "full",
  },
  {
    path: RouteEnum.CONFIG,
    title: "Configurações",
    loadComponent: () => ConfigurationComponent,
  },
  {
    path: "**",
    redirectTo: RouteEnum.CONFIG,
  }
]
