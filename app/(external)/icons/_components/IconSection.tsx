'use client';

import { useIntersectionObserver, useIsClient } from '@uidotdev/usehooks';
import { ExternalLink, Info, Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { use, useMemo, useState } from 'react';
import AstToSvg from '@/components/AstToSvg';
import { cx, nameToId } from '@/utils/common-helpers';
import { type ExtendedVariant, usePageContext } from './PageContext';

const ICON_SIZE = 56;

export default function IconSection({
    repository,
    iconsPromise
}: {
    repository: Repository;
    iconsPromise: Promise<IconWithRelativeData[]>;
}) {
    const icons = use(iconsPromise);

    const { variantsById } = usePageContext();
    const variants = Object.values(variantsById).sort((a, b) => a.name.localeCompare(b.name));
    const [selectedVariantId, setSelectedVariantId] = useState(variants[0].id);
    const variant = variantsById[selectedVariantId];

    const isClient = useIsClient();
    const { setSelectedRepository } = usePageContext();
    const [contentRef, entry] = useIntersectionObserver<HTMLDivElement>({
        threshold: 0,
        root: null,
        rootMargin: '0px'
    });
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const filteredIcons = useMemo(() => {
        const iconsByVariant = icons.filter((i) => i.variantId === selectedVariantId);

        if (!searchQuery) return iconsByVariant;

        const lowerQuery = searchQuery.toLowerCase();
        return iconsByVariant.filter((icon) => icon.name.toLowerCase().startsWith(lowerQuery));
    }, [icons, searchQuery, selectedVariantId]);

    const iconCount = filteredIcons.length;
    const minHeight = useMemo(() => {
        if (!isClient || iconCount === 0) return 0;
        const rows = Math.ceil(iconCount / Math.floor((window.innerWidth - 32) / ICON_SIZE)); // 32px padding left and right
        return rows * ICON_SIZE + (rows - 1) * 8; // 8px gap
    }, [iconCount, isClient]);

    if (filteredIcons.length === 0) return null;

    return (
        <div className="pb-12 px-4" id={nameToId(repository.name)} style={{ scrollMarginTop: '72px' }}>
            <div className="mb-4">
                <h2 className="font-semibold text-lg capitalize flex items-center">
                    {repository.owner}/{repository.name} ({filteredIcons.length})
                    <a
                        href={`https://github.com/${repository.owner}/${repository.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-btn d-btn-ghost d-btn-sm d-btn-square cursor-pointer ml-4">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                        type="button"
                        className="d-btn d-btn-ghost d-btn-sm d-btn-square cursor-pointer"
                        aria-label="Repository Information"
                        onClick={() => {
                            setSelectedRepository(repository);
                        }}>
                        <Info className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        className="d-btn d-btn-ghost d-btn-sm d-btn-square cursor-pointer"
                        aria-label="Repoisitory Settings"
                        onClick={() => {
                            setSelectedRepository(repository);
                        }}>
                        <Settings className="w-4 h-4" />
                    </button>
                </h2>
                {variants.length > 1 && (
                    <div role="tablist" className="d-tabs d-tabs-lift d-tabs-sm mt-3">
                        {variants.map((variant) => (
                            <button
                                type="button"
                                key={variant.id}
                                role="tab"
                                className={cx('d-tab', selectedVariantId === variant.id && 'd-tab-active')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedVariantId(variant.id);
                                }}>
                                {variant.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="icons-grid" ref={contentRef} style={{ minHeight }}>
                {Boolean(entry?.isIntersecting) && variant && (
                    <IconContent icons={filteredIcons} variant={variant} />
                )}
            </div>
        </div>
    );
}

function IconContent({ icons, variant }: { icons: IconWithRelativeData[]; variant: ExtendedVariant }) {
    const { setSelectedIcon } = usePageContext();

    return icons.map((icon) => {
        return (
            <div className="icon" key={icon.id}>
                <button
                    onClick={() => {
                        setSelectedIcon(icon);
                    }}
                    type="button"
                    className="cursor-pointer d-tooltip d-tooltip-bottom"
                    data-tip={icon.name}>
                    <AstToSvg svgAst={icon.svgAst} {...variant.svgAttributes} width={20} height={20} />
                </button>
            </div>
        );
    });
}
