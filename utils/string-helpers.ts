export function mergeAttributes(variant?: string | null, adjustment?: string | null) {
    return variant ? (variant === 'none' ? 'none' : adjustment || variant || undefined) : undefined;
}

export function applyAdjustmentColor(svgText: string, adjustment?: { color?: string }) {
    if (adjustment?.color) {
        // Simple regex to replace fill and stroke colors in the SVG text
        return svgText.replace(/f=cc/g, `f=${adjustment.color}`).replace(/st=cc/g, `st=${adjustment.color}`);
    }
    return svgText;
}

export function applyAdjustment2SvgText(
    svgText: string,
    adjustment?: { color?: string; size?: string | number }
) {
    if (adjustment?.color) {
        // Simple regex to replace fill and stroke colors in the SVG text
        svgText = svgText
            .replace(/f=cc/g, `f=${adjustment.color}`)
            .replace(/st=cc/g, `st=${adjustment.color}`);
    }

    const size = adjustment?.size || '24';
    const sizeAttr = `_w=${size}_h=${size}`;
    return svgText.replace('|:1', `${sizeAttr}|:1`);
}
