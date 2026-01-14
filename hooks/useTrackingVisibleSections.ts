import { useEffect, useState } from 'react';

const observerOptions = {
    root: null,
    rootMargin: '0px 0px 0px 0px',
    threshold: [
        0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9,
        0.95, 1.0
    ]
};

/*
 * Because observered element's height are different, so that callback fires with different intersectionRatio values.
 * Example: 0.1 of a tall element is larger than 0.5 of a short element.
 * Example: We want to fire callback every 5% of visibility change, But with a tall element, frequency of callback fires is slower than a short element.
 * So this hook doesn't work well with different height elements.
 */
export default function useTrackingVisibleSections(ids: string[]) {
    const [ratios, setRatios] = useState<Array<[string, number]>>(ids.map((id) => [id, 0]));
    const [visibleId, setVisibleId] = useState<string | null>(null);

    useEffect(() => {
        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setRatios((prevRatios) => {
                        return prevRatios.map(([prevId, prevRatio]) => {
                            if (prevId === entry.target.id) {
                                return [entry.target.id, entry.intersectionRatio];
                            }
                            return [prevId, prevRatio];
                        });
                    });
                } else {
                    setRatios((prevRatios) => {
                        return prevRatios.map(([prevId, prevRatio]) => {
                            if (prevId === entry.target.id) {
                                return [prevId, 0];
                            }
                            return [prevId, prevRatio];
                        });
                    });
                }
            });
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
            observer.disconnect();
        };
    }, [ids]);

    useEffect(() => {
        let maxRatio = 0;
        let currentVisibleId: string | null = null;

        ratios.forEach(([id, ratio]) => {
            if (ratio > maxRatio) {
                maxRatio = ratio;
                currentVisibleId = id;
            }
        });

        setVisibleId(currentVisibleId);
    }, [ratios]);

    return [visibleId, setVisibleId] as const;
}
