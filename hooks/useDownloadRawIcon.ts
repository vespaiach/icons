'use client';

import { useCallback } from 'react';
import { astToInnerHtml } from '@/utils/client-side/svg-helpers';

export default function useDownloadRawIcon(icon: Icon) {
    return useCallback(
        (adjustedAttributes: Record<string, string>) => {
            const { width, height, ...rest } = { ...icon.svgAst.attrs, ...adjustedAttributes };
            const innerContent = astToInnerHtml(icon.svgAst);
            const svgContent = `<svg width="${width || 24}" height="${height || 24}" ${Object.entries(rest)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ')}>${innerContent}</svg>`;

            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${icon.name}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        [icon]
    );
}
