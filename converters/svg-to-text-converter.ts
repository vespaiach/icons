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
    transform: 'tf',
    class: 'cl',
    opacity: 'op',
    x: 'x',
    y: 'y',
    id: 'id',
    'data-name': 'd-name',
    d: '' // Empty string means value-only (no key=value format)
};

/**
 * Default special value abbreviations
 */
export const DEFAULT_VALUE_MAP: Record<string, string> = {
    currentColor: 'cc',
    currentcolor: 'cc',
    CurrentColor: 'cc',
    none: 'n',
    evenodd: 'evenodd',
    round: 'round'
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
    style: 'sl',
    title: 'title',
    mask: 'mk'
};

/**
 * Default attributes to exclude from conversion (non-rendering attributes)
 */
export const DEFAULT_EXCLUDE_ATTRS: string[] = [
    'xmlns',
    'xmlns:xlink',
    'xml:space',
    'data-slot',
    'aria-hidden',
    'aria-labelledby',
    'role',
    'version',
    'id',
    'enable-background'
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
    parserOptions?: Record<string, unknown>;
}

interface ElementNode {
    id: number;
    parentId: number | null;
    type: string;
    attrs: Record<string, string>;
    textContent?: string;
}

/**
 * Create a converter instance with custom configuration
 */
function createConverter(config: SvgToTextConfig) {
    const attributeMap = { ...DEFAULT_ATTRIBUTE_MAP, ...config.attributeMap };
    const valueMap = { ...DEFAULT_VALUE_MAP, ...config.valueMap };
    const elementMap = { ...DEFAULT_ELEMENT_MAP, ...config.elementMap };
    const excludeAttrs = config.excludeAttrs || DEFAULT_EXCLUDE_ATTRS;

    let nodeCounter = 0;
    const nodes: ElementNode[] = [];

    /**
     * Abbreviate an attribute value
     */
    function abbreviateValue(value: string): string {
        return valueMap[value] || value;
    }

    /**
     * Convert SVG attributes to compact text format
     */
    function convertAttributes(attrs: Record<string, string>, _tagName: string): string {
        const parts: string[] = [];
        let dValue: string | null = null;

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
                // Special case for value-only attributes (like 'd') - save for end
                dValue = abbrevValue;
            } else {
                parts.push(`${abbrevKey}=${abbrevValue}`);
            }
        }

        // Add 'd' value at the end if present
        if (dValue) {
            parts.push(dValue);
        }

        return parts.join('_');
    }

    /**
     * Process child elements recursively
     */
    function processChildren(node: Record<string, unknown>, parentId: number | null): void {
        for (const [key, value] of Object.entries(node)) {
            // Skip attributes and title
            if (key === ':@' || key === 'title') {
                continue;
            }

            // Handle text content for elements like style
            if (key === '#text') {
                continue;
            }

            // Handle array of elements
            if (Array.isArray(value)) {
                for (const child of value) {
                    const currentId = ++nodeCounter;
                    const attrs = child[':@'] || {};
                    let textContent = child['#text'];

                    // For style elements, capture the text content
                    if (key === 'style' && textContent) {
                        textContent = textContent.trim();
                    }

                    nodes.push({
                        id: currentId,
                        parentId: parentId,
                        type: key,
                        attrs,
                        textContent
                    });

                    // Recursively process nested children
                    processChildren(child, currentId);
                }
            } else if (typeof value === 'string') {
                // Handle elements that are just text (e.g., <style>text</style>)
                const currentId = ++nodeCounter;
                nodes.push({
                    id: currentId,
                    parentId: parentId,
                    type: key,
                    attrs: {},
                    textContent: value.trim()
                });
            } else if (typeof value === 'object' && value !== null) {
                const currentId = ++nodeCounter;
                const valueObj = value as Record<string, string>;
                const attrs = valueObj[':@'] || {};
                let textContent = valueObj['#text'];

                // For style elements, capture the text content
                if (key === 'style' && textContent) {
                    textContent = textContent.trim();
                }

                nodes.push({
                    id: currentId,
                    parentId: parentId,
                    type: key,
                    attrs,
                    textContent
                });

                // Recursively process nested children
                processChildren(valueObj, currentId);
            }
        }
    }

    /**
     * Convert nodes to text format with hierarchy
     */
    function nodesToText(): string {
        const parts: string[] = [];

        for (const node of nodes) {
            const elementType = elementMap[node.type] || node.type;
            const attrText = convertAttributes(node.attrs, node.type);

            // Build hierarchy prefix
            let prefix: string;
            if (node.parentId === null) {
                // Direct child of root (svg)
                prefix = `:${node.id}`;
            } else {
                // Child of another element
                prefix = `${node.parentId}:${node.id}`;
            }

            // Build element string
            let elementStr: string;
            if (node.textContent?.trim()) {
                // For style elements with text content
                if (attrText) {
                    elementStr = `${prefix}${elementType} ${attrText} >${node.textContent}`;
                } else {
                    elementStr = `${prefix}${elementType} >${node.textContent}`;
                }
            } else {
                elementStr = attrText ? `${prefix}${elementType} ${attrText}` : `${prefix}${elementType}`;
            }

            parts.push(elementStr);
        }

        return parts.join('|');
    }

    return { processChildren, nodesToText, nodes };
}

