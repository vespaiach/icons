import { useEffect, useRef, useState } from 'react';

interface SectionEntry {
    id: string;
    ratio: number;
    boundingTop: number;
}

/*
 * Tracks which section is most visible in the viewport.
 * Optimized for mobile devices with improved viewport detection and performance.
 */
export default function useTrackingVisibleSections(ids: string[]) {
    const [entries, setEntries] = useState<SectionEntry[]>(
        ids.map((id) => ({ id, ratio: 0, boundingTop: 0 }))
    );
    const [visibleId, setVisibleId] = useState<string | null>(null);
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const observerOptions = {
            root: null,
            // Negative top margin means section becomes "active" before reaching the top
            // This provides better UX on mobile where navbar takes space
            rootMargin: '-80px 0px -20% 0px',
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        };

        const observerCallback = (observerEntries: IntersectionObserverEntry[]) => {
            // Debounce updates to reduce re-renders on mobile scroll
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }

            updateTimeoutRef.current = setTimeout(() => {
                setEntries((prevEntries) => {
                    const newEntries = [...prevEntries];

                    observerEntries.forEach((entry) => {
                        const index = newEntries.findIndex((e) => e.id === entry.target.id);
                        if (index !== -1) {
                            newEntries[index] = {
                                id: entry.target.id,
                                ratio: entry.isIntersecting ? entry.intersectionRatio : 0,
                                boundingTop: entry.boundingClientRect.top
                            };
                        }
                    });

                    return newEntries;
                });
            }, 50); // 50ms debounce for smooth mobile scrolling
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all sections
        ids.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            observer.disconnect();
        };
    }, [ids]);

    useEffect(() => {
        let maxScore = -1;
        let currentVisibleId: string | null = null;

        // Score based on both visibility ratio and position
        // Prioritize sections that are:
        // 1. More visible (higher ratio)
        // 2. Closer to the top of viewport (lower boundingTop)
        entries.forEach(({ id, ratio, boundingTop }) => {
            if (ratio > 0) {
                // Calculate score: prioritize visible sections near the top
                // The closer to top (lower boundingTop) and higher ratio, the better
                const positionScore = boundingTop < 200 ? 2 : boundingTop < 400 ? 1.5 : 1;
                const score = ratio * positionScore;

                if (score > maxScore) {
                    maxScore = score;
                    currentVisibleId = id;
                }
            }
        });

        setVisibleId(currentVisibleId);
    }, [entries]);

    return [visibleId, setVisibleId] as const;
}
