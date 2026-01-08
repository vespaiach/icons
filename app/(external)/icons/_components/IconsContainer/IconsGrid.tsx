'use client';

import { ExternalLink } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { nameToId } from '@/utils/common-helpers';
import IconsContent from './IconsContent';

export default function IconsGrid({
    repository,
    iconsPromise
}: {
    repository: RepositoryWithIconCount;
    iconsPromise: Promise<IconWithRelativeData[]>;
}) {
    const icons = use(iconsPromise);
    const contentRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const filteredIcons = useMemo(() => {
        if (!searchQuery) return icons;
        const lowerQuery = searchQuery.toLowerCase();
        return icons.filter((icon) => icon.name.toLowerCase().startsWith(lowerQuery));
    }, [icons, searchQuery]);

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

    if (filteredIcons.length === 0) return null;

    return (
        <div className="pb-8 px-4">
            <div className="mb-4">
                <h2 className="font-semibold text-lg capitalize" id={nameToId(repository.name)}>
                    {repository.name} ({filteredIcons.length})
                </h2>
                <a
                    href={`https://github.com/${repository.owner}/${repository.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-link d-link-hover inline-flex grow items-center gap-2 text-sm">
                    <span>
                        {repository.owner}/{repository.name}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
            <div className="icons-grid" ref={contentRef}>
                {shouldRender && <IconsContent icons={filteredIcons} />}
            </div>
        </div>
    );
}
