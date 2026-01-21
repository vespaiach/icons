'use client';

import { use, useEffect, useMemo, useRef } from 'react';
import AstToSvg from '@/components/AstToSvg';
import { cx } from '@/utils/common-helpers';
import FavoriteButton from '../FavoriteButton';
import { useAdjustment, useIconAction, useIconValue } from '../PageContext';

export default function IconsGrid({
    iconsPromise,
    variant,
    onHeightChange
}: {
    iconsPromise: Promise<IconWithRelativeData[]>;
    variant: Variant;
    onHeightChange?: (height: number) => void;
}) {
    const gridRef = useRef<HTMLDivElement>(null);
    const icons = use(iconsPromise);
    const adjustment = useAdjustment(variant.repositoryId);

    useEffect(() => {
        if (gridRef.current) {
            const rect = gridRef.current.getBoundingClientRect();
            onHeightChange?.(rect.height);
        }
    }, [onHeightChange]);

    return (
        <div className="ic-grid" ref={gridRef}>
            {icons
                .filter((icon) => icon.variantId === variant.id)
                .map((icon) => {
                    return <IconButton key={icon.id} icon={icon} variant={variant} adjustment={adjustment} />;
                })}
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
    const [setIcon] = useIconAction();
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
