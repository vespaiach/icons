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

export function astToSvgAttributes(ast: SvgNode): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(ast.attrs)) {
        result[key] = String(value);
    }
    return result;
}

export function astToInnerHtml(ast: SvgNode, customAttributes?: Record<string, string | undefined>): string {
    if (!ast.children || ast.children.length === 0) {
        return '';
    }

    return ast.children.map((child) => astToHtml(child, customAttributes)).join('');
}

export function astToHtml(node: SvgNode, customAttributes?: Record<string, string | undefined>): string {
    // Separate textContent from other attributes
    const { textContent, ...otherAttrs } = node.attrs;

    const attrs = Object.entries(otherAttrs)
        .map(([key, value]) => {
            if (customAttributes && key in customAttributes && customAttributes[key] !== undefined) {
                return `${key}="${customAttributes[key]}"`;
            }
            return `${key}="${value}"`;
        })
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
        html += node.children.map((child) => astToHtml(child, customAttributes)).join('');
    }

    // Add closing tag
    html += `</${node.type}>`;

    return html;
}

export function astToSvgString(ast: SvgNode, customAttributes?: Record<string, string | undefined>): string {
    const attrs = Object.entries(ast.attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

    const innerHtml = astToInnerHtml(ast, customAttributes);
    return `<svg${attrs ? ` ${attrs}` : ''}>${innerHtml}</svg>`;
}

function htmlAttributeToJsx(attrName: string): string {
    // Keep aria- attributes as-is
    if (attrName.startsWith('aria-')) {
        return attrName;
    }
    // Convert hyphenated attributes to camelCase for JSX
    return camelCase(attrName);
}

export function astToInnerTsx(ast: SvgNode, customAttributes?: Record<string, string | undefined>): string {
    if (!ast.children || ast.children.length === 0) {
        return '';
    }

    return ast.children.map((child) => astToTsxNode(child, customAttributes)).join('\n            ');
}

export function astToTsxNode(node: SvgNode, customAttributes?: Record<string, string | undefined>): string {
    // Separate textContent from other attributes
    const { textContent, ...otherAttrs } = node.attrs;

    const attrs = Object.entries(otherAttrs)
        .map(([key, value]) => {
            const jsxKey = htmlAttributeToJsx(key);
            let attrValue: string | number | boolean = value;

            if (customAttributes && key in customAttributes && customAttributes[key] !== undefined) {
                attrValue = customAttributes[key] as string;
            }

            // Handle different value types for JSX
            if (typeof attrValue === 'boolean') {
                return attrValue ? jsxKey : '';
            }
            if (typeof attrValue === 'number') {
                return `${jsxKey}={${attrValue}}`;
            }
            // String - check if it contains JSX expression (curly brackets)
            if (typeof attrValue === 'string' && attrValue.includes('{') && attrValue.includes('}')) {
                return `${jsxKey}=${attrValue}`;
            }
            // String (default)
            return `${jsxKey}="${attrValue}"`;
        })
        .filter(Boolean)
        .join(' ');

    // If no children and no text content, it's a self-closing tag
    if ((!node.children || node.children.length === 0) && !textContent) {
        return `<${node.type}${attrs ? ` ${attrs}` : ''} />`;
    }

    // Build opening tag
    let jsx = `<${node.type}${attrs ? ` ${attrs}` : ''}>`;

    // Add text content if present
    if (textContent) {
        jsx += textContent;
    }

    // Add children if present
    if (node.children && node.children.length > 0) {
        jsx += node.children.map((child) => astToTsxNode(child, customAttributes)).join('');
    }

    // Add closing tag
    jsx += `</${node.type}>`;

    return jsx;
}

export function astToTsx(
    icon: { name: string; svgAst: SvgNode },
    customAttributes?: Record<string, string | undefined>
): string {
    const componentName = icon.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    const title = `${icon.name.replace(/-/g, ' ')} icon`;
    const { width, height, ...rest } = icon.svgAst.attrs;

    const fill = customAttributes?.fill ?? icon.svgAst.attrs.fill;
    const stroke = customAttributes?.stroke ?? icon.svgAst.attrs.stroke;

    const innerTsx = astToInnerTsx(icon.svgAst, {
        fill: customAttributes?.fill ? `{fill}` : undefined,
        stroke: customAttributes?.stroke ? `{stroke}` : undefined
    });
    const restAttrs = Object.entries(rest)
        .filter(([key]) => ['width', 'height', 'fill', 'stroke'].indexOf(key) === -1)
        .map(([key, value]) => `${key}="${value}"`)
        .join('\n            ');

    const content = `import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
}

export default function ${componentName}({
    title = "${title}",
    width = ${width || 24},
    height = ${height || 24},${fill ? `\n    fill = "${fill}",` : ''}${stroke ? `\n    stroke = "${stroke}",` : ''}
    ...rest
}: IconProps): React.ReactNode {
    return (
        <svg
            ${restAttrs}
            {...rest}
            width={width}
            height={height}${fill ? `\n            fill={fill}` : ''}${stroke ? `\n            stroke={stroke}` : ''}>
            <title>{title}</title>
            ${innerTsx}
        </svg>
    );
}
`;
    return content;
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
