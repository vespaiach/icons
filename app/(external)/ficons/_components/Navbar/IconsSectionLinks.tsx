'use client';

import { useRef } from 'react';
import { repoToId } from '@/utils/common-helpers';

export default function IconsSectionLinks({ repositories }: { repositories: Repository[] }) {
    const detailRef = useRef<HTMLDetailsElement>(null);

    return (
        <details ref={detailRef} className="d-dropdown d-dropdown-end">
            <summary className="d-btn d-btn-sm d-btn-ghost">Collections</summary>
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
                                    element.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                        inline: 'nearest'
                                    });
                                }

                                // Close dropdown
                                if (detailRef.current) {
                                    detailRef.current.open = false;
                                }
                            }}>
                            {repo.owner}/{repo.name}
                        </a>
                    </li>
                ))}
            </ul>
        </details>
    );
}
