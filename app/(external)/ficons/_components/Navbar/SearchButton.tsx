'use client';

import { useIsClient } from '@uidotdev/usehooks';
import { HeartPlus, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useDrawerAction, useFavoritesValue } from '../PageContext';

export default function SearchButton() {
    const isClient = useIsClient();
    const { ids } = useFavoritesValue();
    const [openDrawer] = useDrawerAction();
    const hasIconInFavorites = ids.size > 0;

    const [isMac, setIsMac] = useState<boolean | null>(null);

    const openModel = useCallback(() => {
        const searchModal = document.getElementById('search_modal') as HTMLDialogElement;
        if (searchModal) {
            // Dispatch custom event to notify SearchModal component
            window.dispatchEvent(new CustomEvent('searchModalOpening'));
            searchModal.showModal();
        }
    }, []);

    useEffect(() => {
        if (!isClient) return;
        setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
    }, [isClient]);

    useEffect(() => {
        if (!isClient) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                openModel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [openModel, isClient]);

    return (
        <>
            <button
                type="button"
                className="ml-2 md:ml-8 flex d-input d-input-ghost d-input-sm hover:border-secondary focus-visible:border-secondary bg-base-200 cursor-pointer transition-colors focus:outline-none"
                onClick={openModel}>
                <Search className="size-4 shrink-0 opacity-60" />
                <Suspense>
                    <SearchText />
                </Suspense>
                {isMac !== null && (
                    <kbd className="d-kbd d-kbd-sm font-mono opacity-50">
                        {isMac ? (
                            <>
                                <span className="me-1 text-sm">⌘</span>K
                            </>
                        ) : (
                            'Ctrl K'
                        )}
                    </kbd>
                )}
            </button>
            {hasIconInFavorites && (
                <button
                    type="button"
                    onClick={openDrawer}
                    className="hidden md:flex d-btn d-btn-ghost d-btn-sm d-btn-secondary ml-1 px-2">
                    <HeartPlus size={16} />
                    <span className="d-badge d-badge-secondary d-badge-xs">{ids.size}</span>
                </button>
            )}
        </>
    );
}

function SearchText() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    return <span className="grow text-left">{searchQuery || 'Search…'}</span>;
}
