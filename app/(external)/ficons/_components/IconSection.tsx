'use client';

import { ExternalLink, Info, Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { use, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import AstToSvg from '@/components/AstToSvg';
import { cx, repoToId } from '@/utils/common-helpers';
import { usePageContext } from './PageContext';

const ICON_BUTTON_SIZE = 56; // in pixels

export default function IconSection({
    iconsPromise
}: {
    iconsPromise: Promise<IconWithRelativeData[]>; // The icons for this repository for all variants
}) {
    const icons = use(iconsPromise);

    const searchParams = useSearchParams();
    const searchQuery = (searchParams.get('q') || '').toLowerCase();

    // Group and filter icons by variant and by search query
    const iconsByVariant = useMemo(
        () =>
            icons.reduce(
                (acc, icon) => {
                    acc[icon.variantId] = acc[icon.variantId] || [];

                    if (!searchQuery || icon.name.toLowerCase().startsWith(searchQuery)) {
                        acc[icon.variantId].push(icon);
                    }
                    return acc;
                },
                {} as Record<number, IconWithRelativeData[]>
            ),
        [icons, searchQuery]
    );

    const { repositories } = usePageContext();
    const repository = icons[0] ? repositories.find((repo) => repo.id === icons[0].repositoryId) : null;

    if (icons.length === 0 || !repository) return null;

    return <IconSectionContent iconsByVariant={iconsByVariant} repository={repository} />;
}

function IconSectionContent({
    iconsByVariant,
    repository
}: {
    iconsByVariant: Record<number, IconWithRelativeData[]>;
    repository: RepositoryVariants;
}) {
    const { setSelectedRepository } = usePageContext();
    const [selectedVariant, setSelectedVariant] = useState<Variant>(repository.variants[0]);

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
                <IconsTabs
                    selectedVariant={selectedVariant}
                    variants={repository.variants}
                    onSelectVariant={setSelectedVariant}
                />
                <IconsContent icons={iconsByVariant[selectedVariant.id]} selectedVariant={selectedVariant} />
            </div>
        </div>
    );
}

function IconsTabs({
    selectedVariant,
    variants,
    onSelectVariant
}: {
    selectedVariant: Variant;
    variants: Variant[];
    onSelectVariant: (variant: Variant) => void;
}) {
    const [_, startTransition] = useTransition();
    return (
        <div className="d-tabs d-tabs-lift mt-3 mb-1">
            {variants.map((variant) => (
                <button
                    type="button"
                    key={variant.id}
                    className={cx('d-tab font-semibold', selectedVariant.id === variant.id && 'd-tab-active')}
                    aria-label={`${variant.name} (${variant.iconCount})`}
                    onClick={() => {
                        startTransition(() => {
                            onSelectVariant(variant);
                        });
                    }}>
                    {variant.name} ({variant.iconCount})
                </button>
            ))}
        </div>
    );
}

function IconsGrid({ children, selectedVariant }: { children: React.ReactNode; selectedVariant: Variant }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (ref.current) {
            const width = ref.current.getBoundingClientRect().width;
            const iconCount = selectedVariant.iconCount;

            // Grid constants from CSS
            const MIN_COLUMN_WIDTH = 56; // minmax(56px, 1fr)
            const GAP = 8; // gap: 8px

            // Calculate how many columns fit in the available width
            const columnsCount = Math.floor((width + GAP) / (MIN_COLUMN_WIDTH + GAP));

            // Calculate number of rows needed
            const rowsCount = Math.ceil(iconCount / columnsCount);

            // Calculate min-height: (rows * iconSize) + (gaps between rows)
            const calculatedMinHeight = rowsCount * ICON_BUTTON_SIZE + (rowsCount - 1) * GAP;

            ref.current.style = `--min-height: ${calculatedMinHeight}px;`;
        }
    }, [selectedVariant]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(entry.isIntersecting);
                });
            },
            {
                // Start loading when element is 200px away from viewport
                rootMargin: '200px'
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={ref} className="icons-grid">
            {isVisible ? children : null}
        </div>
    );
}

function IconsContent({
    icons,
    selectedVariant
}: {
    icons: IconWithRelativeData[];
    selectedVariant: Variant;
}) {
    return (
        <IconsGrid selectedVariant={selectedVariant}>
            {icons.map((icon) => {
                return (
                    <div className="icon" key={icon.id}>
                        <IconButton icon={icon} variant={selectedVariant} />
                    </div>
                );
            })}
        </IconsGrid>
    );
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
