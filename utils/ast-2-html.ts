import { mergeAttributes } from './string-helpers';

export function astToInnerHtml(ast: SvgNode): string {
    if (!ast.children || ast.children.length === 0) {
        return '';
    }

    return ast.children.map((child) => astToHtml(child)).join('');
}

export function astToHtml(node: SvgNode): string {
    // Separate textContent from other attributes
    const { textContent, ...otherAttrs } = node.attrs;

    const attrs = Object.entries(otherAttrs)
        .map(([key, value]) => {
            if (value !== undefined && value !== null) {
                return `${key}="${value}"`;
            }
            return '';
        })
        .filter((attr) => attr !== '')
        .join(' ');

    // If no children and no text content, it's a self-closing tag
    if ((!node.children || node.children.length === 0) && !textContent) {
        return `<${node.type}${attrs ? ` ${attrs}` : ''}/>`;
    }

    // Build opening tag
    let html = `<${node.type}${attrs ? ` ${attrs}` : ''}>`;

    // Add text content if present
    if (textContent) {
        html += textContent;
    }

    // Add children if present
    if (node.children && node.children.length > 0) {
        html += node.children.map((child) => astToHtml(child)).join('');
    }

    // Add closing tag
    html += `</${node.type}>`;

    return html;
}

export function astToSvgString(ast: SvgNode): string {
    const attrs = Object.entries(ast.attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

    const innerHtml = astToInnerHtml(ast);
    return `<svg${attrs ? ` ${attrs}` : ''}>${innerHtml}</svg>`;
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
        attrs: { ...svgAst.attrs, width: size, height: size } as Record<string, string | undefined>
    };

    const fill = mergeAttributes(variant.fill, color);
    const stroke = mergeAttributes(variant.stroke, color);

    const applyColorToChildren = (node: SvgNode) => {
        if (node.children) {
            node.children.forEach((child) => {
                if (fill !== undefined && (variant.fillOn === 'children' || variant.fillOn === 'both')) {
                    child.attrs.fill = fill;
                }
                if (
                    stroke !== undefined &&
                    (variant.strokeOn === 'children' || variant.strokeOn === 'both')
                ) {
                    child.attrs.stroke = stroke;
                }
                applyColorToChildren(child);
            });
        }
    };

    if (fill !== undefined && (variant.fillOn === 'parent' || variant.fillOn === 'both')) {
        ast.attrs.fill = fill;
    }
    if (stroke !== undefined && (variant.strokeOn === 'parent' || variant.strokeOn === 'both')) {
        ast.attrs.stroke = stroke;
    }

    applyColorToChildren(ast);
    return ast;
}
