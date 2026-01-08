'use client';

import { Search } from 'lucide-react';
import { use, useEffect, useRef, useState } from 'react';
import { cx } from '@/utils/common-helpers';

export default function SearchModal({
    repositoriesMapPromise
}: {
    repositoriesMapPromise: Promise<Record<number, RepositoryWithIconCount>>;
}) {
    console.log('Render SearchModal');
    const repositoriesMap = use(repositoriesMapPromise);
    const repositories = Object.values(repositoriesMap).sort((a, b) => a.name.localeCompare(b.name));
    const [selectedRepo, setSelectedRepo] = useState<Record<number, boolean | undefined>>(() =>
        Object.fromEntries((repositories || []).map((repo) => [repo.id, false]))
    );
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    return (
        <dialog id="search_modal" className="d-modal items-start pt-12">
            <form className="d-modal-box pt-0 px-0">
                <div className="border-b border-gray-300">
                    <label className="d-input d-input-ghost d-input-lg w-full outline-none">
                        <Search className="w-5" />
                        <input type="search" ref={searchInputRef} required placeholder="Type to search…" />
                    </label>
                </div>
                <div className="px-4 py-2 space-x-1">
                    {(repositories || []).map((repo) => (
                        <button
                            type="button"
                            key={repo.id}
                            className={cx(
                                'd-badge d-badge-sm cursor-pointer',
                                selectedRepo[repo.id] ? 'd-badge-secondary' : 'd-badge-ghost'
                            )}
                            onClick={() => {
                                setSelectedRepo({
                                    ...selectedRepo,
                                    [repo.id]: !selectedRepo[repo.id]
                                });
                            }}>
                            {repo.name.toLowerCase()}
                            {repo.iconCount !== undefined && repo.iconCount !== null
                                ? ` (${repo.iconCount})`
                                : ''}
                        </button>
                    ))}
                </div>
            </form>
            <form method="dialog" className="d-modal-backdrop">
                <button
                    type="button"
                    onClick={() => {
                        const searchModal = document.getElementById('search_modal') as HTMLDialogElement;
                        if (searchModal) {
                            searchModal.close();
                        }
                    }}>
                    close
                </button>
            </form>
        </dialog>
    );
}
