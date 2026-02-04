import { XMLParser } from 'fast-xml-parser';
import { camelCase } from 'lodash';

export function svgToReactComponent(icon: {
    name: string;
    size: number | string;
    color?: string;
    svgString: string;
}): string {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        preserveOrder: true
    });

    const parsed = parser.parse(icon.svgString);
    const svgElement = parsed.find((node: { [key: string]: unknown }) => node.svg);

    if (!svgElement) {
        throw new Error('Invalid SVG string');
    }

    // Process all child elements
    let innerContent = '';
    let prefix = '';
    const children = svgElement.svg || [];

    for (const child of children) {
        const elementName = Object.keys(child).find((key) => !key.startsWith('@_') && key !== '#text');
        if (elementName) {
            innerContent += prefix + convertElement(child);
            prefix = '\n            ';
        }
    }

    let componentName = icon.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    // Variable names cannot start with a number, add Icon prefix if needed
    if (/^\d/.test(componentName)) {
        componentName = `Icon${componentName}`;
    }

    // Extract attributes from svg element
    const hasFillColor = icon.svgString.includes('fill="CurrentColor"');
    const hasStrokeColor = icon.svgString.includes('stroke="CurrentColor"');

    const svgAttrs = extractAttributes(svgElement.svg[':@'] || {});
    const attributes: string[] = [];

    for (const [key, value] of Object.entries(svgAttrs)) {
        if (key === 'fill' && value === 'CurrentColor') {
            attributes.push('fill={fill}');
            continue;
        }
        if (key === 'stroke' && value === 'CurrentColor') {
            attributes.push('stroke={stroke}');
            continue;
        }
        attributes.push(`${camelCase(key)}="${value}"`);
    }

    const title = `${icon.name.replace(/-/g, ' ')} icon`;

    return `import type { SVGProps, ReactNode } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
    size?: number;
}

export default function ${componentName}({
    width,
    height,
    title = "${title}",
    size = ${icon.size || 24},${hasFillColor ? `\n    fill = "${icon.color || 'currentColor'}",` : ''}${hasStrokeColor ? `\n    stroke = "${icon.color || 'currentColor'}",` : ''}
    ...rest
}: IconProps): ReactNode {
    return (
        <svg
            {...rest}
            width={width || size}
            height={height || size}
            ${attributes.join('\n            ')}>
            <title>{title}</title>
            ${innerContent}
        </svg>
    );
}
`;
}

function extractAttributes(attrObj: Record<string, unknown>): Record<string, string> {
    const attrs: Record<string, string> = {};
    for (const key of Object.keys(attrObj)) {
        if (key.startsWith('@_')) {
            const attrName = key.substring(2);
            attrs[attrName] = String(attrObj[key]);
        }
    }
    return attrs;
}

function convertElement(node: Record<string, unknown>): string {
    const attributeMap: Record<string, string> = {
        'stroke-width': 'strokeWidth',
        'stroke-linecap': 'strokeLinecap',
        'stroke-linejoin': 'strokeLinejoin',
        'stroke-miterlimit': 'strokeMiterlimit',
        'stroke-dasharray': 'strokeDasharray',
        'stroke-dashoffset': 'strokeDashoffset',
        'stroke-opacity': 'strokeOpacity',
        'fill-opacity': 'fillOpacity',
        'fill-rule': 'fillRule',
        'clip-path': 'clipPath',
        'clip-rule': 'clipRule'
    };

    // Get element name
    const elementName = Object.keys(node).find((key) => !key.startsWith('@_') && key !== '#text');
    if (!elementName) {
        return '';
    }

    const tagName = elementName;
    const element = node[elementName];

    // Extract attributes
    const attrObj = (node[':@'] as Record<string, unknown>) || {};
    const attrs = extractAttributes(attrObj);
    const attrsString = Object.entries(attrs)
        .map(([name, value]) => {
            const reactName = attributeMap[name] || name;
            return `${reactName}="${value}"`;
        })
        .join(' ');

    // Check if element has children
    if (!Array.isArray(element) || element.length === 0) {
        return `<${tagName}${attrsString ? ` ${attrsString}` : ''} />`;
    }

    // Process children
    let children = '';
    for (const child of element) {
        if (typeof child === 'object' && child !== null) {
            if (child['#text']) {
                children += child['#text'];
            } else {
                children += convertElement(child);
            }
        }
    }

    if (!children.trim()) {
        return `<${tagName}${attrsString ? ` ${attrsString}` : ''} />`;
    }

    return `<${tagName}${attrsString ? ` ${attrsString}` : ''}>${children}</${tagName}>`;
}
