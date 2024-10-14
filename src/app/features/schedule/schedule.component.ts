import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';
import { PatientListComponent } from "@features/schedule/components/patient/list-patient/patient-list.component";
import { ScheduleComponent } from "@features/schedule/components/calendar/schedule.component";

@Component({
  selector: 'app-home',
  templateUrl: './schedule.component.html',
  standalone: true,
  imports: [
    ScheduleComponent,
    PatientListComponent
  ],
  styleUrl: './schedule.component.scss'
})
export class ScheduleFeatureComponent {
  protected readonly RouteEnum = RouteEnum;

  constructor(private readonly router: Router) {}

  goTo(path: RouteEnum): void {
    this.router.navigate([path]);
  }
}
