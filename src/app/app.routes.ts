import { Routes } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';

export const routes: Routes = [
    {
        path: RouteEnum.EMPTY,
        loadChildren: () => import('./routes/main-route/main.route').then(m => m.MainRouteModule),
    },
    {
      path: "**",
      redirectTo: RouteEnum.EMPTY,
    }
];
