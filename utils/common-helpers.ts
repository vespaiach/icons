export function cx(...name: unknown[]): string | undefined {
    return (
        name
            .filter(Boolean)
            .map((s) =>
                String(s)
                    .trim()
                    .replace(/\s+|\n/g, ' ')
            )
            .join(' ') || undefined
    );
}

export function assertString(value: string | null | undefined): value is string {
    return value !== null && value !== undefined && value !== '';
}

export function assertArray<T>(value: T[] | null | undefined): value is T[] {
    return value !== null && value !== undefined && Array.isArray(value);
}

export function assertNotEmptyArray<T>(value: T[] | null | undefined): value is T[] {
    return value !== null && value !== undefined && Array.isArray(value) && value.length > 0;
}

export function assertTruthy<T>(value: T | null | undefined): value is T {
    return Boolean(value);
}
