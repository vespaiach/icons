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
        if (key.startsWith('@_')) {
            const correctKey = key.replace('@_', '');
            attributes[
                correctKey.startsWith('aria-') || correctKey.startsWith('data-')
                    ? correctKey
                    : camelCase(correctKey)
            ] = String(value);
        }
    }

    return attributes;
}

export function extractSvgInnerContent(svgContent: string): string {
    // Match the opening <svg...> tag and closing </svg> tag, capturing the content in between
    const match = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);

    if (match && match[1]) {
        return match[1].trim();
    }

    // If no match found, return original content (fallback)
    return svgContent;
}
