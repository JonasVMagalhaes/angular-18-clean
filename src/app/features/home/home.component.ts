import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  protected readonly RouteEnum = RouteEnum;

  constructor(private readonly router: Router) {}

  goTo(path: RouteEnum): void {
    this.router.navigate([path]);
  }
}
