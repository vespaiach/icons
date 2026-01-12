'use client';

import { Copy, Download } from 'lucide-react';
import { useState } from 'react';
import AstToSvg from '@/components/AstToSvg';
import AttributesAdjuster from '@/components/AttributesAdjuster';
import useDownloadIconTsx from '@/hooks/useDownloadIconTsx';
import useDownloadRawIcon from '@/hooks/useDownloadRawIcon';
import { cx } from '@/utils/common-helpers';
import { type ExtendedVariant, usePageContext } from './PageContext';
import RepositoryInfo from './RepositoryInfo';

const gridLineNumber = new Array(24).fill(0);

export default function IconDetailsModal({ repositories }: { repositories: Repository[] }) {
    const { selectedIcon, setSelectedIcon, getVariantsByRepositoryId } = usePageContext();
    const repository = selectedIcon
        ? repositories.find((repo) => repo.id === selectedIcon.repositoryId)
        : null;
    const variant = selectedIcon
        ? getVariantsByRepositoryId(selectedIcon.repositoryId)[selectedIcon.variantId]
        : null;

    const handleClose = () => {
        setSelectedIcon(null);
    };

    return (
        <dialog id="bottom_panel" className="d-modal d-modal-bottom">
            <div className="d-modal-box">
                {selectedIcon && repository && variant && (
                    <SelectedIconDetails
                        selectedIcon={selectedIcon}
                        repository={repository}
                        variant={variant}
                    />
                )}
            </div>

            <form method="dialog" className="d-modal-backdrop">
                <button type="button" onClick={handleClose}>
                    close
                </button>
            </form>
        </dialog>
    );
}

function SelectedIconDetails({
    selectedIcon,
    repository,
    variant
}: {
    selectedIcon: IconWithRelativeData;
    repository: Repository;
    variant: ExtendedVariant;
}) {
    const [copied, setCopied] = useState(false);
    const handleDownloadTSX = useDownloadIconTsx(selectedIcon);
    const handleDownloadRawIcon = useDownloadRawIcon(selectedIcon);

    // State for adjustable properties
    const [attributes, setAttributes] = useState(
        variant.svgAttributes || {
            width: 24,
            height: 24
        }
    );

    const getAdjustedAttributes = () => {
        const { width: iconSize, stroke: strokeColor, fill: fillColor, strokeWidth } = attributes;

        return Object.fromEntries(
            [
                ['width', iconSize],
                ['height', iconSize],
                ['stroke', strokeColor],
                ['fill', fillColor],
                ['strokeWidth', strokeWidth]
            ].filter(([_, value]) => value !== undefined)
        );
    };

    const handleCopyName = () => {
        navigator.clipboard.writeText(selectedIcon.name);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="flex items-start gap-10">
            <div className="shrink-0">
                <div className="w-64 h-64 bg-base-200 flex items-center justify-center rounded relative">
                    <svg
                        className="absolute top-0 left-0 w-full h-full stroke-base-300 opacity-60 z-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="0.1"
                        xmlns="http://www.w3.org/2000/svg">
                        <title>Grid Lines</title>
                        {gridLineNumber.map((_, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: no better key available
                            <g key={index}>
                                <line x1="0" y1={index} x2="24" y2={index}></line>
                                <line x1={index} y1="0" x2={index} y2="24"></line>
                            </g>
                        ))}
                    </svg>
                    <AstToSvg
                        svgAst={selectedIcon.svgAst}
                        fill={attributes.fill}
                        stroke={attributes.stroke}
                        strokeWidth={attributes.strokeWidth}
                        width={attributes.width}
                        height={attributes.width}
                        className="z-10"
                    />
                </div>
            </div>
            <div className="shrink-0">
                <button
                    className={cx(
                        'd-btn d-btn-ghost d-btn-sm d-btn-primary -ml-2 px-2 border-none group shadow-none mb-3',
                        copied && 'd-tooltip d-tooltip-right d-tooltip-open'
                    )}
                    data-tip={copied ? 'Copied!' : undefined}
                    type="button"
                    onClick={handleCopyName}>
                    <span className="font-bold text-xl font-mono">{selectedIcon.name}</span>
                    <Copy className="w-4 h-4 opacity-0 group-has-hover:opacity-100 text-white" />
                </button>

                <RepositoryInfo selectedRepository={repository} />

                <div className="flex gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            handleDownloadRawIcon(getAdjustedAttributes());
                        }}
                        className="d-btn d-btn-sm d-btn-secondary d-btn-soft">
                        <Download className="w-4 h-4" />
                        Raw
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            handleDownloadTSX(getAdjustedAttributes());
                        }}
                        className="d-btn d-btn-sm d-btn-secondary d-btn-soft">
                        <Download className="w-4 h-4" />
                        TSX
                    </button>
                </div>
            </div>

            {/* Adjustable Settings */}
            <div className="d-divider lg:d-divider-horizontal m-0 bg-base-100" />
            <div className="mb-4 space-y-3">
                <h4 className="font-semibold text-sm mb-4">Customize Icon</h4>
                <AttributesAdjuster value={attributes} onChange={setAttributes} />
            </div>
        </div>
    );
}
