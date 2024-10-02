import {PrimitiveScheduleResponse} from "@models/primitives/schedule/schedule-response.interface";

export class Schedule {
    constructor(schedule: PrimitiveScheduleResponse) {

    }

    static fromDto(scheduleResponse: PrimitiveScheduleResponse): Schedule {
        return new Schedule(scheduleResponse);
    }
}
