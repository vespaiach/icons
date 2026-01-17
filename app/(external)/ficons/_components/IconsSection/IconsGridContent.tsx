'use client';

import { useSearchParams } from 'next/navigation';
import { use, useMemo } from 'react';
import AstToSvg from '@/components/AstToSvg';
import useTrackMinHeight from '@/hooks/useTrackMinHeight';
import { usePageContext } from '../PageContext';

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
    const { svgAttributeAdjustments } = usePageContext();

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
            <div className="icons-grid" ref={ref}>
                {isIntersecting &&
                    filteredIcons.length > 0 &&
                    filteredIcons.map((icon) => (
                        <IconButton
                            key={icon.id}
                            icon={icon}
                            variant={selectedVariant}
                            svgAttributeAdjustment={svgAttributeAdjustments?.[selectedVariant.id] ?? {}}
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
    svgAttributeAdjustment
}: {
    icon: IconWithRelativeData;
    variant: Variant;
    svgAttributeAdjustment: SvgAdjustableAttributes;
}) {
    const { setSelectedIcon } = usePageContext();

    const iconElement = useMemo(() => {
        return (
            <AstToSvg
                svgAst={icon.svgAst}
                fill={svgAttributeAdjustment.fill ?? variant.defaultSvgAttributes.fill}
                stroke={svgAttributeAdjustment.stroke ?? variant.defaultSvgAttributes.stroke}
                strokeWidth={svgAttributeAdjustment.strokeWidth ?? variant.defaultSvgAttributes.strokeWidth}
                width={20}
                height={20}
            />
        );
    }, [icon.svgAst, svgAttributeAdjustment, variant.defaultSvgAttributes]);

    return (
        <div className="icon" data-tip={icon.name}>
            <button
                onClick={() => {
                    setSelectedIcon(icon);
                }}
                type="button">
                {iconElement}
            </button>
        </div>
    );
}
