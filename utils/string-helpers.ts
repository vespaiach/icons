export function mergeAttributes(variant?: string | null, adjustment?: string | null) {
    return variant ? (variant === 'none' ? 'none' : adjustment || variant || undefined) : undefined;
}
