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

export function nameToId(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces/hyphens)
        .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with a single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
