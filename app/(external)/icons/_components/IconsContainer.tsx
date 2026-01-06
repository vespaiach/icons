'use client';

import { Suspense, use, useEffect, useRef } from 'react';

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
    return (
        <div className="pb-8">
            <h2 className="font-semibold text-lg mb-3 capitalize">
                {repository.name} (${repository.iconCount})
            </h2>
            <IconsGrid iconsPromise={iconsPromise} repository={repository}/>
        </div>
    );
}

function IconsGrid({
    iconsPromise,
    repository
}: {
    iconsPromise: Promise<IconWithDirectoryVariant[]>;
    repository: ShortRepository;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    const iconCount = repository.iconCount;

    useEffect(() => {
        if (contentRef.current) {
            const contentWidth = contentRef.current.getBoundingClientRect().width;
            const iconsPerRow = Math.floor(contentWidth / ICON_SIZE);
            const rows = Math.ceil(iconCount / iconsPerRow);
            const totalHeight = rows * ICON_SIZE;
            contentRef.current.style.minHeight = `${totalHeight}px`;
        }
    }, [iconCount]);

    return (
        <div className="icons-grid" ref={contentRef}>
            <Suspense>
                <IconsContent iconsPromise={iconsPromise} />
            </Suspense>
        </div>
    );
}

function IconsContent({ iconsPromise }: { iconsPromise: Promise<IconWithDirectoryVariant[]> }) {
    const icons = use(iconsPromise);

    return icons.map((icon) => (
        <div key={icon.id} className="icon" dangerouslySetInnerHTML={{ __html: icon.svgContent }} />
    ));
}
