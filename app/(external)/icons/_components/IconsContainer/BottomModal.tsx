'use client';

import { Copy, Download, ExternalLink, Star } from 'lucide-react';
import { useState } from 'react';
import useDownloadIconTsx from '@/hooks/useDownloadIconTsx';
import useDownloadRawIcon from '@/hooks/useDownloadRawIcon';
import useGithubRepoInfo from '@/hooks/useGithubStarCount';
import { assertDate, assertNumber, assertString } from '@/utils/assert-helpers';
import { cx } from '@/utils/common-helpers';
import { useSelectedIcon } from './IconContext';

const gridLineNumber = new Array(24).fill(0);

export default function BottomModal({
    repositoriesMap,
    directoriesMap
}: {
    repositoriesMap: Record<number, RepositoryWithIconCount>;
    directoriesMap: Record<number, Directory>;
}) {
    const { selectedIcon, setSelectedIcon } = useSelectedIcon();
    const repository = selectedIcon ? repositoriesMap[selectedIcon.repositoryId] : null;
    const directory = selectedIcon ? directoriesMap[selectedIcon.directoryId] : null;

    const handleClose = () => {
        setSelectedIcon(null);
    };

    return (
        <dialog id="bottom_panel" className="d-modal d-modal-bottom">
            <div className="d-modal-box">
                {selectedIcon && repository && directory && (
                    <SelectedIconDetails
                        selectedIcon={selectedIcon}
                        repository={repository}
                        directory={directory}
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
    directory
}: {
    selectedIcon: IconWithRelativeData;
    repository: RepositoryWithIconCount;
    directory: Directory;
}) {
    const repoInfo = useGithubRepoInfo(repository);
    const [copied, setCopied] = useState(false);
    const handleDownloadTSX = useDownloadIconTsx(selectedIcon);
    const handleDownloadRawIcon = useDownloadRawIcon(selectedIcon);

    // State for adjustable properties
    const [iconSize, setIconSize] = useState(200);
    const [strokeColor, setStrokeColor] = useState(selectedIcon.svgAttributes.stroke || null);
    const [strokeWidth, setStrokeWidth] = useState(
        selectedIcon.svgAttributes['stroke-width'] ? Number(selectedIcon.svgAttributes['stroke-width']) : null
    );
    const [fillColor, setFillColor] = useState(selectedIcon.svgAttributes.fill || null);

    const getAdjustedAttributes = () =>
        Object.fromEntries(
            [
                ['width', iconSize],
                ['height', iconSize],
                ['stroke', strokeColor],
                ['fill', fillColor],
                ['strokeWidth', strokeWidth]
            ].filter(([_, value]) => value !== null)
        );

    const handleCopyName = () => {
        navigator.clipboard.writeText(selectedIcon.name);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const githubUrl = `https://github.com/${repository.owner}/${repository.name}`;

    return (
        <div className="flex items-start gap-10">
            <div className="shrink-0">
                <div className="w-64 h-64 bg-base-200 flex items-center justify-center rounded relative">
                    <svg
                        className="absolute top-0 left-0 w-full h-full stroke-base-300 opacity-60 z-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke-width="0.1"
                        xmlns="http://www.w3.org/2000/svg">
                        {gridLineNumber.map((_, index) => (
                            <g key={index}>
                                <line x1="0" y1={index} x2="24" y2={index}></line>
                                <line x1={index} y1="0" x2={index} y2="24"></line>
                            </g>
                        ))}
                    </svg>
                    <svg
                        {...selectedIcon.svgAttributes}
                        fill={fillColor === 'none' ? 'none' : fillColor || undefined}
                        stroke={strokeColor || undefined}
                        strokeWidth={strokeWidth || undefined}
                        width={iconSize}
                        height={iconSize}
                        className="z-10"
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: have to use it to render SVG content
                        dangerouslySetInnerHTML={{ __html: selectedIcon.svgContent }}
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

                <div className="space-y-1">
                    <div className="flex gap-2">
                        <span className="text-sm shrink-0 font-semibold">github:</span>
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-link d-link-hover inline-flex grow items-center gap-2 text-sm">
                            <span>
                                {repository.owner}/{repository.name}
                            </span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    {assertNumber(repoInfo?.starCount) && (
                        <div className="flex gap-2">
                            <span className="text-sm shrink-0 font-semibold">star(s):</span>
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="d-link d-link-hover inline-flex grow items-center gap-2">
                                <span className="text-sm flex items-center gap-1">
                                    <Star className="w-3 h-3" /> {repoInfo.starCount.toLocaleString()}
                                </span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}
                    {assertString(repoInfo?.license) && (
                        <div className="flex gap-2">
                            <span className="text-sm shrink-0 font-semibold">license:</span>
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="d-link d-link-hover inline-flex grow items-center gap-2 text-sm">
                                <span>{repoInfo.license}</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}
                    {assertDate(repoInfo?.createdAt) && (
                        <div className="flex gap-2">
                            <span className="text-sm shrink-0 font-semibold">created at:</span>
                            <span className="d-link no-underline text-sm cursor-default">
                                {repoInfo.createdAt.toLocaleDateString()}
                            </span>
                        </div>
                    )}
                    {assertDate(repoInfo?.lastUpdatedAt) && (
                        <div className="flex gap-2">
                            <span className="text-sm shrink-0 font-semibold">updated at:</span>
                            <span className="d-link no-underline text-sm cursor-default">
                                {repoInfo.lastUpdatedAt.toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>

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

                <div className="space-y-3">
                    {/* Size Control */}
                    <div>
                        <label htmlFor="size-control" className="text-xs font-medium block mb-1">
                            Size: {iconSize}px
                        </label>
                        <input
                            id="size-control"
                            type="range"
                            min="50"
                            max="300"
                            value={iconSize}
                            onChange={(e) => setIconSize(Number.parseInt(e.target.value))}
                            className="d-range d-range-xs"
                        />
                    </div>

                    {/* Stroke Color Control */}
                    {strokeColor !== null && (
                        <div>
                            <label htmlFor="stroke-color" className="text-xs font-medium block mb-1">
                                Stroke Color
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="stroke-color"
                                    type="color"
                                    value={strokeColor}
                                    onChange={(e) => setStrokeColor(e.target.value)}
                                    className="d-input d-input-bordered d-input-xs w-16 h-8 p-1 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={strokeColor}
                                    onChange={(e) => setStrokeColor(e.target.value)}
                                    className="d-input d-input-bordered d-input-xs flex-1 font-mono text-xs"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    )}

                    {/* Fill Color Control */}
                    {fillColor !== null && fillColor !== 'none' && (
                        <div>
                            <label htmlFor="fill-color" className="text-xs font-medium block mb-1">
                                Fill Color
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="fill-color"
                                    type="color"
                                    value={fillColor}
                                    onChange={(e) => setFillColor(e.target.value)}
                                    className="d-input d-input-bordered d-input-xs w-16 h-8 p-1 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={fillColor}
                                    onChange={(e) => setFillColor(e.target.value)}
                                    className="d-input d-input-bordered d-input-xs flex-1 font-mono text-xs"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    )}

                    {/* Stroke Width Control */}
                    {strokeWidth !== null && (
                        <div>
                            <label htmlFor="stroke-width" className="text-xs font-medium block mb-1">
                                Stroke Width: {strokeWidth}
                            </label>
                            <input
                                id="stroke-width"
                                type="range"
                                min="0.5"
                                max="10"
                                step="0.5"
                                value={strokeWidth}
                                onChange={(e) => setStrokeWidth(Number.parseFloat(e.target.value))}
                                className="d-range d-range-xs"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
