'use client';

import { useClickAway } from '@uidotdev/usehooks';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { nameToId } from '@/utils/common-helpers';

export default function Navbar({ repositories }: { repositories: Repository[] }) {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    const [isMac, setIsMac] = useState(false);

    const openModel = () => {
        const searchModal = document.getElementById('search_modal') as HTMLDialogElement;
        if (searchModal) {
            // Dispatch custom event to notify SearchModal component
            window.dispatchEvent(new CustomEvent('searchModalOpening'));
            searchModal.showModal();
        }
    };

    useEffect(() => {
        setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));

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
    }, []);

    return (
        <div className="d-navbar bg-base-100 min-h-10 px-4 shadow-sm justify-between sticky top-0 z-10">
            <a href="/icons/" className="btn btn-ghost font-mono font-semibold text-sm text-primary">
                ICONS
            </a>
            <button type="button" className="d-btn d-btn-ghost md:hidden" onClick={openModel}>
                <Search className="size-4 shrink-0" />
            </button>
            <button
                type="button"
                className="hidden md:flex d-input d-input-ghost hover:bg-base-200 focus-visible:bg-base-200 cursor-pointer transition-colors focus:outline-none"
                onClick={openModel}>
                <Search className="size-4 shrink-0 opacity-60" />
                <span className="grow text-left">{searchQuery || 'Search…'}</span>
                <kbd className="d-kbd d-kbd-sm font-mono opacity-50">
                    {isMac ? (
                        <>
                            <span className="me-1 text-sm">⌘</span>K
                        </>
                    ) : (
                        <>Ctrl K</>
                    )}
                </kbd>
            </button>
            <div className="flex-none gap-2">
                <ThemeSwitcher />
                <RepositoriesLinks repositories={repositories} />
            </div>
        </div>
    );
}

function RepositoriesLinks({ repositories }: { repositories: Repository[] }) {
    const [activeRepo, setActiveRepo] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const ref = useClickAway<HTMLDivElement>(() => {
        setIsDropdownOpen(false);
    });

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -60% 0px',
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveRepo(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all repository sections
        repositories.forEach((repo) => {
            const element = document.getElementById(nameToId(repo.name));
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [repositories]);

    const displayName = activeRepo || `${repositories[0]?.owner}/${repositories[0]?.name}` || 'Repositories';

    return (
        <div
            ref={ref}
            className={`d-dropdown d-dropdown-end ${isDropdownOpen ? 'd-dropdown-open' : 'd-dropdown-close'}`}>
            <div
                tabIndex={0}
                role="button"
                className="capitalize flex items-center gap-1 d-btn d-btn-ghost"
                onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                }}>
                {displayName}
                {isDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            <ul
                tabIndex={-1}
                className="d-dropdown-content d-menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                {repositories.map((repo) => (
                    <li key={repo.id}>
                        <a
                            className="d-link capitalize"
                            href={`#${nameToId(repo.name)}`}
                            onClick={(e) => {
                                e.preventDefault();
                                const element = document.getElementById(nameToId(repo.name));
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                                // Close dropdown
                                setIsDropdownOpen(false);
                            }}>
                            {repo.owner}/{repo.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
