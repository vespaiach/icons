'use client';

import { Fragment, Suspense, use, useEffect, useRef, useState } from 'react';
import SkeletonIconsContainer from './SkeletonIconsContainer';

const ICON_SIZE = 56; // in pixels

interface ShortRepository {
    id: number;
    name: string;
    iconCount: number;
}

export default function IconsContainer({
    repository,
    iconsPromise,
}: {
    repository: ShortRepository;
    iconsPromise: Promise<Icon[]>;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    const iconCount = repository.iconCount;
    const [shouldRender, setShouldRender] = useState(false);
    const [minHeight, setMinHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            const contentWidth = contentRef.current.getBoundingClientRect().width;
            const iconsPerRow = Math.floor(contentWidth / ICON_SIZE);
            const rows = Math.ceil(iconCount / iconsPerRow);
            setMinHeight(rows * ICON_SIZE);
        }
    }, [iconCount]);

    useEffect(() => {
        const element = contentRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setShouldRender(entry.isIntersecting);
                });
            },
            {
                rootMargin: '200px', // Start loading 200px before the section is visible
                threshold: 0
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className="pb-8 px-4">
            {minHeight > 0 && (
                <h2 className="font-semibold text-lg mb-3 capitalize">
                    {repository.name} ({repository.iconCount})
                </h2>
            )}
            <div className="icons-grid" ref={contentRef} style={{ minHeight }}>
                {shouldRender && (
                    <Suspense fallback={<SkeletonIconsContainer iconCount={iconCount} />}>
                        <IconsContent iconsPromise={iconsPromise} />
                    </Suspense>
                )}
            </div>
        </div>
    );
}

function IconsContent({
    iconsPromise,
}: {
    iconsPromise: Promise<Icon[]>;
}) {
    const icons = use(iconsPromise);

    return icons.map((icon) => {
        return (
            <div className="icon" key={icon.id}>
                <div className="d-tooltip d-tooltip-bottom" data-tip={icon.name}>
                    <svg
                        {...icon.svgAttributes}
                        width={24}
                        height={24}
                        dangerouslySetInnerHTML={{ __html: icon.svgContent }}
                    />
                </div>
            </div>
        );
    });
}
