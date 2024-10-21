import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';
import { publicRouteGuard } from '@guards/public-route.guard';
import { privateRouteGuard } from '@guards/private-route.guard';
import {publicRoutes} from "../public-routes/public-routes";
import {privateRoutes} from "../private-routes/private-routes";
import {AuthService} from "@entities/auth/services/auth.service";
import {MessageService} from "@services/message/message.service";
import {HttpClientAdapterModule} from "@adapters/http-client/http-client-adapter";

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forChild([
            {
                path: RouteEnum.EMPTY,
                loadComponent: () => import('../public-routes/public-routes.component').then(m => m.PublicRoutesComponent),
                canActivateChild: [publicRouteGuard],
                children: publicRoutes,
            },
            {
                path: RouteEnum.EMPTY,
                loadComponent: () => import('../private-routes/private-routes.component').then(m => m.PrivateRoutesComponent),
                canActivateChild: [privateRouteGuard],
                children: privateRoutes
            }
        ]),
      HttpClientAdapterModule
    ],
  providers: [
    AuthService,
    MessageService
  ]
})
export class MainRouteModule { }
