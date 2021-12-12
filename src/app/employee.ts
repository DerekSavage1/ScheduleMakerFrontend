export interface Employee {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    phone: string;
    imageUrl: string;
    color: string;
    shiftStart: number | null;
    shiftEnd: number | null;
}