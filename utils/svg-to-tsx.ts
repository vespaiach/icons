import { camelCase } from 'lodash';

export function svgToReactComponent(icon: {
    name: string;
    size: number | string;
    color?: string;
    svgString: string;
}): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(icon.svgString, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (!svgElement) {
        throw new Error('Invalid SVG string');
    }

    // Process all child elements
    let innerContent = '';
    let prefix = '';
    svgElement.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            innerContent += prefix + convertElementAttributes(node as Element);
            prefix = '\n            ';
        }
    });

    let componentName = icon.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    // Variable names cannot start with a number, add Icon prefix if needed
    if (/^\d/.test(componentName)) {
        componentName = `Icon${componentName}`;
    }

    // Extract attributes
    const hasFillColor = icon.svgString.includes('fill="CurrentColor"');
    const hasStrokeColor = icon.svgString.includes('stroke="CurrentColor"');

    const attributes: string[] = [];
    Array.from(svgElement.attributes).forEach((attr) => {
        if (attr.name === 'fill' && attr.value === 'CurrentColor') {
            attributes.push('fill={fill}');
            return;
        }
        if (attr.name === 'stroke' && attr.value === 'CurrentColor') {
            attributes.push('stroke={stroke}');
            return;
        }
        attributes.push(`${camelCase(attr.name)}="${attr.value}"`);
    });

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

function convertElementAttributes(element: Element): string {
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

    // Build attributes string
    const attrs = Array.from(element.attributes)
        .map((attr) => {
            const name = attributeMap[attr.name] || attr.name;
            return `${name}="${attr.value}"`;
        })
        .join(' ');

    // Get tag name
    const tagName = element.tagName;

    // Check if self-closing
    if (element.children.length === 0 && !element.textContent?.trim()) {
        return `<${tagName}${attrs ? ` ${attrs}` : ''} />`;
    }

    // Process children recursively
    let children = '';
    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            children += convertElementAttributes(node as Element);
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
            children += node.textContent;
        }
    });

    return `<${tagName}${attrs ? ` ${attrs}` : ''}>${children}</${tagName}>`;
}