/**
 * Convert SVG raw HTML to compact text format with hierarchical structure
 *
 * Format: s attr1=val1_attr2=val2|:1element attr=val|parent:childElement attr=val
 *
 * Example:
 * Input: <svg viewBox="0 0 24 24" fill="none"><path d="M10 6"/></svg>
 * Output: s vb=0 0 24 24_f=n|:1p M10 6
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
        trimValues: true
    };

    const parser = new XMLParser({
        ...defaultParserOptions,
        ...config.parserOptions
    });

    const parsed = parser.parse(svgHtml);
    const svgNode = parsed.svg;

    if (!svgNode) {
        throw new Error('Invalid SVG: No svg root element found');
    }

    const converter = createConverter(config);

    // Get attribute map for svg root
    const attributeMap = { ...DEFAULT_ATTRIBUTE_MAP, ...config.attributeMap };
    const valueMap = { ...DEFAULT_VALUE_MAP, ...config.valueMap };
    const excludeAttrs = config.excludeAttrs || DEFAULT_EXCLUDE_ATTRS;

    // Convert SVG root attributes (exclude id, class, width, height from root)
    const svgAttrs = svgNode[':@'] || {};
    const attrParts: string[] = [];
    const svgRootExcludeAttrs = [...excludeAttrs, 'id', 'class', 'width', 'height'];

    for (const [key, value] of Object.entries(svgAttrs)) {
        if (svgRootExcludeAttrs.includes(key)) continue;
        const abbrevKey = attributeMap[key];
        if (abbrevKey === undefined) continue;

        const abbrevValue = valueMap[value as string] || value;
        if (abbrevKey === '') {
            attrParts.push(abbrevValue as string);
        } else {
            attrParts.push(`${abbrevKey}=${abbrevValue}`);
        }
    }

    const svgAttrText = attrParts.join('_');
    const svgElement = svgAttrText ? `s ${svgAttrText}` : 's';

    // Process child elements
    converter.processChildren(svgNode, null);
    const childrenText = converter.nodesToText();

    return childrenText ? `${svgElement}|${childrenText}` : `${svgElement}`;
}

/**
 * Batch convert multiple SVG strings to text format
 *
 * @param svgHtmlArray - Array of SVG HTML strings to convert
 * @param config - Optional configuration to customize attribute/value/element mappings
 */
