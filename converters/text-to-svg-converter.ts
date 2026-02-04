import {
    DEFAULT_ATTRIBUTE_MAP,
    DEFAULT_ELEMENT_MAP,
    DEFAULT_VALUE_MAP,
    type SvgToTextConfig
} from './svg-to-text-converter';

interface ParsedElement {
    id: number;
    parentId: number | null;
    type: string;
    attrs: Record<string, string>;
    textContent?: string;
}

/**
 * Convert compact text format back to SVG HTML
 *
 * Format: s attr1=val1_attr2=val2|:1element attr=val|parent:childElement attr=val
 *
 * Example:
 * Input: s vb=0 0 24 24_f=n|:1p M10 6
 * Output: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M10 6"/></svg>
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
 * @returns Array of SVG HTML strings
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

/**
 * Convert text format to SVG and optionally format with indentation
 *
 * @param textFormat - The compact text format string
 * @param config - Optional configuration
 * @param options - Formatting options
 * @returns Formatted SVG HTML string
 */
export function textFormatToSvgFormatted(
    textFormat: string,
    config: SvgToTextConfig = {},
    options: { indent?: string; prettify?: boolean } = {}
): string {
    const svg = textFormatToSvg(textFormat, config);

    if (!options.prettify) {
        return svg;
    }

    // Simple prettification by ensuring proper indentation
    const indent = options.indent || '  ';
    let indentLevel = 0;
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < svg.length; i++) {
        const char = svg[i];

        if (char === '<') {
            if (currentLine.trim()) {
                lines.push(indent.repeat(indentLevel) + currentLine.trim());
                currentLine = '';
            }

            if (svg[i + 1] === '/') {
                // Closing tag
                indentLevel = Math.max(0, indentLevel - 1);
                let j = i;
                while (j < svg.length && svg[j] !== '>') {
                    currentLine += svg[j];
                    j++;
                }
                if (j < svg.length) {
                    currentLine += svg[j];
                    i = j;
                }
                lines.push(indent.repeat(indentLevel) + currentLine.trim());
                currentLine = '';
            } else if (svg.substring(i, i + 4) === '<!--') {
                // Comment
                let j = i;
                while (j < svg.length && svg.substring(j, j + 3) !== '-->') {
                    currentLine += svg[j];
                    j++;
                }
                if (j < svg.length) {
                    currentLine += svg.substring(j, j + 3);
                    i = j + 2;
                }
                lines.push(indent.repeat(indentLevel) + currentLine.trim());
                currentLine = '';
            } else {
                // Opening tag or self-closing
                let j = i;
                while (j < svg.length && svg[j] !== '>') {
                    currentLine += svg[j];
                    j++;
                }
                if (j < svg.length) {
                    currentLine += svg[j];
                    i = j;
                }

                const isSelfClosing = currentLine.endsWith('/>');
                lines.push(indent.repeat(indentLevel) + currentLine.trim());

                if (!isSelfClosing) {
                    indentLevel++;
                }
                currentLine = '';
            }
        } else if (char === '\n' || char === '\r') {
        } else {
            currentLine += char;
        }
    }

    if (currentLine.trim()) {
        lines.push(indent.repeat(indentLevel) + currentLine.trim());
    }

    return lines.join('\n');
}
