import { XMLParser } from 'fast-xml-parser';

/**
 * Default attribute abbreviation map for compact text format
 */
export const DEFAULT_ATTRIBUTE_MAP: Record<string, string> = {
    viewBox: 'vb',
    fill: 'f',
    stroke: 'st',
    'stroke-width': 'stw',
    'stroke-linecap': 'stlc',
    'stroke-linejoin': 'stlj',
    'clip-rule': 'cr',
    'fill-rule': 'fr',
    x1: 'x1',
    x2: 'x2',
    y1: 'y1',
    y2: 'y2',
    cx: 'cx',
    cy: 'cy',
    r: 'r',
    width: 'w',
    height: 'h',
    transform: 'tr',
    class: 'cl',
    opacity: 'op',
    x: 'x',
    y: 'y',
    d: '', // Empty string means value-only (no key=value format)
};

/**
 * Default special value abbreviations
 */
export const DEFAULT_VALUE_MAP: Record<string, string> = {
    currentColor: 'cc',
    none: 'n',
    evenodd: 'evenodd',
    round: 'round',
};

/**
 * Default element type abbreviations
 */
export const DEFAULT_ELEMENT_MAP: Record<string, string> = {
    svg: 's',
    path: 'p',
    line: 'l',
    circle: 'c',
    rect: 'r',
    ellipse: 'e',
    polygon: 'poly',
    polyline: 'pline',
    g: 'g',
    defs: 'defs',
    style: 'style',
    title: 't',
};

/**
 * Default attributes to exclude from conversion (non-rendering attributes)
 */
export const DEFAULT_EXCLUDE_ATTRS: string[] = [
    'xmlns',
    'xmlns:xlink',
    'data-slot',
    'aria-hidden',
    'aria-labelledby',
    'data-name',
    'role',
];

/**
 * Configuration options for SVG to text format conversion
 */
export interface SvgToTextConfig {
    /** Attribute name abbreviation map */
    attributeMap?: Record<string, string>;
    /** Attribute value abbreviation map */
    valueMap?: Record<string, string>;
    /** Element type abbreviation map */
    elementMap?: Record<string, string>;
    /** Attributes to exclude from conversion */
    excludeAttrs?: string[];
    /** Custom parser options for fast-xml-parser */
    parserOptions?: any;
}

/**
 * Create a converter instance with custom configuration
 */
function createConverter(config: SvgToTextConfig) {
    const attributeMap = { ...DEFAULT_ATTRIBUTE_MAP, ...config.attributeMap };
    const valueMap = { ...DEFAULT_VALUE_MAP, ...config.valueMap };
    const elementMap = { ...DEFAULT_ELEMENT_MAP, ...config.elementMap };
    const excludeAttrs = config.excludeAttrs || DEFAULT_EXCLUDE_ATTRS;

    /**
     * Abbreviate an attribute value
     */
    function abbreviateValue(value: string): string {
        return valueMap[value] || value;
    }

    /**
     * Convert SVG attributes to compact text format
     */
    function convertAttributes(attrs: Record<string, string>): string {
        const parts: string[] = [];

        for (const [key, value] of Object.entries(attrs)) {
            // Skip excluded attributes
            if (excludeAttrs.includes(key)) {
                continue;
            }

            const abbrevKey = attributeMap[key];
            if (abbrevKey === undefined) {
                // Skip unknown attributes
                continue;
            }

            const abbrevValue = abbreviateValue(value);

            if (abbrevKey === '') {
                // Special case for value-only attributes (like 'd') - just add the value
                parts.push(abbrevValue);
            } else {
                parts.push(`${abbrevKey}=${abbrevValue}`);
            }
        }

        return parts.join(',');
    }

    /**
     * Convert an SVG element to compact text format
     */
    function convertElement(element: any, tagName: string): string {
        const elementType = elementMap[tagName] || tagName;
        const attrs = element[':@'] || {};
        const attrText = convertAttributes(attrs);

        return attrText ? `${elementType} ${attrText}` : elementType;
    }

    /**
     * Process child elements recursively
     */
    function processChildren(node: any): string[] {
        const results: string[] = [];

        for (const [key, value] of Object.entries(node)) {
            // Skip attributes and text nodes, also skip non-rendering elements
            if (key === ':@' || key === '#text' || key === 'title' || key === 'defs' || key === 'style') {
                continue;
            }

            // Handle array of elements
            if (Array.isArray(value)) {
                for (const child of value) {
                    results.push(convertElement(child, key));
                    // Recursively process nested children
                    const nestedChildren = processChildren(child);
                    results.push(...nestedChildren);
                }
            } else if (typeof value === 'object') {
                results.push(convertElement(value, key));
                // Recursively process nested children
                const nestedChildren = processChildren(value);
                results.push(...nestedChildren);
            }
        }

        return results;
    }

    return { convertElement, processChildren };
}

