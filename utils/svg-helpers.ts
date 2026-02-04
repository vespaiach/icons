'use client';

import { XMLParser } from 'fast-xml-parser';
import { camelCase } from 'lodash';

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true
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
        'pathLength'
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

export function mergeAttributes(variant?: string | null, adjustment?: string | null) {
    return variant === 'none' ? 'none' : variant ? adjustment || variant || undefined : undefined;
}
