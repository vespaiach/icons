'use client';

import { Search } from 'lucide-react';

export default function Header() {
    const openModel = () => {
        const searchModal = document.getElementById('search_modal') as HTMLDialogElement;
        if (searchModal) {
            searchModal.showModal();
        }
    };

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
                <span className="grow text-left">Search…</span>
                <kbd className="d-kbd d-kbd-sm font-mono opacity-50">
                    <span className="me-1 text-sm">⌘</span>K
                </kbd>
            </button>
            <div className="flex-none">
                <ul className="d-menu d-menu-horizontal px-1">
                    <li>
                        <a>Link</a>
                    </li>
                    <li>
                        <details>
                            <summary>Parent</summary>
                            <ul className="bg-base-100 rounded-t-none p-2">
                                <li>
                                    <a>Link 1</a>
                                </li>
                                <li>
                                    <a>Link 2</a>
                                </li>
                            </ul>
                        </details>
                    </li>
                </ul>
            </div>
        </div>
    );
}
