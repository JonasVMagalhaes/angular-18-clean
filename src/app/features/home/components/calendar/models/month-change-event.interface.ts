import {Moment} from "moment/moment";

export enum MonthChangeEvent {
  PREVIOUS = 'previous',
  NEXT = 'next',
  CURRENT = 'current'
};

export class MonthChange {
  event: MonthChangeEvent;
  month: Moment;
}
