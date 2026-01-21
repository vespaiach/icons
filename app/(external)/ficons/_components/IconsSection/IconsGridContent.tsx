'use client';

import { useSearchParams } from 'next/navigation';
import { use, useEffect, useMemo, useRef } from 'react';
import AstToSvg from '@/components/AstToSvg';
import useTrackMinHeight from '@/hooks/useTrackMinHeight';
import { cx } from '@/utils/common-helpers';
import FavoriteButton from '../FavoriteButton';
import { useAdjustment, useIconAcion, useIconValue } from '../PageContext';

export default function IconsGridContent({
    iconsPromise,
    selectedVariant,
    isIntersecting,
}: {
    iconsPromise: Promise<IconWithRelativeData[]>;
    selectedVariant: Variant;
    isIntersecting: boolean;
}) {
    const gridRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        if (gridRef.current && isIntersecting) {
            const rect = gridRef.current.getBoundingClientRect();
            gridRef.current.style.minHeight = `${rect.height}px`;
        }
    }, [isIntersecting]);

    return (
        <div className="d-tab-content bg-base-100 border-base-300 p-2" ref={gridRef}>
            <div className="ic-grid">
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
    const [setIcon] = useIconAcion();
    const selectedIcon = useIconValue();
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
        <div className={cx('icon group rounded-md', selectedIcon?.id === icon.id && 'ring-2 ring-secondary')}>
            <button
                className="btn"
                onClick={() => {
                    setIcon(icon);
                }}
                type="button">
                {iconElement}
                <span>{icon.name}</span>
            </button>
            <FavoriteButton icon={icon} className="absolute top-2 right-2" defaultHide />
        </div>
    );
}
