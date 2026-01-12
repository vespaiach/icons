export function assertArray<T = unknown>(arr: T[] | null | undefined): arr is T[] {
    if (!arr || !Array.isArray(arr)) {
        return false;
    }
    return true;
}
