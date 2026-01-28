/**
 * Utilities for compacting and expanding SVG AST for efficient storage
 */

/**
 * Convert a full SvgNode to a compact representation
 * Reduces key names and omits empty properties to save storage space
 */
export function compactAst(node: SvgNode): CompactSvgNode {
    const compact: CompactSvgNode = {
        i: node.id,
        t: node.type
    };

    // Only include attrs if they exist and are non-empty
    if (node.attrs && Object.keys(node.attrs).length > 0) {
        compact.a = node.attrs;
    }

    // Only include children if they exist and are non-empty
    if (node.children && node.children.length > 0) {
        compact.c = node.children.map(compactAst);
    }

    return compact;
}

/**
 * Expand a compact SvgNode back to the full representation
 */
export function expandAst(compact: CompactSvgNode): SvgNode {
    const node: SvgNode = {
        id: compact.i,
        type: compact.t,
        attrs: compact.a ?? {}
    };

    // Restore children if they exist
    if (compact.c && compact.c.length > 0) {
        node.children = compact.c.map(expandAst);
    }

    return node;
}

/**
 * Calculate approximate size savings of compact format
 * Useful for debugging and performance monitoring
 */
export function calculateCompactionSavings(original: SvgNode): {
    originalSize: number;
    compactSize: number;
    savings: number;
    savingsPercentage: number;
} {
    const originalJson = JSON.stringify(original);
    const compactJson = JSON.stringify(compactAst(original));

    const originalSize = originalJson.length;
    const compactSize = compactJson.length;
    const savings = originalSize - compactSize;
    const savingsPercentage = ((savings / originalSize) * 100).toFixed(2);

    return {
        originalSize,
        compactSize,
        savings,
        savingsPercentage: Number.parseFloat(savingsPercentage)
    };
}
