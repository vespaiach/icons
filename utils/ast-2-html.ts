import { mergeAttributes } from './string-helpers';

export function astToInnerHtml(ast: SvgNode): string {
    if (!ast.c || ast.c.length === 0) {
        return '';
    }

    return ast.c.map((child) => astToHtml(child)).join('');
}

export function astToHtml(node: SvgNode): string {
    const attrs = node.a || {};
    // Separate textContent from other attributes
    const { textContent, ...otherAttrs } = attrs;

    const attrsStr = Object.entries(otherAttrs)
        .map(([key, value]) => {
            if (value !== undefined && value !== null) {
                return `${key}="${value}"`;
            }
            return '';
        })
        .filter((attr) => attr !== '')
        .join(' ');

    // If no children and no text content, it's a self-closing tag
    if ((!node.c || node.c.length === 0) && !textContent) {
        return `<${node.t}${attrsStr ? ` ${attrsStr}` : ''}/>`;
    }

    // Build opening tag
    let html = `<${node.t}${attrsStr ? ` ${attrsStr}` : ''}>`;

    // Add text content if present
    if (textContent) {
        html += textContent;
    }

    // Add children if present
    if (node.c && node.c.length > 0) {
        html += node.c.map((child) => astToHtml(child)).join('');
    }

    // Add closing tag
    html += `</${node.t}>`;

    return html;
}

export function astToSvgString(ast: SvgNode): string {
    const attrs = ast.a || {};
    const attrsStr = Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

    const innerHtml = astToInnerHtml(ast);
    return `<svg${attrsStr ? ` ${attrsStr}` : ''}>${innerHtml}</svg>`;
}

export function prepareAst(
    svgAst: SvgNode,
    variant: Pick<Variant, 'fill' | 'fillOn' | 'stroke' | 'strokeOn' | 'strokeWidth' | 'strokeWidthOn'>,
    adjustment?: Adjustment
): SvgNode {
    const size = adjustment?.size || 24;
    const color = adjustment?.color || 'currentColor';
    const ast = {
        ...svgAst,
        a: { ...svgAst.a, width: size, height: size } as Record<string, string | number | undefined>
    };

    const fill = mergeAttributes(variant.fill, color);
    const stroke = mergeAttributes(variant.stroke, color);

    const applyColorToChildren = (node: SvgNode) => {
        if (node.c) {
            node.c.forEach((child) => {
                const childAttrs = child.a || {};
                if (fill !== undefined && (variant.fillOn === 'children' || variant.fillOn === 'both')) {
                    childAttrs.fill = fill;
                }
                if (
                    stroke !== undefined &&
                    (variant.strokeOn === 'children' || variant.strokeOn === 'both')
                ) {
                    childAttrs.stroke = stroke;
                }
                child.a = childAttrs;
                applyColorToChildren(child);
            });
        }
    };

    const astAttrs = ast.a || {};
    if (fill !== undefined && (variant.fillOn === 'parent' || variant.fillOn === 'both')) {
        astAttrs.fill = fill;
    }
    if (stroke !== undefined && (variant.strokeOn === 'parent' || variant.strokeOn === 'both')) {
        astAttrs.stroke = stroke;
    }
    ast.a = astAttrs;

    applyColorToChildren(ast);
    return ast;
}
