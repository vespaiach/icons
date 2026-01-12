import { XMLParser } from 'fast-xml-parser';
import { camelCase } from 'lodash';

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true
});

let nodeCounter = 0;

export function parseSvgToAst(svgText: string): SvgNode {
    nodeCounter = 0; // Reset counter for each SVG
    const parsed = parser.parse(svgText);

    // Root SVG element
    const svg = parsed.svg;
    if (!svg) {
        throw new Error('Invalid SVG: <svg> root not found');
    }

    return buildAstNode('root', 'svg', svg);
}

function buildAstNode(id: string, type: string, element: Record<string, unknown> | string): SvgNode {
    const node: SvgNode = {
        id,
        type,
        attrs: {}
    };

    // Handle text-only elements (e.g., <title>text</title> or <style>css</style>)
    if (typeof element === 'string') {
        node.attrs.textContent = element;
        return node;
    }

    // Extract attributes
    for (const [key, value] of Object.entries(element)) {
        if (key.startsWith('@_')) {
            const sanitizedKey = santizeSvgAttributeKey(key);
            if (sanitizedKey) {
                node.attrs[sanitizedKey] = String(value);
            }
        }
    }

    // Handle #text property (text content mixed with other elements)
    if (element['#text']) {
        node.attrs.textContent = String(element['#text']);
    }

    // Extract children
    const children: SvgNode[] = [];

    for (const [key, value] of Object.entries(element)) {
        if (!key.startsWith('@_') && key !== '#text') {
            const childType = key;

            if (Array.isArray(value)) {
                // Multiple elements of the same type
                for (const child of value) {
                    nodeCounter++;
                    if (child !== null && child !== undefined) {
                        if (typeof child === 'object') {
                            children.push(
                                buildAstNode(
                                    `${childType}${nodeCounter}`,
                                    childType,
                                    child as Record<string, unknown>
                                )
                            );
                        } else {
                            children.push(
                                buildAstNode(`${childType}${nodeCounter}`, childType, String(child))
                            );
                        }
                    }
                }
            } else if (value !== null && value !== undefined) {
                // Single element (object or string)
                nodeCounter++;
                if (typeof value === 'object') {
                    children.push(
                        buildAstNode(
                            `${childType}${nodeCounter}`,
                            childType,
                            value as Record<string, unknown>
                        )
                    );
                } else {
                    children.push(buildAstNode(`${childType}${nodeCounter}`, childType, String(value)));
                }
            }
        }
    }

    if (children.length > 0) {
        node.children = children;
    }

    return node;
}

export function extractSvgAttributes(svgText: string): Record<string, string> {
    const parsed = parser.parse(svgText);

    // Root SVG element
    const svg = parsed.svg;
    if (!svg) {
        throw new Error('Invalid SVG: <svg> root not found');
    }

    const attributes: Record<string, string> = {};

    for (const [key, value] of Object.entries(svg)) {
        const sanitizedKey = santizeSvgAttributeKey(key);
        if (sanitizedKey) {
            attributes[sanitizedKey] = String(value);
        }
    }

    return attributes;
}

export function extractSvgInnerContent(svgContent: string): string {
    // Match the opening <svg...> tag and closing </svg> tag, capturing the content in between
    const match = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);

    if (match?.[1]) {
        return match[1].trim();
    }

    // If no match found, return original content (fallback)
    return svgContent;
}

export function astToSvgAttributes(ast: SvgNode): Record<string, string> {
    return ast.attrs;
}

export function astToInnerHtml(ast: SvgNode): string {
    if (!ast.children || ast.children.length === 0) {
        return '';
    }

    return ast.children.map((child) => nodeToHtml(child)).join('');
}

function nodeToHtml(node: SvgNode): string {
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
        html += node.children.map((child) => nodeToHtml(child)).join('');
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

function santizeSvgAttributeKey(rawKey: string): string | null {
    // Remove @_ prefix from fast-xml-parser
    const key = rawKey.trim().replace(/^@_/, '');

    // Skip if empty
    if (!key) return null;

    const allowedKeys = new Set([
        'fill',
        'fill-opacity',
        'fill-rule',
        'stroke',
        'stroke-width',
        'stroke-linecap',
        'stroke-linejoin',
        'stroke-opacity',
        'viewBox',
        'width',
        'height',
        'xmlns',
        'd',
        'tabindex',
        'role',
        'aria-hidden',
        'aria-invalid',
        'aria-label',
        'aria-labelledby',
        'aria-describedby',
        'aria-description',
        'aria-details'
    ]);

    if (!allowedKeys.has(key)) {
        return null;
    }

    // Keep aria- and data- attributes as-is (with hyphen)
    if (key.startsWith('aria-')) {
        return key;
    }

    // Convert to camelCase for all other attributes
    return camelCase(key);
}