export function batchSvgToTextFormat(svgHtmlArray: string[], config: SvgToTextConfig = {}): string[] {
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
 * @param textFormat - The compact text format string with hierarchical structure
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
     * Parse attributes from compact format (underscore-separated)
     */
    function parseAttributes(attrString: string): Record<string, string> {
        const attrs: Record<string, string> = {};

        if (!attrString) return attrs;

        const parts = attrString.split('_');

        for (const part of parts) {
            if (part.includes('=')) {
                const [key, ...valueParts] = part.split('=');
                const value = valueParts.join('=');
                const fullKey = reverseAttributeMap[key] || key;
                attrs[fullKey] = expandValue(value);
            } else {
                // Value-only attribute (like 'd' for path)
                attrs.d = part;
            }
        }

        return attrs;
    }

    interface ParsedElement {
        id: number;
        parentId: number | null;
        type: string;
        attrs: Record<string, string>;
        textContent?: string;
    }

    // Parse the text format
    const trimmed = textFormat.trim();
    const parts = trimmed.split('|');

    if (parts.length === 0) {
        throw new Error('Invalid text format: Empty string');
    }

    // First part is SVG element
    const svgPart = parts[0];
    const svgAttrs = svgPart.startsWith('s ') ? parseAttributes(svgPart.substring(2)) : {};

    // Parse child elements
    const elements: ParsedElement[] = [];

    for (let i = 1; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;

        // Parse hierarchy: :1element or parent:childElement
        const colonIndex = part.indexOf(':');
        if (colonIndex === -1) continue;

        let parentId: number | null;
        let remaining: string;

        if (part.startsWith(':')) {
            // Direct child of root (:1element)
            parentId = null;
            remaining = part.substring(1);
        } else {
            // Child of another element (parent:childElement)
            const parentStr = part.substring(0, colonIndex);
            parentId = parseInt(parentStr, 10);
            remaining = part.substring(colonIndex + 1);
        }

        // Find where element type starts (after ID)
        let idEndIndex = 0;
        while (idEndIndex < remaining.length && /\d/.test(remaining[idEndIndex])) {
            idEndIndex++;
        }

        const id = parseInt(remaining.substring(0, idEndIndex), 10);
        const rest = remaining.substring(idEndIndex);

        // Find element type
        let typeEndIndex = 0;
        while (typeEndIndex < rest.length && /[a-z]/.test(rest[typeEndIndex])) {
            typeEndIndex++;
        }

        const elementType = rest.substring(0, typeEndIndex);
        let attributesAndContent = rest.substring(typeEndIndex).trim();

        // Check for text content (style elements with >)
        let textContent: string | undefined;
        const contentIndex = attributesAndContent.indexOf('>');
        if (contentIndex !== -1) {
            textContent = attributesAndContent.substring(contentIndex + 1);
            attributesAndContent = attributesAndContent.substring(0, contentIndex).trim();
        }

        const attrs = parseAttributes(attributesAndContent);

        elements.push({
            id,
            parentId,
            type: reverseElementMap[elementType] || elementType,
            attrs,
            textContent
        });
    }

    /**
     * Build HTML for an element
     */
    function buildElement(el: ParsedElement, indent: string): string {
        const attrStrings: string[] = [];
        for (const [key, value] of Object.entries(el.attrs)) {
            attrStrings.push(`${key}="${value}"`);
        }
        const attrHtml = attrStrings.length > 0 ? ` ${attrStrings.join(' ')}` : '';

        // Find children of this element
        const children = elements.filter((e) => e.parentId === el.id);

        if (el.textContent) {
            // Element with text content (like style)
            return `${indent}<${el.type}${attrHtml}>${el.textContent}</${el.type}>`;
        } else if (children.length > 0) {
            // Element with children
            const childrenHtml = children.map((child) => buildElement(child, `${indent}    `)).join('\n');
            return `${indent}<${el.type}${attrHtml}>\n${childrenHtml}\n${indent}</${el.type}>`;
        } else {
            // Self-closing element
            const selfClosing = ['path', 'line', 'circle', 'rect', 'ellipse', 'polygon', 'polyline'];
            if (selfClosing.includes(el.type)) {
                return `${indent}<${el.type}${attrHtml}/>`;
            }
            return `${indent}<${el.type}${attrHtml}></${el.type}>`;
        }
    }

    // Build SVG attributes
    const svgAttrStrings: string[] = ['xmlns="http://www.w3.org/2000/svg"'];
    for (const [key, value] of Object.entries(svgAttrs)) {
        svgAttrStrings.push(`${key}="${value}"`);
    }
    const svgAttrHtml = svgAttrStrings.join(' ');

    // Build root-level children
    const rootChildren = elements.filter((e) => e.parentId === null);

    if (rootChildren.length === 0) {
        return `<svg ${svgAttrHtml}></svg>`;
    }

    const childrenHtml = rootChildren.map((child) => buildElement(child, '    ')).join('\n');
    return `<svg ${svgAttrHtml}>\n${childrenHtml}\n</svg>`;
}

/**
 * Batch convert text format strings to SVG HTML
 *
 * @param textFormatArray - Array of compact text format strings
 * @param config - Optional configuration to customize attribute/value/element mappings
 */
export function batchTextFormatToSvg(textFormatArray: string[], config: SvgToTextConfig = {}): string[] {
    return textFormatArray.map((text) => {
        try {
            return textFormatToSvg(text, config);
        } catch (error) {
            console.error('Error converting text to SVG:', error);
            return '';
        }
    });
}
