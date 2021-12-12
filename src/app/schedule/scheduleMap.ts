import { Time } from "@angular/common";

export interface ScheduleMap {
    id: string;
    times: number[];
    shiftStart: number | undefined;
    shiftEnd: number | undefined;
}