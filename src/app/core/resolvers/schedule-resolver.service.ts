import {Injectable} from "@angular/core";
import {MaybeAsync, Resolve} from "@angular/router";
import {Schedule} from "@entities/schedule/dtos/schedule";
import {ScheduleService} from "@entities/schedule/services/schedule.service";

@Injectable({
  providedIn: 'root'
})
export class ScheduleResolverService implements Resolve<Schedule> {
  constructor(private readonly scheduleService: ScheduleService) {}

  resolve(): MaybeAsync<Schedule> {
    return this.scheduleService.getSchedule();
  }
}
