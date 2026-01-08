export function assertNumber(value: number | null | undefined): value is number {
    return value !== null && value !== undefined && !isNaN(value);
}

export function assertDate(value: Date | null | undefined): value is Date {
    return value !== null && value !== undefined && value instanceof Date;
}

export function assertString(value: string | null | undefined): value is string {
    return value !== null && value !== undefined && typeof value === 'string';
}
