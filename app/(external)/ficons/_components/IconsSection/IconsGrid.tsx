'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import AstToSvg from '@/components/AstToSvg';
import { cx } from '@/utils/common-helpers';
import FavoriteButton from '../FavoriteButton';
import { useAdjustment, useIconAction, useIconValue } from '../PageContext';

export default function IconsGrid({
    icons,
    variant,
    onHeightChange
}: {
    icons: IconWithRelativeData[];
    variant: Variant;
    onHeightChange?: (height: number) => void;
}) {
    const gridRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const filteredIcons = useMemo(() => {
        const byVariant = icons.filter((icon) => icon.variantId === variant.id);
        const searchQuery = searchParams.get('q')?.toLowerCase() || '';
        if (!searchQuery) return byVariant;
        return byVariant.filter((icon) => icon.name.toLowerCase().includes(searchQuery));
    }, [icons, searchParams, variant]);
    const adjustment = useAdjustment(variant.repositoryId);

    // biome-ignore lint/correctness/useExhaustiveDependencies: filteredIcons.length is needed
    useEffect(() => {
        if (gridRef.current) {
            const rect = gridRef.current.getBoundingClientRect();
            onHeightChange?.(rect.height);
        }
    }, [onHeightChange, filteredIcons.length]);

    return (
        <div className="ic-grid" ref={gridRef}>
            {filteredIcons.map((icon) => {
                return <IconButton key={icon.id} icon={icon} variant={variant} adjustment={adjustment} />;
            })}
            {filteredIcons.length === 0 && (
                <div className="col-span-full text-center text-sm text-base-content/50 py-10">
                    No icons found.
                </div>
            )}
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
        return <AstToSvg svgAst={icon.svgAst} variant={variant} adjustment={{ ...adjustment, size: 38 }} />;
    }, [icon.svgAst, adjustment, variant]);

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
