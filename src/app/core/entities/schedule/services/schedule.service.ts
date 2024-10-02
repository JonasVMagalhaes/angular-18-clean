import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, map, of, switchMap, first} from 'rxjs';

import { Primitive } from '@enums/primitives/primitive.enum';
import {Schedule} from "@entities/schedule/dtos/schedule";
import {PrimitiveScheduleResponse} from "@models/primitives/schedule/schedule-response.interface";

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor(private readonly httpClient: HttpClient) {}
    getSchedule(): Observable<Schedule> {
        return of(null)
            .pipe(
              first(),
              switchMap(() => this.httpClient.get<PrimitiveScheduleResponse>(Primitive.SCHEDULE)),
              map(Schedule.fromDto)
        );
    }
}
