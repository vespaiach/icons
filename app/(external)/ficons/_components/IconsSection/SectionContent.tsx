'use client';

import { useIntersectionObserver } from '@uidotdev/usehooks';
import { Fragment, Suspense, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { getIconsByRepositoryIdAction } from '../../actions';
import IconsGrid from './IconsGrid';
import IconsGridSkeleton from './IconsGridSkeleton';

export default function SectionContent({ repository }: { repository: RepositoryVariants }) {
    const [iconsPromise, setIconsPromise] = useState<Promise<IconWithRelativeData[]>>(new Promise(() => {}));
    useEffect(() => {
        setIconsPromise(getIconsByRepositoryIdAction(repository.id));
    }, [repository.id]);

    const [ref, entry] = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px', threshold: 0 });

    const isIntersecting = entry?.isIntersecting || false;
    const id = `icons-grid-tabs-${repository.id}`;
    const variants = repository.variants;
    const [selectedVariant, setSelectedVariant] = useState(variants[0]);
    const [_, startTransition] = useTransition();

    const _gridRef = useRef<HTMLDivElement>(null);
    const [minHeight, setMinHeight] = useState<number | undefined>(() => {
        const rows = Math.ceil(selectedVariant.iconCount / 10);
        return rows * 102 + (rows - 1) * 20; // initial minHeight based on 10 icons per row and 102px height per icon and 20px gap
    });
    const gridStyle = useMemo(() => ({ minHeight }), [minHeight]);

    return (
        <div className="d-tabs d-tabs-box mt-3 mb-1" id={id} ref={ref}>
            {variants.map((variant) => {
                return (
                    <Fragment key={variant.id}>
                        <input
                            key={variant.id}
                            type="radio"
                            className="d-tab after:capitalize after:font-semibold"
                            name={`icon-variant-tab-${repository.id}`}
                            aria-label={`${variant.name} (${variant.iconCount})`}
                            checked={selectedVariant.id === variant.id}
                            onChange={() => startTransition(() => setSelectedVariant(variant))}
                        />

                        {variant.id === selectedVariant.id && (
                            <div className="d-tab-content bg-base-100 p-2 border-base-300" style={gridStyle}>
                                {isIntersecting && (
                                    <Suspense fallback={<IconsGridSkeleton iconCount={variant.iconCount} />}>
                                        <IconsGrid
                                            iconsPromise={iconsPromise}
                                            variant={variant}
                                            onHeightChange={setMinHeight}
                                        />
                                    </Suspense>
                                )}
                            </div>
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
}
