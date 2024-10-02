import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {PrivateHeaderComponent} from "@features/components/private-header/private-header.component";
import {PrivateFooterComponent} from "@features/components/private-footer/private-footer.component";

@Component({
  selector: 'app-private-routes',
  templateUrl: './private-routes.component.html',
  styleUrl: './private-routes.component.scss',
  standalone: true,
  imports: [
    RouterOutlet,
    PrivateHeaderComponent,
    PrivateFooterComponent
  ],
})
export class PrivateRoutesComponent {

}
