import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation} from '@angular/core';

import moment from "moment/moment";

import {Month} from "@features/home/components/calendar/models/month";
import {MonthChangeEvent} from "@features/home/components/calendar/models/month-change-event.interface";
import {DayComponent} from "@features/home/components/calendar/components/day/day.component";
import {Day} from "@features/home/components/calendar/models/day";
import {UUID} from "@utils/uuid/uuid-utils";
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
export class DaysComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) selectedMonth: Month;

  readonly days: Day[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['selectedMonth']) {
      this.selectedMonth = changes['selectedMonth'].currentValue;
      this.onChangeSelectedMonth();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToCurrentDate();
    this.selectCurrentMonth();
  }

  private onChangeSelectedMonth(): void {
    this.resetDaysList();
    this.populateDaysOfMonth();
    this.scrollToDateOnChangeMonth(this.selectedMonth)
  }

  private populateDaysOfMonth(): void {
    const quantityDaysOfMonth: number = this.selectedMonth.value.daysInMonth();

    for(let i: number = 0; i < quantityDaysOfMonth; i++) {
      this.addDay();
    }
  }

  private addDay(): void {
    this.days.push({
      value: moment(this.selectedMonth.value).startOf("month").add(this.days.length, 'day'),
      id: UUID.generate()
    });
  }

  private resetDaysList(): void {
    this.days.length = 0;
  }

  private selectCurrentMonth(): void {
    const cardDayId: string = this.days.find((dateItem: Day) => DateUtils.dateIsToday(dateItem.value))?.id || "";
    const currentCardDay: HTMLElement = this.getDayCardElementById(cardDayId);
    const inputCurrentCardDay: HTMLElement = currentCardDay.querySelector("input[type=radio]") as HTMLElement;

    inputCurrentCardDay.click();
  }

  private scrollToDateOnChangeMonth(selectedMonth: Month): void {
    if(selectedMonth.changeMonthEvent === MonthChangeEvent.NEXT) {
      this.scrollToFirstDate();
    }

    if(selectedMonth.changeMonthEvent === MonthChangeEvent.PREVIOUS) {
      this.scrollToLastDate();
    }
  }

  private scrollToCurrentDate(): void {
    const cardDayId: string = this.days.find((dateItem: Day) => DateUtils.dateIsToday(dateItem.value))?.id || "";
    const currentCardDay: HTMLElement = this.getDayCardElementById(cardDayId);

    Scroll.scrollerHorizontalSmooth(currentCardDay, currentCardDay.parentElement?.parentElement as HTMLElement);
  }

  private scrollToLastDate(): void {
    const listDayCardElement: HTMLElement = this.getListDayCardsElement();
    Scroll.scrollerHorizontalInstantToEnd(listDayCardElement as HTMLElement);
  }

  private scrollToFirstDate(): void {
    const listDayCardElement: HTMLElement = this.getListDayCardsElement();
    Scroll.scrollerHorizontalInstantToStart(listDayCardElement as HTMLElement);
  }

  private getListDayCardsElement(): HTMLElement {
    return document.querySelector(".days-component-container") as HTMLElement;
  }

  private getAllDayCardsInList(): NodeListOf<Element> {
    const listDaysElement: HTMLElement = this.getListDayCardsElement();
    return listDaysElement.querySelectorAll('.day-component-container');
  }

  private getInputElementFromDayCard(dayCard: HTMLElement): HTMLElement {
    return dayCard.querySelector('input[type=radio]') as HTMLElement;
  }

  private getDayCardElementById(id: string): HTMLElement {
    const dayCards: Element[] = Array.from(this.getAllDayCardsInList());
    return dayCards.find(dayCard => {
      const inputElement: HTMLElement = this.getInputElementFromDayCard(dayCard as HTMLElement);
      return inputElement.id === id;
    }) as HTMLElement;
  }
}
