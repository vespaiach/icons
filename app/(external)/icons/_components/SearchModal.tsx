'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { cx, nameToId } from '@/utils/common-helpers';

export default function SearchModal({ repositories }: { repositories: Repository[] }) {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleModalOpening = () => {
            // Read query string when modal is opening
            const params = new URLSearchParams(window.location.search);
            const query = params.get('q') || '';

            if (searchInputRef.current) {
                searchInputRef.current.value = query;
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('searchModalOpening', handleModalOpening);
        return () => window.removeEventListener('searchModalOpening', handleModalOpening);
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('search') as string;

        if (query) {
            // Update URL with query string using Next.js router
            router.push(`?q=${encodeURIComponent(query)}`);
        } else {
            router.push(`/icons/`);
        }

        // Close modal
        const searchModal = document.getElementById('search_modal') as HTMLDialogElement;
        if (searchModal) {
            searchModal.close();
        }
    };

    return (
        <dialog id="search_modal" className="d-modal items-start pt-12">
            <form className="d-modal-box pt-0 px-0" onSubmit={handleSubmit}>
                <div className="border-b border-gray-300">
                    <label className="d-input d-input-ghost d-input-lg w-full outline-none">
                        <Search className="w-5" />
                        <input
                            type="search"
                            name="search"
                            ref={searchInputRef}
                            placeholder="Type to search…"
                        />
                    </label>
                </div>
                <div className="px-4 py-2 space-x-1">
                    {(repositories || []).map((repo) => (
                        <button
                            type="button"
                            key={repo.id}
                            className={cx('d-badge d-badge-sm cursor-pointer')}
                            onClick={(e) => {
                                e.preventDefault();
                                const element = document.getElementById(nameToId(repo.name));
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                                const modal = document.getElementById('search_modal') as HTMLDialogElement;
                                modal?.close();
                            }}>
                            {repo.owner}/{repo.name}
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
