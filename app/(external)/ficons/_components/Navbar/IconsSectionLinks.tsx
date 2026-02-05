'use client';

import { useClickAway } from '@uidotdev/usehooks';
import { useRef } from 'react';
import MenuItem from '../MenuItem';

export default function IconsSectionLinks({ repositories }: { repositories: RepositoryVariants[] }) {
    const detailRef = useRef<HTMLDetailsElement>(null);
    const ref = useClickAway<HTMLUListElement>(() => {
        if (detailRef.current) {
            detailRef.current.open = false;
        }
    });

    return (
        <details ref={detailRef} id="collections_dropdown" className="d-dropdown d-dropdown-end">
            <summary className="d-btn d-btn-sm d-btn-ghost">Collections</summary>
            <ul
                ref={ref}
                tabIndex={-1}
                className="p-8 d-dropdown-content d-menu d-menu-horizontal bg-base-100 rounded-box z-1 min-w-max shadow-xl border-2 border-secondary">
                <li>
                    <ul className="before:hidden ml-0 pl-0">
                        {repositories.slice(0, Math.ceil(repositories.length / 2)).map((repo) => (
                            <MenuItem key={repo.id} repo={repo} />
                        ))}
                    </ul>
                </li>
                <li>
                    <ul>
                        {repositories.slice(Math.ceil(repositories.length / 2)).map((repo) => (
                            <MenuItem key={repo.id} repo={repo} />
                        ))}
                    </ul>
                </li>
            </ul>
        </details>
    );
}
