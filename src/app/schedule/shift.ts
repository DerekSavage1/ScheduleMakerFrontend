export interface Shift {
    day: string,
    shiftStart: number | null,
    shiftEnd: number | null,
    disabled: boolean,
    date: Date | undefined
}