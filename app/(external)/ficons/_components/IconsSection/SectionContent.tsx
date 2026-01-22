'use client';

import { useIntersectionObserver } from '@uidotdev/usehooks';
import { useSearchParams } from 'next/navigation';
import { Fragment, startTransition, useEffect, useMemo, useState } from 'react';
import IconsGrid from './IconsGrid';
import IconsGridSkeleton from './IconsGridSkeleton';

export default function SectionContent({ repository }: { repository: RepositoryVariants }) {
    const [icons, setIcons] = useState<IconWithRelativeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchIcons() {
            try {
                const response = await fetch('/ficons/icons', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-ficons-request': 'true'
                    },
                    body: JSON.stringify({ repositoryId: repository.id })
                });
                if (!response.ok) throw new Error('Failed to fetch icons');
                const data = await response.json();
                if (!cancelled) {
                    setIcons(data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching icons:', error);
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchIcons();

        return () => {
            cancelled = true;
        };
    }, [repository.id]);

    const [ref, entry] = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px', threshold: 0 });

    const isIntersecting = entry?.isIntersecting || false;
    const id = `icons-grid-tabs-${repository.id}`;
    const variants = repository.variants;
    const [selectedVariant, setSelectedVariant] = useState(variants[0]);

    if (isLoading) {
        return <IconsGridSkeleton variants={repository.variants} />;
    }

    return (
        <div className="d-tabs d-tabs-box mt-3 mb-1" id={id} ref={ref}>
            {variants.map((variant) => {
                return (
                    <VariantGrid
                        key={variant.id}
                        variant={variant}
                        repository={repository}
                        icons={icons}
                        checked={selectedVariant.id === variant.id}
                        isIntersecting={isIntersecting}
                        onSelectVariant={(v) => startTransition(() => setSelectedVariant(v))}
                    />
                );
            })}
        </div>
    );
}

function VariantGrid({
    variant,
    repository,
    icons,
    checked,
    isIntersecting,
    onSelectVariant
}: {
    variant: Variant;
    repository: RepositoryVariants;
    icons: IconWithRelativeData[];
    checked: boolean;
    isIntersecting: boolean;
    onSelectVariant: (variant: Variant) => void;
}) {
    const searchParams = useSearchParams();
    const filteredIcons = useMemo(() => {
        const byVariant = icons.filter((icon) => icon.variantId === variant.id);
        const searchQuery = searchParams.get('q')?.toLowerCase() || '';
        if (!searchQuery) return byVariant;
        return byVariant.filter((icon) => icon.name.toLowerCase().includes(searchQuery));
    }, [icons, searchParams, variant]);

    const [minHeight, setMinHeight] = useState<number | undefined>(() => {
        const rows = Math.ceil(variant.iconCount / 10);
        return rows * 102 + (rows - 1) * 20; // initial minHeight based on 10 icons per row and 102px height per icon and 20px gap
    });
    const gridStyle = useMemo(() => ({ minHeight }), [minHeight]);

    return (
        <Fragment key={variant.id}>
            <input
                key={variant.id}
                type="radio"
                className="d-tab after:capitalize after:font-semibold"
                name={`icon-variant-tab-${repository.id}`}
                aria-label={`${variant.name} (${filteredIcons.length})`}
                checked={checked}
                onChange={() => onSelectVariant(variant)}
            />

            {checked && (
                <div className="d-tab-content bg-base-100 p-2 border-base-300" style={gridStyle}>
                    {isIntersecting && (
                        <IconsGrid icons={filteredIcons} variant={variant} onHeightChange={setMinHeight} />
                    )}
                </div>
            )}
        </Fragment>
    );
}
