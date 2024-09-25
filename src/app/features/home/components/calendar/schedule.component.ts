import { Component } from '@angular/core';

import {MonthAndYearComponent} from "./components/month-and-year/month-and-year.component";
import {DaysComponent} from "@features/home/components/calendar/components/days/days.component";

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    MonthAndYearComponent,
    DaysComponent
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {

}
