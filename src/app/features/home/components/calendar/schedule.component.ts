import {Component, OnInit} from '@angular/core'

import moment, {Moment} from "moment";

import {MonthComponent} from "./components/month-and-year/month.component";
import {DaysComponent} from "@features/home/components/calendar/components/days/days.component";
import {Month} from "@features/home/components/calendar/models/month";
import {MonthChangeEvent} from "@features/home/components/calendar/models/month-change-event.interface";

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    MonthComponent,
    DaysComponent
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent implements OnInit {
  selectedMonth: Month;

  ngOnInit(): void {
    this.defineCurrentMonth();
  }

  monthChange(event: MonthChangeEvent): void {
    if(event === MonthChangeEvent.NEXT) {
      this.selectNextMonth();
    }

    if(event === MonthChangeEvent.PREVIOUS) {
      this.selectPreviousMonth();
    }
  }

  private selectNextMonth(): void {
    this.selectedMonth = {
      value: this.selectedMonth.value.add(1, 'month'),
      changeMonthEvent: MonthChangeEvent.NEXT
    }
  }

  private selectPreviousMonth(): void {
    this.selectedMonth = {
      value: this.selectedMonth.value.subtract(1, 'month'),
      changeMonthEvent: MonthChangeEvent.PREVIOUS
    }
  }

  private defineCurrentMonth(selectedMonth: Moment = moment()): void {
    this.selectedMonth = { value: selectedMonth, changeMonthEvent: MonthChangeEvent.CURRENT };
  }
}
