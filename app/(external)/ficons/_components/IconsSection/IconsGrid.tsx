'use client';

import { Suspense, useState } from 'react';
import { cx } from '@/utils/common-helpers';
import IconsGridContent from './IconsGridContent';
import IconsGridSkeleton from './IconsGridSkeleton';

export default function IconsGrid({
    iconsPromise,
    variants
}: {
    iconsPromise: Promise<IconWithRelativeData[]>;
    variants: Variant[];
}) {
    const [selectedVariantId, setSelectedVariantId] = useState(variants[0].id);
    const selectedVariant = variants.find((v) => v.id === selectedVariantId)!;

    return (
        <>
            <div className="d-tabs d-tabs-box mt-3 mb-1">
                {variants.map((variant) => {
                    return (
                        <button
                            key={variant.id}
                            type="button"
                            role="tab"
                            className={cx('d-tab', selectedVariantId === variant.id && 'd-tab-active')}
                            onClick={() => setSelectedVariantId(variant.id)}>
                            {variant.name} ({variant.iconCount})
                        </button>
                    );
                })}
            </div>

            <Suspense fallback={<IconsGridSkeleton iconCount={selectedVariant.iconCount} />}>
                <IconsGridContent iconsPromise={iconsPromise} selectedVariant={selectedVariant} />
            </Suspense>
        </>
    );
}
