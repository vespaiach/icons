'use client';

import { useIntersectionObserver, useIsClient } from '@uidotdev/usehooks';
import { ExternalLink, Info, Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Fragment, use, useMemo, useRef, useState } from 'react';
import AstToSvg from '@/components/AstToSvg';
import useDefaultVariantSettings from '@/hooks/useDefaultVariantSettings';
import { cx, nameToId } from '@/utils/common-helpers';
import { type ExtendedVariant, usePageContext } from './PageContext';

const ICON_SIZE = 56;
const filterFunc = (query: string) => (icon: IconWithRelativeData) =>
    icon.name.toLowerCase().startsWith(query.toLowerCase());

export default function IconSection({
    repository,
    iconsPromise
}: {
    repository: Repository;
    iconsPromise: Promise<IconWithRelativeData[]>; // The icons for this repository for all variants
}) {
    const icons = use(iconsPromise);
    const isClient = useIsClient();

    const { variants } = usePageContext();
    const variantByRepositories = variants.filter((v) => v.repositoryId === repository.id);
    const [selectedVariantId, setSelectedVariantId] = useState(variantByRepositories[0].id);
    const selectedVariant = variantByRepositories.find((v) => v.id === selectedVariantId);

    const { setSelectedRepository } = usePageContext();
    const [contentRef, entry] = useIntersectionObserver<HTMLDivElement>({
        threshold: 0,
        root: null,
        rootMargin: '0px'
    });
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const filteredIconsByVariant = useMemo(() => {
        const iconsByVariant = icons.reduce(
            (acc, icon) => {
                acc[icon.variantId] = acc[icon.variantId] || [];
                acc[icon.variantId].push(icon);
                return acc;
            },
            {} as Record<number, IconWithRelativeData[]>
        );

        if (!searchQuery) return iconsByVariant;

        const lowerQuery = searchQuery.toLowerCase();

        for (const _key of Object.keys(iconsByVariant)) {
            const key = Number(_key);
            iconsByVariant[key] = iconsByVariant[key].filter(filterFunc(lowerQuery));
        }

        return iconsByVariant;
    }, [icons, searchQuery]);

    // const minHeight = useMemo(() => {
    //     if (!isClient || Object.keys(filteredIconsByVariant).length === 0) return 0;

    //     let maxHeight = 0;
    //     for (const icons of Object.values(filteredIconsByVariant)) {
    //         const iconCount = icons.length;
    //         const rows = Math.ceil(iconCount / Math.floor((window.innerWidth - 32) / ICON_SIZE));
    //         maxHeight = Math.max(maxHeight, rows * ICON_SIZE + (rows - 1) * 8); // 8px gap
    //     }
    //     return maxHeight;
    // }, [filteredIconsByVariant, isClient]);

    return (
        <div className="pb-12 px-4" id={nameToId(repository.name)} style={{ scrollMarginTop: '72px' }}>
            <div className="mb-4">
                <h2 className="font-semibold text-lg capitalize flex items-center">
                    {repository.owner}/{repository.name}
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
                        aria-label="Repository Settings"
                        onClick={() => {
                            setSelectedRepository(repository);
                        }}>
                        <Settings className="w-4 h-4" />
                    </button>
                </h2>

                <div className="d-tabs d-tabs-lift mt-3" ref={contentRef}>
                    {Object.keys(filteredIconsByVariant).map((_key, index) => {
                        const key = Number(_key);
                        const iconsForVariant = filteredIconsByVariant[key];
                        const variant = variantByRepositories.find((v) => v.id === key);

                        if (iconsForVariant.length === 0 || !variant) {
                            return null;
                        }

                        return (
                            <Fragment key={variant.id}>
                                <input
                                    type="radio"
                                    name={`variant_tabs_${variant.repositoryId}`}
                                    className="d-tab font-semibold"
                                    aria-label={`${variant.name} (${iconsForVariant.length})`}
                                    defaultChecked={index === 0}
                                />
                                <div className="d-tab-content mt-2">
                                    <div className="icons-grid">
                                        <IconContent icons={iconsForVariant} variant={variant} />
                                    </div>
                                </div>
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function IconContent({ icons, variant }: { icons: IconWithRelativeData[]; variant: ExtendedVariant }) {
    return icons.map((icon, index) => {
        return (
            <div className="icon" key={icon.id}>
                <IconButton icon={icon} variant={variant} checkDefault={index === 0} />
            </div>
        );
    });
}

function IconButton({
    icon,
    variant,
    checkDefault = false
}: {
    icon: IconWithRelativeData;
    variant: ExtendedVariant;
    checkDefault?: boolean;
}) {
    const svgRef = useRef<SVGSVGElement>(null);
    const { setSelectedIcon } = usePageContext();

    useDefaultVariantSettings(variant, svgRef);

    return (
        <button
            onClick={() => {
                setSelectedIcon(icon);
            }}
            type="button"
            className="cursor-pointer d-tooltip d-tooltip-bottom"
            data-tip={icon.name}>
            <AstToSvg
                svgAst={icon.svgAst}
                {...variant.svgAttributes}
                width={20}
                height={20}
                ref={checkDefault ? svgRef : undefined}
            />
        </button>
    );
}
