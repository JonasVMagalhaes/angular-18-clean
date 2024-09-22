import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';
import {ScheduleComponent} from "./components/calendar/schedule.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    ScheduleComponent
  ],
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  protected readonly RouteEnum = RouteEnum;

  constructor(private readonly router: Router) {}

  goTo(path: RouteEnum): void {
    this.router.navigate([path]);
  }
}
