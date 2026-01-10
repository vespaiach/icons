'use client';

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
        .map(([key, value]) => `${key}="${value}"`)
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
