import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-public-routes',
  templateUrl: './public-routes.component.html',
  styleUrl: './public-routes.component.scss',
  standalone: true,
  imports: [
    RouterOutlet
  ]
})
export class PublicRoutesComponent {

}
