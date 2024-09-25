import moment, {Moment} from "moment/moment";

export class DateUtils {
  static dateIsYesterday(date: Date | Moment): boolean {
    return moment(date).isSame(moment().subtract(1, 'day'), 'day');
  }

  static dateIsToday(date: Date | Moment): boolean {
    return moment(date).isSame(moment(), 'day');
  }

  static dateIsTomorrow(date: Date | Moment): boolean {
    return moment(date).isSame(moment().add(1, 'day'), 'day');
  }
}
