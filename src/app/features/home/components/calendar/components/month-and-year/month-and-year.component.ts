import {Component, OnInit} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import moment from "moment";


@Component({
  selector: 'app-month-and-year',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './month-and-year.component.html',
  styleUrl: './month-and-year.component.scss'
})
export class MonthAndYearComponent implements OnInit {
  indexSelectMonth: number = moment().month();

  private readonly months: string[] = moment.months();

  ngOnInit(): void {
  }

  getCurrentMonth(): string {
    return this.months[this.indexSelectMonth];
  }

  selectNextMonth(): void {
    this.indexSelectMonth++;

    if(this.indexSelectMonth >= this.months.length) {
      this.indexSelectMonth = 0;
    }
  }

  selectPreviousMonth(): void {
    this.indexSelectMonth--;

    if(this.indexSelectMonth < 0) {
      this.indexSelectMonth = 11;
    }
  }
}
