'use client';

import { Suspense, use, useEffect, useRef, useState } from 'react';
import SkeletonIconsContainer from './SkeletonIconsContainer';

const ICON_SIZE = 56; // in pixels

interface ShortRepository {
    id: number;
    name: string;
    iconCount: number;
}

export default function IconsContainer({
    repository,
    iconsPromise
}: {
    repository: ShortRepository;
    iconsPromise: Promise<IconWithDirectoryVariant[]>;
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

function IconsContent({ iconsPromise }: { iconsPromise: Promise<IconWithDirectoryVariant[]> }) {
    const icons = use(iconsPromise);

    return icons.map((icon) => (
        <div key={icon.id} className="icon" dangerouslySetInnerHTML={{ __html: icon.svgContent }} />
    ));
}
