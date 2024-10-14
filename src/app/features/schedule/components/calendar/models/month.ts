import { Moment } from "moment/moment";

import { MonthChangeEvent } from "@features/schedule/components/calendar/models/month-change-event.interface";

export class Month {
  value: Moment;
  changeMonthEvent: MonthChangeEvent;

  constructor(month: Month) {
    Object.assign(this, month);
  }
}
