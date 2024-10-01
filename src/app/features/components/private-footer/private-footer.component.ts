import { Component } from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {RouterLink} from "@angular/router";
import {RouteEnum} from "@enums/routes/route.enum";

@Component({
    selector: 'app-private-footer',
    templateUrl: './private-footer.component.html',
    standalone: true,
  imports: [
    MatIcon,
    RouterLink
  ],
    styleUrl: './private-footer.component.scss'
})
export class PrivateFooterComponent {
  readonly ROUTE_ENUM = RouteEnum;
}
