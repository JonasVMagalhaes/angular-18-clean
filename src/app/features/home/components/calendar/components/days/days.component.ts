import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {DayComponent} from "@features/home/components/calendar/components/day/day.component";
import moment from "moment/moment";
import {UUID} from "@utils/uuid/uuid-utils";
import {DateItem} from "@features/home/components/calendar/models/date";
import {DateUtils} from "@utils/date/date-utils";

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
    this.populateDaysOfMonth();
  }

  ngAfterViewInit(): void {
    this.scrollToCurrentDate();
  }

  private populateDaysOfMonth(): void {
    const quantityDaysOfMonth: number = moment().daysInMonth();

    for(let i: number = 0; i < quantityDaysOfMonth; i++) {
      this.days.push({
        date: moment().startOf("month").add(i, 'day'),
        id: UUID.generate()
      });
    };
  }

  private scrollToCurrentDate(): void {
    const cardDayId: string = this.days.find((dateItem: DateItem) => DateUtils.dateIsToday(dateItem.date))?.id || "";
    const listDaysElement: Element | null = document.querySelector(".days-component-container");
    const cardDayElement: HTMLElement | null = document.getElementById(cardDayId);

    const cardDayElementRect: any = cardDayElement?.parentElement?.parentElement?.getBoundingClientRect();
    const cardDayElementWidth: number = cardDayElementRect.width;
    const windowWidth: number = window.innerWidth;

    const scrollPosition: number = cardDayElementRect.left - (windowWidth / 2) + (cardDayElementWidth / 2);

    listDaysElement?.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });

  this.selectCurrentDay(cardDayElement);
  }

  private selectCurrentDay(cardDayElement: HTMLElement | null): void {
    cardDayElement?.click();
  }
}
