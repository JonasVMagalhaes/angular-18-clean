import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PrivateRoutesComponent } from './private-routes.component';
import { privateRoutes } from './private-routes';
import {PrivateHeaderComponent} from "@features/components/private-header/private-header.component";
import {PrivateFooterComponent} from "@features/components/private-footer/private-footer.component";

@NgModule({
  declarations: [
    PrivateRoutesComponent,
  ],
  imports: [
    RouterModule.forChild(privateRoutes),
    PrivateHeaderComponent,
    PrivateFooterComponent,
  ],
})
export class PrivateRoutesModule { }
