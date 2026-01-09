import { XMLParser } from 'fast-xml-parser';
import { camelCase } from 'lodash';

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
});

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

function santizeSvgAttributeKey(rawKey: string): string | null {
    const allowedKeys = new Set([
        'viewBox',
        'width',
        'height',
        'fill',
        'fill-opacity',
        'fill-rule',
        'aria-hidden',
        'aria-label',
        'role',
        'xmlns',
        'stroke',
        'stroke-dasharray',
        'stroke-dashoffset',
        'stroke-linecap',
        'stroke-linejoin',
        'stroke-miterlimit',
        'stroke-opacity',
        'stroke-width'
    ]);
    const key = rawKey.trim().replace(/^@_/, '');
    return allowedKeys.has(key)
        ? key.startsWith('aria-') || key.startsWith('data-')
            ? key
            : camelCase(key)
        : null;
}
