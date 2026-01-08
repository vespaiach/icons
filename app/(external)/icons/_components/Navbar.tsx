'use client';

import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, use, useEffect, useState } from 'react';

export default function Navbar({
    repositoriesMapPromise
}: {
    repositoriesMapPromise: Promise<Record<number, RepositoryWithIconCount>>;
}) {
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
        <div className="d-navbar bg-base-100 shadow-sm justify-between sticky top-0 z-10">
            <a href="/icons/" className="btn btn-ghost font-mono font-semibold text-sm">
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
            <div className="flex-none">
                <ul className="d-menu d-menu-horizontal px-1">
                    <Suspense>
                        <RepositoriesLinks repositoriesMapPromise={repositoriesMapPromise} />
                    </Suspense>
                </ul>
            </div>
        </div>
    );
}

function RepositoriesLinks({
    repositoriesMapPromise
}: {
    repositoriesMapPromise: Promise<Record<number, RepositoryWithIconCount>>;
}) {
    const repositoriesMap = use(repositoriesMapPromise);
    const repositories = Object.values(repositoriesMap).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <li>
            <details>
                <summary>Parent</summary>
                <ul className="bg-base-100 rounded-t-none p-2">
                    {repositories.map((repo) => (
                        <li key={repo.id}>
                            <a className="d-link capitalize" href={`#${repo.name}`}>
                                {repo.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </details>
        </li>
    );
}
