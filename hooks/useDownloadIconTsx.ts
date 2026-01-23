'use client';

import { useCallback } from 'react';
import { astToInnerHtml } from '@/utils/ast-2-html';

export default function useDownloadIconTsx(icon: Icon) {
    return useCallback(
        (adjustedAttributes: Record<string, string>) => {
            const componentName = icon.name
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join('');
            const title = `${icon.name.replace(/-/g, ' ')} icon`;
            const { width, height, ...rest } = { ...icon.svgAst.attrs, ...adjustedAttributes };

            const content = `
import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
}

export default function ${componentName} ({
    title = "${title}",
    width = ${width || 24},
    height = ${height || 24},
    ...rest
}: IconProps): React.ReactNode {
    return (
        <svg
            {...rest}
            ${Object.entries(rest)
                .map(([key, value]) => `${key}="${value}"`)
                .join('\n            ')}
            width={width}
            height={height}>
            <title>{title}</title>
            ${astToInnerHtml(icon.svgAst)}
        </svg>
    );
}
        `;

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${componentName}.tsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        [icon]
    );
}
