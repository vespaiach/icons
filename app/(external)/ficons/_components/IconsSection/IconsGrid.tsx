'use client';

import { useIntersectionObserver } from '@uidotdev/usehooks';
import { Suspense } from 'react';
import IconsGridContent from './IconsGridContent';
import IconsGridSkeleton from './IconsGridSkeleton';

export default function IconsGrid({
    iconsPromise,
    variants,
    repositoryId
}: {
    iconsPromise: Promise<IconWithRelativeData[]>;
    variants: Variant[];
    repositoryId: number;
}) {
    const id = `icons-grid-tabs-${repositoryId}`;
    const [ref, entry] = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px', threshold: 0 });
    const isIntersecting = entry?.isIntersecting || false;

    return (
        <div ref={ref} className="d-tabs d-tabs-box mt-3 mb-1" id={id}>
            {variants.map((variant, index) => {
                return (
                    <Suspense
                        key={variant.id}
                        fallback={
                            <IconsGridSkeleton
                                variant={variant}
                                checked={index === 0}
                                repositoryId={repositoryId}
                            />
                        }>
                        <input
                            key={variant.id}
                            type="radio"
                            className="d-tab after:capitalize after:font-semibold"
                            name={`icon-variant-tab-${repositoryId}`}
                            aria-label={`${variant.name} (${variant.iconCount})`}
                            defaultChecked={index === 0}
                        />
                        <IconsGridContent
                            iconsPromise={iconsPromise}
                            selectedVariant={variant}
                            isIntersecting={isIntersecting}
                        />
                    </Suspense>
                );
            })}
        </div>
    );
}
