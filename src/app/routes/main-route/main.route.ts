import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';
import { PublicRoutesComponent } from '../public-routes/public-routes.component';
import { PrivateRoutesComponent } from '../private-routes/private-routes.component';
import { publicRouteGuard } from '@guards/public-route.guard';
import { privateRouteGuard } from '@guards/private-route.guard';

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forChild([
            {
                path: RouteEnum.EMPTY,
                component: PublicRoutesComponent,
                loadChildren: () => import('../public-routes/public-routes.module').then(m => m.PublicRoutesModule),
                canActivateChild: [publicRouteGuard]
            },
            {
                path: RouteEnum.EMPTY,
                component: PrivateRoutesComponent,
                loadChildren: () => import('../private-routes/private-routes.module').then(m => m.PrivateRoutesModule),
                canActivateChild: [privateRouteGuard]
            }
        ])
    ],
})
export class MainRouteModule { }
