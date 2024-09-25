import {Component, Input, WritableSignal} from '@angular/core';
import moment, {Moment} from "moment";
import {Month} from "@features/home/components/calendar/models/month";
import {Day} from "@features/home/components/calendar/models/day";
import {NgClass} from "@angular/common";
// import {DateItem} from "@features/home/components/calendar/models/day";

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './day.component.html',
  styleUrl: './day.component.scss'
})
export class DayComponent {
  // @Input({ required: true }) selectedMonth: WritableSignal<Month>;

  @Input({ required: true }) day: Day;
  //
  getDate(day: Day): any {
      return day.value.format("DD");
  }
  //
  getDayName(day: Day): any {
    const days: string[] = moment.weekdays();
    return days[day.value.date()];
  }
}
