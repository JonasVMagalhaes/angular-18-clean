import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { publicRoutes } from './public-routes';
import { PublicRoutesComponent } from './public-routes.component';

@NgModule({
  declarations: [PublicRoutesComponent],
  imports: [
    RouterModule.forChild(publicRoutes),
  ],
})
export class PublicRoutesModule { }
