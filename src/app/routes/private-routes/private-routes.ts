import { RouteEnum } from '@enums/routes/route.enum';
import { HomeComponent } from '@features/home/home.component';
import {Routes} from "@angular/router";
import {ConfigurationComponent} from "@features/configuration/configuration.component";
import {ScheduleResolverService} from "../../core/resolvers/schedule-resolver.service";

export const privateRoutes: Routes = [
  {
    path: "",
    redirectTo: RouteEnum.SCHEDULE,
    pathMatch: "full",
  },
  {
    path: RouteEnum.SCHEDULE,
    title: "Bem vindo",
    resolve: {
      schedule: ScheduleResolverService
    },
    loadComponent: () => HomeComponent,
  },
  {
    path: RouteEnum.CONFIG,
    title: "Configurações",
    loadComponent: () => ConfigurationComponent,
  },
  {
    path: "**",
    redirectTo: RouteEnum.SCHEDULE,
  }
]
