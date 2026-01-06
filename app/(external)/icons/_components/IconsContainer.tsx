'use client';

import { Suspense, use, useEffect, useRef, useState } from 'react';
import { getIconsByRepositoryIdAction } from '../actions';

const ICON_SIZE = 56; // in pixels

export default function IconsContainer({
    repositories
}: {
    repositories: Array<{ id: number; name: string; iconCount: number }>;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef}>
            {repositories.map((repo) => (
                <div key={repo.id} className="pb-8">
                    <h2 className="font-semibold text-lg mb-3 capitalize">
                        {repo.name} ({repo.iconCount})
                    </h2>
                    <IconsGrid repository={repo} />
                </div>
            ))}
        </div>
    );
}

function IconsGrid({ repository }: { repository: { id: number; name: string; iconCount: number } }) {
    const [iconsPromise, setIconsPromise] = useState<Promise<IconWithDirectoryVariant[]> | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const iconCount = repository.iconCount;

    useEffect(() => {
        if (contentRef.current) {
            const contentWidth = contentRef.current.getBoundingClientRect().width;
            const iconsPerRow = Math.floor(contentWidth / ICON_SIZE);
            const rows = Math.ceil(iconCount / iconsPerRow);
            const totalHeight = rows * ICON_SIZE;
            contentRef.current.style['minHeight'] = `${totalHeight}px`;
        }
    }, [iconCount]);

    // useEffect(() => {
    //     if (iconsPromise === null) {
    //         setIconsPromise(getIconsByRepositoryIdAction(repository.id));
    //     }
    // }, [iconsPromise]);

    return (
        <div className="icons-grid" ref={contentRef}>
            {iconsPromise !== null && (
                <Suspense>
                    <IconsContent iconsPromise={iconsPromise} />
                </Suspense>
            )}
        </div>
    );
}

function IconsContent({ iconsPromise }: { iconsPromise: Promise<IconWithDirectoryVariant[]> }) {
    const icons = use(iconsPromise);

    return icons.map((icon) => (
        <div key={icon.id} className="icon" dangerouslySetInnerHTML={{ __html: icon.svgContent }} />
    ));
}
