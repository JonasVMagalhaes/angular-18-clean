import {MonthChangeEvent} from "@features/home/components/calendar/models/month-change-event.interface";
import {Moment} from "moment/moment";

export class Month {
  value: Moment;
  changeMonthEvent: MonthChangeEvent;

  constructor(month: Month) {
    Object.assign(this, month);
  }
}
