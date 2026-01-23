export function mergeAttributes(variant?: string | null, adjustment?: string | null) {
    return variant === 'none' ? 'none' : variant ? adjustment || variant || undefined : undefined;
}
