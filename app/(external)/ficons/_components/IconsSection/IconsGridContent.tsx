'use client';

import { HeartPlus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { use, useMemo } from 'react';
import AstToSvg from '@/components/AstToSvg';
import useTrackMinHeight from '@/hooks/useTrackMinHeight';
import { useAdjustment, usePageContext } from '../PageContext';

export default function IconsGridContent({
    iconsPromise,
    selectedVariant,
    isIntersecting
}: {
    iconsPromise: Promise<IconWithRelativeData[]>;
    selectedVariant: Variant;
    isIntersecting: boolean;
}) {
    const icons = use(iconsPromise);
    const adjustment = useAdjustment(selectedVariant.repositoryId);

    const searchParams = useSearchParams();
    const query = (searchParams.get('q') || '').toLowerCase();
    const filteredIcons = useMemo(
        () =>
            icons.filter(
                (icon) => icon.variantId === selectedVariant.id && icon.name.toLowerCase().includes(query)
            ),
        [icons, selectedVariant.id, query]
    );
    const ref = useTrackMinHeight<HTMLDivElement>(filteredIcons.length);

    return (
        <div className="d-tab-content bg-base-100 border-base-300 p-2">
            <div className="ic-grid" ref={ref}>
                {isIntersecting &&
                    filteredIcons.length > 0 &&
                    filteredIcons.map((icon) => (
                        <IconButton
                            key={icon.id}
                            icon={icon}
                            variant={selectedVariant}
                            adjustment={adjustment}
                        />
                    ))}
                {isIntersecting && filteredIcons.length === 0 && <p>No icons found.</p>}
            </div>
        </div>
    );
}

function IconButton({
    icon,
    variant,
    adjustment
}: {
    icon: IconWithRelativeData;
    variant: Variant;
    adjustment: { color: string; size: number };
}) {
    const { setSelectedIcon } = usePageContext();

    const iconElement = useMemo(() => {
        return (
            <AstToSvg
                svgAst={icon.svgAst}
                fill={variant.defaultSvgAttributes.fill ? adjustment.color : undefined}
                stroke={variant.defaultSvgAttributes.stroke ? adjustment.color : undefined}
                width={38}
                height={38}
            />
        );
    }, [icon.svgAst, adjustment, variant.defaultSvgAttributes]);

    return (
        <div className="icon group">
            <button
                className="btn"
                onClick={() => {
                    setSelectedIcon(icon);
                }}
                type="button">
                {iconElement}
                <span>{icon.name}</span>
            </button>
            <button
                className="cart invisible group-hover:visible"
                type="button"
                aria-label="Add to Favorites">
                <HeartPlus size={16} />
            </button>
        </div>
    );
}
