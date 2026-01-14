'use client';

import { ExternalLink, Info, Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Fragment, use, useMemo, useRef } from 'react';
import AstToSvg from '@/components/AstToSvg';
import { repoToId } from '@/utils/common-helpers';
import { usePageContext } from './PageContext';

const filterFunc = (query: string) => (icon: IconWithRelativeData) =>
    icon.name.toLowerCase().startsWith(query.toLowerCase());

export default function IconSection({
    repository,
    iconsPromise
}: {
    repository: Repository;
    iconsPromise: Promise<IconWithRelativeData[]>; // The icons for this repository for all variants
}) {
    const variantsRef = useRef<Variant[] | null>(null);
    const icons = use(iconsPromise);
    const iconsByVariant = useMemo(
        () =>
            icons.reduce(
                (acc, icon) => {
                    acc[icon.variantId] = acc[icon.variantId] || [];
                    acc[icon.variantId].push(icon);
                    return acc;
                },
                {} as Record<number, IconWithRelativeData[]>
            ),
        [icons]
    );

    const { variants: _variants, selectedRepository } = usePageContext();

    // Use variantsRef to prevent re-rendering while users are changing svg attributes
    variantsRef.current = _variants;
    const isDrawerOpen = !selectedRepository;

    // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to recalculate when isDrawerOpen changes
    const variantByRepositories = useMemo(() => {
        if (!variantsRef.current) return [];
        const variantIds = new Set(Object.keys(iconsByVariant).map((id) => Number(id)));

        return variantsRef.current.filter((v) => variantIds.has(v.id));
    }, [iconsByVariant, isDrawerOpen]);

    const { setSelectedRepository } = usePageContext();

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const filteredIconsByVariant = useMemo(() => {
        if (!searchQuery) return iconsByVariant;

        const lowerQuery = searchQuery.toLowerCase();

        for (const _key of Object.keys(iconsByVariant)) {
            const key = Number(_key);
            iconsByVariant[key] = iconsByVariant[key].filter(filterFunc(lowerQuery));
        }

        return iconsByVariant;
    }, [iconsByVariant, searchQuery]);

    return (
        <div
            className="pb-12 px-4"
            id={repoToId(repository)}
            data-name={`${repository.owner}/${repository.name}`}
            style={{ scrollMarginTop: '72px' }}>
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

                <div className="d-tabs d-tabs-lift mt-3">
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

function IconContent({ icons, variant }: { icons: IconWithRelativeData[]; variant: Variant }) {
    return icons.map((icon) => {
        return (
            <div className="icon" key={icon.id}>
                <IconButton icon={icon} variant={variant} />
            </div>
        );
    });
}

function IconButton({
    icon,
    variant
}: {
    icon: IconWithRelativeData;
    variant: Variant;
    reportDefaultAttribute?: boolean;
}) {
    const { setSelectedIcon } = usePageContext();
    const iconElement = useMemo(() => {
        return (
            <AstToSvg
                svgAst={icon.svgAst}
                fill={variant.defaultSvgAttributes.fillColor}
                stroke={variant.defaultSvgAttributes.strokeColor}
                strokeWidth={variant.defaultSvgAttributes.strokeWidth}
                width={20}
                height={20}
            />
        );
    }, [icon.svgAst, variant.defaultSvgAttributes]);

    return (
        <button
            onClick={() => {
                setSelectedIcon(icon);
            }}
            type="button"
            className="cursor-pointer d-tooltip d-tooltip-bottom"
            data-tip={icon.name}>
            {iconElement}
        </button>
    );
}
