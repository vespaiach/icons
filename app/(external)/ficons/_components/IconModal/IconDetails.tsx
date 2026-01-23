'use client';

import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import AstToSvg from '@/components/AstToSvg';
import ColorAdjuster from '@/components/ColorAdjuster';
import SizeAdjuster from '@/components/SizeAdjuster';
import { cx } from '@/utils/common-helpers';
import FavoriteButton from '../FavoriteButton';
import CopyButton from './CopyButton';
import DownloadButton from './DownloadButton';

const gridLineNumber = new Array(24).fill(0);

export default function IconDetails({
    selectedIcon,
    variant,
    adjustment
}: {
    selectedIcon: IconWithRelativeData;
    variant: Variant;
    adjustment: { color: string; size: number };
}) {
    const [copied, setCopied] = useState(false);

    // State for adjustable properties
    const [attributes, setAttributes] = useState({ size: adjustment.size, color: adjustment.color });
    const adjustmentForDisplay = useMemo(() => ({ color: attributes.color, size: '80%' }), [attributes]);

    const handleCopyName = () => {
        navigator.clipboard.writeText(selectedIcon.name);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <>
            <div className="flex items-center gap-3">
                <button
                    className={cx(
                        'd-btn d-btn-ghost d-btn-sm d-btn-secondary -ml-2 px-2 border-none group shadow-none',
                        copied && 'd-tooltip d-tooltip-right d-tooltip-open'
                    )}
                    data-tip={copied ? 'Copied!' : undefined}
                    type="button"
                    onClick={handleCopyName}>
                    <span className="font-bold text-xl font-mono">{selectedIcon.name}</span>
                    <Copy className="w-4 h-4 opacity-0 group-has-hover:opacity-100 text-white" />
                </button>
                <FavoriteButton icon={selectedIcon} />
            </div>
            <div className="mt-3 flex flex-col md:flex-row gap-4 justify-between">
                <div className="shrink-0">
                    <div className="w-full aspect-square md:w-44.5 md:h-44.5 bg-base-200 flex items-center justify-center rounded relative">
                        <svg
                            className="absolute top-0 left-0 w-full h-full stroke-base-300 opacity-60 z-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth="0.1"
                            xmlns="http://www.w3.org/2000/svg">
                            <title>Grid Lines</title>
                            {gridLineNumber.map((_, index) => (
                                <g key={index}>
                                    <line x1="0" y1={index} x2="24" y2={index}></line>
                                    <line x1={index} y1="0" x2={index} y2="24"></line>
                                </g>
                            ))}
                        </svg>
                        <AstToSvg
                            svgAst={selectedIcon.svgAst}
                            variant={variant}
                            adjustment={adjustmentForDisplay}
                            className="z-10"
                        />
                    </div>
                </div>
                <div className="shrink-0">
                    <SizeAdjuster
                        size={attributes.size}
                        onSizeChange={(newSize) => setAttributes({ ...attributes, size: newSize })}
                    />
                    <ColorAdjuster
                        className="mt-3 space-y-3"
                        color={attributes.color}
                        onColorChange={(newColor) => setAttributes({ ...attributes, color: newColor })}
                    />

                    <div className="flex gap-3 mt-6">
                        <CopyButton icon={selectedIcon} variant={variant} adjustment={attributes} />
                        <DownloadButton icon={selectedIcon} variant={variant} adjustment={attributes} />
                    </div>
                </div>
            </div>
        </>
    );
}
