import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";

import moment from "moment";

import { Month } from "@features/schedule/components/calendar/models/month";
import { MonthChangeEvent } from '@features/schedule/components/calendar/models/month-change-event.interface';

@Component({
  selector: 'app-month-and-year',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './month.component.html',
  styleUrl: './month.component.scss'
})
export class MonthComponent {
  @Input({ required: true }) selectedMonth: Month;
  @Output() monthChange: EventEmitter<MonthChangeEvent> = new EventEmitter();

  readonly MonthChangeEvent = MonthChangeEvent;

  getMonthName(): string {
    const nameMonths: string[] = moment.months();
    return nameMonths[this.selectedMonth.value.month()]
  }
}
