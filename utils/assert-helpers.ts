export function assertNumber(value: number | null | undefined): value is number {
    return value !== null && value !== undefined && !isNaN(value);
}

export function assertDate(value: Date | null | undefined): value is Date {
    return value !== null && value !== undefined && value instanceof Date;
}

export function assertString(value: string | null | undefined): value is string {
    return value !== null && value !== undefined && typeof value === 'string';
}

export function assertTruthy<T>(value: T | null | undefined): value is T {
    return Boolean(value);
}

export function assertArray<T>(value: T[] | null | undefined): value is T[] {
    return value !== null && value !== undefined && Array.isArray(value);
}

export function assertNotEmptyArray<T>(value: T[] | null | undefined): value is T[] {
    return value !== null && value !== undefined && Array.isArray(value) && value.length > 0;
}
