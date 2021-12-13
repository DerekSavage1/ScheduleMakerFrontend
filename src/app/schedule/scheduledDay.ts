import { Time } from "@angular/common";

export interface ScheduledDay {
    day: string,
    shiftStart: number | null,
    shiftEnd: number | null
}