/**
 * Convert SVG raw HTML to compact text format
 * 
 * Format: s attr1=val1,attr2=val2|element1 attr=val|element2 attr=val
 * 
 * Example:
 * Input: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 6 L2 16"/></svg>
 * Output: s vb=0 0 24 24,f=n,st=cc|p M10 6 L2 16
 * 
 * @param svgHtml - The SVG HTML string to convert
 * @param config - Optional configuration to customize attribute/value/element mappings
 */
export function svgToTextFormat(svgHtml: string, config: SvgToTextConfig = {}): string {
    const defaultParserOptions = {
        ignoreAttributes: false,
        attributeNamePrefix: '',
        attributesGroupName: ':@',
        textNodeName: '#text',
        ignoreDeclaration: true,
        parseAttributeValue: false,
        trimValues: true,
    };

    const parser = new XMLParser({
        ...defaultParserOptions,
        ...config.parserOptions,
    });

    const parsed = parser.parse(svgHtml);
    const svgNode = parsed.svg;

    if (!svgNode) {
        throw new Error('Invalid SVG: No svg root element found');
    }

    const { convertElement, processChildren } = createConverter(config);

    const parts: string[] = [];

    // Convert SVG root attributes
    const svgElement = convertElement(svgNode, 'svg');
    parts.push(svgElement);

    // Process child elements
    const children = processChildren(svgNode);
    parts.push(...children);

    return parts.join('|') + ' ';
}

/**
 * Batch convert multiple SVG strings to text format
 * 
 * @param svgHtmlArray - Array of SVG HTML strings to convert
 * @param config - Optional configuration to customize attribute/value/element mappings
 */
export function batchSvgToTextFormat(
    svgHtmlArray: string[],
    config: SvgToTextConfig = {},
): string[] {
    return svgHtmlArray.map((svg) => {
        try {
            return svgToTextFormat(svg, config);
        } catch (error) {
            console.error('Error converting SVG:', error);
            return '';
        }
    });
}

/**
 * Helper function to extend the default attribute map
 * 
 * @example
 * const customMap = extendAttributeMap({
 *   'opacity': 'o',
 *   'transform': 't'
 * });
 */
export function extendAttributeMap(customMap: Record<string, string>): Record<string, string> {
    return { ...DEFAULT_ATTRIBUTE_MAP, ...customMap };
}

/**
 * Helper function to extend the default value map
 * 
 * @example
 * const customMap = extendValueMap({
 *   'transparent': 'tr',
 *   'inherit': 'inh'
 * });
 */
export function extendValueMap(customMap: Record<string, string>): Record<string, string> {
    return { ...DEFAULT_VALUE_MAP, ...customMap };
}

/**
 * Helper function to extend the default element map
 * 
 * @example
 * const customMap = extendElementMap({
 *   'g': 'group',
 *   'defs': 'd'
 * });
 */
export function extendElementMap(customMap: Record<string, string>): Record<string, string> {
    return { ...DEFAULT_ELEMENT_MAP, ...customMap };
}

/**
 * Convert compact text format back to SVG HTML
 * 
 * @param textFormat - The compact text format string (e.g., "s vb=0 0 24 24|p M10 6 L2 16")
 * @param config - Optional configuration to customize attribute/value/element mappings
 * @returns SVG HTML string
 */
