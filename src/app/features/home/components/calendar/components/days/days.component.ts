import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {DayComponent} from "@features/home/components/calendar/components/day/day.component";
import moment from "moment/moment";
import {UUID} from "@utils/uuid/uuid-utils";
import {DateItem} from "@features/home/components/calendar/models/date";
import {DateUtils} from "@utils/date/date-utils";
import {Scroll} from "@utils/scroller/scroller-utils";

@Component({
  selector: 'app-days',
  standalone: true,
  imports: [DayComponent],
  templateUrl: './days.component.html',
  styleUrl: './days.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DaysComponent implements OnInit, AfterViewInit {
  days: DateItem[] = [];

  ngOnInit(): void {
    this.populateDaysOfMonth(moment());
  }

  ngAfterViewInit(): void {
    this.scrollToCurrentDate();
    this.selectCurrentDay();
  }

  private populateDaysOfMonth(month: Date | string | moment.Moment): void {
    const quantityDaysOfMonth: number = moment(month).daysInMonth();
    console.log(quantityDaysOfMonth);

    for(let i: number = 0; i < quantityDaysOfMonth; i++) {
      this.addDay();
    };
  }

  private addDay(): void {
    this.days.push({
      date: moment().startOf("month").add(this.days.length, 'day'),
      id: UUID.generate()
    });
  }

  private resetDaysList(): void {
    this.days = [];
  }

  private scrollToCurrentDate(): void {
    const cardDayId: string = this.days.find((dateItem: DateItem) => DateUtils.dateIsToday(dateItem.date))?.id || "";
    const listDaysElement: HTMLElement = document.querySelector(".days-component-container") as HTMLElement;
    const cardDayElement: HTMLElement = document.getElementById(cardDayId)?.parentElement?.parentElement as HTMLElement;

    Scroll.scrollerHorizontalSmooth(cardDayElement, listDaysElement);
  }

  private selectCurrentDay(): void {
    const currentDayCardElement: HTMLElement = this.getCurrentDayCardElement();
    const inputElement: HTMLElement | null = currentDayCardElement.querySelector("input");
    inputElement?.click();
  }

  private getCurrentDayCardElement(): HTMLElement {
    const cardDayId: string = this.days.find((dateItem: DateItem) => DateUtils.dateIsToday(dateItem.date))?.id || "";
    return document.getElementById(cardDayId)?.parentElement?.parentElement as HTMLElement;
  }
}
