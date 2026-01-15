'use client';

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
    const filteredIcons = icons.filter((icon) => icon.variantId === selectedVariant.id);
    const ref = useTrackMinHeight<HTMLDivElement>(filteredIcons.length);

    return (
        <div className="d-tab-content bg-base-100 border-base-300 p-2">
            <div className="icons-grid" ref={ref}>
                {isIntersecting && filteredIcons.map((icon) => <IconButton key={icon.id} icon={icon} />)}
            </div>
        </div>
    );
}

function IconButton({ icon }: { icon: IconWithRelativeData }) {
    const { setSelectedIcon } = usePageContext();
    const iconElement = useMemo(() => {
        return <AstToSvg svgAst={icon.svgAst} width={20} height={20} />;
    }, [icon.svgAst]);

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
