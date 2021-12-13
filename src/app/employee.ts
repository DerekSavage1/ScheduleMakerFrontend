import { Shift } from "./schedule/shift";


export interface Employee {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    phone: string;
    imageUrl: string;
    color: string;
    scheduledDays: Shift[] | undefined;
}