'use client';

import { useClickAway, useIsClient } from '@uidotdev/usehooks';
import { Globe, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useTrackingVisibleSections from '@/hooks/useTrackingVisibleSections';
import { repoToId } from '@/utils/common-helpers';

export default function Navbar({ repositories }: { repositories: RepositoryVariants[] }) {
    const isClient = useIsClient();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
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
        <div className="d-navbar bg-base-100 min-h-10 px-4 shadow-sm sticky top-0 z-10">
            <a
                href="/ficons/"
                className="btn btn-ghost font-mono font-semibold text-sm text-primary flex items-center">
                <Globe className="size-5 me-2 inline-block" />
                FICONS
            </a>
            <button type="button" className="d-btn d-btn-ghost md:hidden mr-auto ml-8" onClick={openModel}>
                <Search className="size-4 shrink-0" />
            </button>
            <button
                type="button"
                className="mr-auto ml-8 hidden md:flex d-input d-input-ghost hover:bg-base-200 focus-visible:bg-base-200 cursor-pointer transition-colors focus:outline-none"
                onClick={openModel}>
                <Search className="size-4 shrink-0 opacity-60" />
                <span className="grow text-left">{searchQuery || 'Search…'}</span>
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
            <div className="flex-none gap-2">
                <RepositoriesLinks repositories={repositories} />
            </div>
        </div>
    );
}

function RepositoriesLinks({ repositories }: { repositories: Repository[] }) {
    const ids = useMemo(() => repositories.map((repo) => repoToId(repo)), [repositories]);
    const [visibleSectionId, setVisibleSectionId] = useTrackingVisibleSections(ids);
    const visibleRepo = useMemo(() => {
        if (!visibleSectionId) return null;
        return repositories.find((repo) => repoToId(repo) === visibleSectionId) || null;
    }, [visibleSectionId, repositories]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const ref = useClickAway<HTMLDivElement>(() => {
        setIsDropdownOpen(false);
    });

    return (
        <div
            ref={ref}
            className={`d-dropdown d-dropdown-end ${isDropdownOpen ? 'd-dropdown-open' : 'd-dropdown-close'}`}>
            {visibleRepo !== null && (
                <button
                    type="button"
                    className="capitalize flex items-center gap-1 d-btn d-btn-ghost"
                    onClick={() => {
                        setIsDropdownOpen(!isDropdownOpen);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsDropdownOpen(!isDropdownOpen);
                        }
                    }}>
                    # {visibleRepo.owner}/{visibleRepo.name}
                </button>
            )}
            <ul
                tabIndex={-1}
                className="d-dropdown-content d-menu bg-base-100 rounded-box z-1 w-62 p-2 shadow-sm">
                {repositories.map((repo) => (
                    <li key={repo.id}>
                        <a
                            className="d-link capitalize"
                            href={`#${repoToId(repo)}`}
                            onClick={(e) => {
                                e.preventDefault();
                                const id = repoToId(repo);

                                const element = document.getElementById(id);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }

                                // Close dropdown
                                setIsDropdownOpen(false);

                                // A workaround to ensure the visible section is updated after scrolling but intersection observer doesn't fire immediately
                                setTimeout(() => {
                                    setVisibleSectionId(id);
                                }, 1000);
                            }}>
                            {repo.owner}/{repo.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
