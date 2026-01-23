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

export function astToTsx(icon: { name: string; svgAst: SvgNode; colorOnChildren?: boolean }): string {
    let componentName = icon.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    // Variable names cannot start with a number, add Icon prefix if needed
    if (/^\d/.test(componentName)) {
        componentName = `Icon${componentName}`;
    }

    const title = `${icon.name.replace(/-/g, ' ')} icon`;
    const width = icon.svgAst.attrs.width;
    const height = icon.svgAst.attrs.height;
    const fill = icon.svgAst.attrs.fill;
    const stroke = icon.svgAst.attrs.stroke;

    const innerTsx = astToInnerTsx(icon.svgAst);

    const content = `import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
}

export default function ${componentName}({
    title = "${title}",
    width = ${width},
    height = ${height},${fill ? `\n    fill = "${fill}",` : ''}${stroke ? `\n    stroke = "${stroke}",` : ''}
    ...rest
}: IconProps): React.ReactNode {
    return (
        <svg
            {...rest}
            width={width}
            height={height}${fill && !icon.colorOnChildren ? `\n            fill={fill}` : ''}${stroke && !icon.colorOnChildren ? `\n            stroke={stroke}` : ''}>
            <title>{title}</title>
            ${innerTsx}
        </svg>
    );
}
`;
    return content;
}

export function preparedAstToTsx(
    svgAst: SvgNode,
    variant: Pick<Variant, 'fill' | 'stroke' | 'colorOnChildren'>,
    adjustment?: Adjustment
): SvgNode {
    const size = adjustment?.size || 24;
    const color = adjustment?.color || 'currentColor';
    const colorOnChildren = variant.colorOnChildren;
    const ast = {
        ...svgAst,
        attrs: { ...svgAst.attrs, width: size, height: size } as Record<string, string | undefined>
    };

    const fill = mergeAttributes(variant.fill, color);
    const stroke = mergeAttributes(variant.stroke, color);

    const applyColorToChildren = (node: SvgNode) => {
        if (node.children) {
            node.children.forEach((child) => {
                if (fill) child.attrs.fill = '{fill}';
                if (stroke) child.attrs.stroke = '{stroke}';
                applyColorToChildren(child);
            });
        }
    };

    ast.attrs.fill = fill;
    ast.attrs.stroke = stroke;

    if (colorOnChildren) {
        applyColorToChildren(ast);
    }
    return ast;
}
