import { camelCase } from 'lodash';
import { mergeAttributes } from './string-helpers';

function htmlAttributeToJsx(attrName: string): string {
    // Keep aria- attributes as-is
    if (attrName.startsWith('aria-')) {
        return attrName;
    }
    // Convert hyphenated attributes to camelCase for JSX
    return camelCase(attrName);
}

export function astToInnerTsx(ast: SvgNode): string {
    if (!ast.children || ast.children.length === 0) {
        return '';
    }

    return ast.children.map((child) => astToTsxNode(child)).join('\n            ');
}

export function astToTsxNode(node: SvgNode): string {
    // Separate textContent from other attributes
    const { textContent, ...otherAttrs } = node.attrs;

    const attrs = Object.entries(otherAttrs)
        .map(([key, attrValue]) => {
            if (attrValue === undefined || attrValue === null) return '';

            const jsxKey = htmlAttributeToJsx(key);

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
        jsx += node.children.map((child) => astToTsxNode(child)).join('');
    }

    // Add closing tag
    jsx += `</${node.type}>`;

    return jsx;
}

export function astToTsx(icon: {
    name: string;
    svgAst: SvgNode;
    size?: number | string;
    fill?: string;
    stroke?: string;
}): string {
    let componentName = icon.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    // Variable names cannot start with a number, add Icon prefix if needed
    if (/^\d/.test(componentName)) {
        componentName = `Icon${componentName}`;
    }

    const title = `${icon.name.replace(/-/g, ' ')} icon`;
    const attrs = Object.entries(icon.svgAst.attrs)
        .map(([key, value]) => {
            const jsxKey = htmlAttributeToJsx(key);
            if (value === undefined || value === null) {
                return '';
            }
            if (typeof value === 'boolean') {
                return value ? jsxKey : '';
            }
            if (typeof value === 'number') {
                return `${jsxKey}={${value}}`;
            }
            if (typeof value === 'string' && value.includes('{') && value.includes('}')) {
                return `${jsxKey}=${value}`;
            }
            return `${jsxKey}="${value}"`;
        })
        .filter(Boolean)
        .join('\n            ');

    const innerTsx = astToInnerTsx(icon.svgAst);

    const content = `import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
    size?: number;
}

export default function ${componentName}({
    width,
    height,
    title = "${title}",
    size = ${icon.size || 24},${icon.fill ? `\n    fill = "${icon.fill}",` : ''}${icon.stroke ? `\n    stroke = "${icon.stroke}",` : ''}
    ...rest
}: IconProps): React.ReactNode {
    return (
        <svg
            {...rest}
            ${attrs}>
            <title>{title}</title>
            ${innerTsx}
        </svg>
    );
}
`;
    return content;
}

export function prepareAstToTsx(
    svgAst: SvgNode,
    variant: Pick<Variant, 'fill' | 'fillOn' | 'stroke' | 'strokeOn' | 'strokeWidth' | 'strokeWidthOn'>,
    adjustment?: Adjustment
): SvgNode {
    const color = adjustment?.color;
    const ast = {
        ...svgAst,
        attrs: { ...svgAst.attrs, width: '{width || size}', height: '{height || size}' } as Record<
            string,
            string | undefined
        >
    };

    const fill = mergeAttributes(variant.fill, color);
    const stroke = mergeAttributes(variant.stroke, color);

    const applyColorToChildren = (node: SvgNode) => {
        if (node.children) {
            node.children.forEach((child) => {
                if (fill && (variant.fillOn === 'children' || variant.fillOn === 'both')) {
                    child.attrs.fill = '{fill}';
                }
                if (stroke && (variant.strokeOn === 'children' || variant.strokeOn === 'both')) {
                    child.attrs.stroke = '{stroke}';
                }
                applyColorToChildren(child);
            });
        }
    };

    if (fill && (variant.fillOn === 'parent' || variant.fillOn === 'both')) {
        ast.attrs.fill = '{fill}';
    }
    if (stroke && (variant.strokeOn === 'parent' || variant.strokeOn === 'both')) {
        ast.attrs.stroke = '{stroke}';
    }

    applyColorToChildren(ast);
    return ast;
}
