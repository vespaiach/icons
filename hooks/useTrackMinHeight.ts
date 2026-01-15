import { useEffect, useRef } from 'react';

export default function useTrackMinHeight<T extends HTMLElement>(iconCount: number) {
    const ref = useRef<T | null>(null);
    const observerRef = useRef<ResizeObserver | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const calculateMinHeight = (containerWidth: number) => {
            const ICON_BUTTON_SIZE = 56; // in pixels
            const GAP = 8; // in pixels

            // Calculate how many columns fit in the available width
            const columnsCount = Math.floor((containerWidth + GAP) / (ICON_BUTTON_SIZE + GAP)) || 1;
            // Calculate number of rows needed
            const rowsCount = Math.ceil(iconCount / columnsCount);
            // Calculate min-height: (rows * iconSize) + (gaps between rows)
            const calculatedMinHeight = rowsCount * ICON_BUTTON_SIZE + Math.max(0, rowsCount - 1) * GAP;

            return calculatedMinHeight;
        };

        // Debounced update using requestAnimationFrame
        const updateMinHeight = () => {
            if (rafRef.current) return; // Already scheduled

            rafRef.current = requestAnimationFrame(() => {
                const containerWidth = element.offsetWidth;
                if (containerWidth > 0) {
                    const minHeight = calculateMinHeight(containerWidth);
                    element.style.setProperty('--min-height', `${minHeight}px`);
                }
                rafRef.current = null;
            });
        };

        // Use ResizeObserver to detect when element becomes visible or resizes
        observerRef.current = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0) {
                    updateMinHeight();
                    break;
                }
            }
        });

        observerRef.current.observe(element);

        // Initial calculation
        updateMinHeight();

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [iconCount]);

    return ref;
}
