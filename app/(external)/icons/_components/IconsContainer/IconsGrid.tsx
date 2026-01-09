'use client';

import { useIntersectionObserver } from '@uidotdev/usehooks';
import { ExternalLink, Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { use, useMemo } from 'react';
import { nameToId } from '@/utils/common-helpers';
import { usePageContext } from '../PageContext';
import IconsContent from './IconsContent';

const ICON_SIZE = 56;

export default function IconsGrid({
    repository,
    iconsPromise
}: {
    repository: Repository;
    iconsPromise: Promise<IconWithRelativeData[]>;
}) {
    const { setSelectedRepository } = usePageContext();
    const icons = use(iconsPromise);
    const [contentRef, entry] = useIntersectionObserver<HTMLDivElement>({
        threshold: 0,
        root: null,
        rootMargin: '0px'
    });
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const filteredIcons = useMemo(() => {
        if (!searchQuery) return icons;
        const lowerQuery = searchQuery.toLowerCase();
        return icons.filter((icon) => icon.name.toLowerCase().startsWith(lowerQuery));
    }, [icons, searchQuery]);

    const iconCount = filteredIcons.length;
    const minHeight = useMemo(() => {
        const rows = Math.ceil(iconCount / Math.floor((window.innerWidth - 32) / ICON_SIZE)); // 32px padding left and right
        return rows * ICON_SIZE + (rows - 1) * 8; // 8px gap
    }, [iconCount]);

    if (filteredIcons.length === 0) return null;

    return (
        <div className="pb-12 px-4" id={nameToId(repository.name)} style={{ scrollMarginTop: '72px' }}>
            <div className="mb-4">
                <h2 className="font-semibold text-lg capitalize flex items-center gap-3">
                    {repository.name} ({filteredIcons.length})
                    <button
                        type="button"
                        className="d-btn d-btn-ghost d-btn-sm d-btn-square cursor-pointer"
                        onClick={() => {
                            setSelectedRepository(repository);
                        }}>
                        <Settings className="w-5 h-5" />
                    </button>
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
            <div className="icons-grid" ref={contentRef} style={{ minHeight }}>
                {Boolean(entry?.isIntersecting) && <IconsContent icons={filteredIcons} />}
            </div>
        </div>
    );
}
