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

function santizeSvgAttributeKey(rawKey: string): string | null {
    // Remove @_ prefix from fast-xml-parser
    const key = rawKey.trim().replace(/^@_/, '');

    // Skip if empty
    if (!key) return null;

    // Allow data- and aria- attributes (keep hyphens)
    if (key.startsWith('data-') || key.startsWith('aria-')) {
        return key;
    }

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
        'aria-details',
        'cx',
        'cy',
        'r',
        'x',
        'y',
        'x1',
        'y1',
        'x2',
        'y2',
        'transform',
        'offset',
        'stop-color',
        'stop-opacity',
        'points',
        'pathLength',
        'id',
        'class',
        'style'
    ]);

    if (!allowedKeys.has(key)) {
        return null;
    }

    // Keep hyphenated attributes as-is for proper HTML/SVG output
    if (key.includes('-')) {
        return key;
    }

    // Convert to camelCase for other attributes (mainly for consistency)
    return camelCase(key);
}