export function textFormatToSvg(textFormat: string, config: SvgToTextConfig = {}): string {
    const attributeMap = { ...DEFAULT_ATTRIBUTE_MAP, ...config.attributeMap };
    const valueMap = { ...DEFAULT_VALUE_MAP, ...config.valueMap };
    const elementMap = { ...DEFAULT_ELEMENT_MAP, ...config.elementMap };

    // Create reverse maps
    const reverseAttributeMap: Record<string, string> = {};
    for (const [key, value] of Object.entries(attributeMap)) {
        if (value !== '') {
            reverseAttributeMap[value] = key;
        }
    }

    const reverseValueMap: Record<string, string> = {};
    for (const [key, value] of Object.entries(valueMap)) {
        reverseValueMap[value] = key;
    }

    const reverseElementMap: Record<string, string> = {};
    for (const [key, value] of Object.entries(elementMap)) {
        reverseElementMap[value] = key;
    }

    /**
     * Expand abbreviated value
     */
    function expandValue(value: string): string {
        return reverseValueMap[value] || value;
    }

    /**
     * Parse attributes from compact format
     */
    function parseAttributes(attrString: string, elementType: string): Record<string, string> {
        const attrs: Record<string, string> = {};
        
        if (!attrString) return attrs;

        const parts = attrString.split(',');
        
        for (const part of parts) {
            if (part.includes('=')) {
                const [key, ...valueParts] = part.split('=');
                const value = valueParts.join('=');
                const fullKey = reverseAttributeMap[key] || key;
                attrs[fullKey] = expandValue(value);
            } else {
                // Value-only attribute (like 'd' for path)
                if (elementType === 'path' || elementType === 'p') {
                    attrs.d = part;
                }
            }
        }

        return attrs;
    }

    /**
     * Convert element to HTML string
     */
    function elementToHtml(elementStr: string, indent: string = ''): string {
        const spaceIndex = elementStr.indexOf(' ');
        const elementType = spaceIndex === -1 ? elementStr : elementStr.substring(0, spaceIndex);
        const attrString = spaceIndex === -1 ? '' : elementStr.substring(spaceIndex + 1);

        const fullElementType = reverseElementMap[elementType] || elementType;
        const attrs = parseAttributes(attrString, fullElementType);

        // Build attributes string
        const attrStrings: string[] = [];
        for (const [key, value] of Object.entries(attrs)) {
            attrStrings.push(`${key}="${value}"`);
        }
        const attrHtml = attrStrings.length > 0 ? ' ' + attrStrings.join(' ') : '';

        // Self-closing elements
        const selfClosing = ['path', 'line', 'circle', 'rect', 'ellipse', 'polygon', 'polyline'];
        if (selfClosing.includes(fullElementType)) {
            return `${indent}<${fullElementType}${attrHtml}/>`;
        }

        return `${indent}<${fullElementType}${attrHtml}></${fullElementType}>`;
    }

    // Parse the text format
    const trimmed = textFormat.trim();
    const parts = trimmed.split('|');

    if (parts.length === 0) {
        throw new Error('Invalid text format: Empty string');
    }

    // First part should be svg element
    const svgPart = parts[0];
    let svgHtml = elementToHtml(svgPart);

    // Add xmlns if not present
    if (!svgHtml.includes('xmlns')) {
        svgHtml = svgHtml.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // Process child elements
    if (parts.length > 1) {
        const children = parts.slice(1)
            .filter(p => p.trim())
            .map(p => elementToHtml(p, '  '))
            .join('\n');
        
        svgHtml = svgHtml.replace('</svg>', `\n${children}\n</svg>`);
    }

    return svgHtml;
}

/**
 * Batch convert text format strings to SVG HTML
 * 
 * @param textFormatArray - Array of compact text format strings
 * @param config - Optional configuration to customize attribute/value/element mappings
 */
export function batchTextFormatToSvg(
    textFormatArray: string[],
    config: SvgToTextConfig = {},
): string[] {
    return textFormatArray.map((text) => {
        try {
            return textFormatToSvg(text, config);
        } catch (error) {
            console.error('Error converting text to SVG:', error);
            return '';
        }
    });
}