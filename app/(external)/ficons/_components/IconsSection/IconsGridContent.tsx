'use client';

import { use, useMemo } from 'react';
import AstToSvg from '@/components/AstToSvg';
import { usePageContext } from '../PageContext';
import IconsContainer from './IconsContainer';

export default function IconsGridContent({
    iconsPromise,
    selectedVariant
}: {
    iconsPromise: Promise<IconWithRelativeData[]>;
    selectedVariant: Variant;
}) {
    const icons = use(iconsPromise);
    const filteredIcons = icons.filter((icon) => icon.variantId === selectedVariant.id);

    return (
        <IconsContainer variant={selectedVariant}>
            {filteredIcons.map((icon) => (
                <IconButton key={icon.id} icon={icon} />
            ))}
        </IconsContainer>
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
