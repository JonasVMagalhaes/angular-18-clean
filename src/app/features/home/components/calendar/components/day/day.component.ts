import {Component, Input} from '@angular/core';
import moment from "moment";
import {DateItem} from "@features/home/components/calendar/models/date";

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [],
  templateUrl: './day.component.html',
  styleUrl: './day.component.scss'
})
export class DayComponent {
  @Input({ required: true }) dateItem: DateItem;

  getDate(date: moment.Moment): any {
      return date.format("DD");
  }

  getDayName(date: moment.Moment): any {
    const days: string[] = moment.weekdays();
    return days[date.day()];
  }
}
