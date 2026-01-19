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

export function astToTsx(icon: { name: string; svgAst: SvgNode }): string {
    const componentName = icon.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    const title = `${icon.name.replace(/-/g, ' ')} icon`;
    const { width, height, ...rest } = icon.svgAst.attrs;

    const content = `
import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
}

export default function ${componentName} ({
    title = "${title}",
    width = ${width || 24},
    height = ${height || 24},
    ...rest
}: IconProps): React.ReactNode {
    return (
        <svg
            {...rest}
            ${Object.entries(rest)
                .map(([key, value]) => `${key}="${value}"`)
                .join('\n            ')}
            width={width}
            height={height}>
            <title>{title}</title>
            ${astToInnerHtml(icon.svgAst)}
        </svg>
    );
}
        `;
    return content;
}
