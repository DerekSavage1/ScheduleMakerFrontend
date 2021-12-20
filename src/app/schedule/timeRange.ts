export interface TimeRange {
    id: number | undefined,
    employeeId: string,
    dateStart: Date | null,
    dateEnd: Date | null,
    purpose: string
}