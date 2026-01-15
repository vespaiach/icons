'use client';

import { useIntersectionObserver } from '@uidotdev/usehooks';
import { useEffect } from 'react';

const ICON_BUTTON_SIZE = 56; // in pixels
const GAP = 8; // in pixels

export default function IconsContainer({
    variant,
    children
}: {
    variant: Variant;
    children?: React.ReactNode;
}) {
    const iconCount = variant.iconCount;
    const [ref, entry] = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px', threshold: 0 });
    const visible = entry?.isIntersecting || false;

    useEffect(() => {
        const gridElement = document.getElementById(`icons-grid-${variant.id}`);
        if (!gridElement) return;

        const width = gridElement.getBoundingClientRect().width;

        // Calculate how many columns fit in the available width
        const columnsCount = Math.floor((width + GAP) / (ICON_BUTTON_SIZE + GAP));
        // Calculate number of rows needed
        const rowsCount = Math.ceil(iconCount / columnsCount);
        // Calculate min-height: (rows * iconSize) + (gaps between rows)
        const calculatedMinHeight = rowsCount * ICON_BUTTON_SIZE + (rowsCount - 1) * GAP;

        gridElement.style = `--min-height: ${calculatedMinHeight}px;`;
    }, [iconCount, variant.id]);

    return (
        <div ref={ref} className="icons-grid" id={`icons-grid-${variant.id}`}>
            {visible ? children : null}
        </div>
    );
}
