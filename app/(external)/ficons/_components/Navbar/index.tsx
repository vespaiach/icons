'use client';

import { useClickAway } from '@uidotdev/usehooks';
import { Globe, Menu } from 'lucide-react';
import { useRef } from 'react';
import { repoToId } from '@/utils/common-helpers';
import AboutButton from './AboutButton';
import IconsSectionLinks from './IconsSectionLinks';
import SearchButton from './SearchButton';

export default function Navbar({ repositories }: { repositories: RepositoryVariants[] }) {
    const detailRef = useRef<HTMLDetailsElement>(null);
    const ref = useClickAway<HTMLUListElement>(() => {
        if (detailRef.current) {
            detailRef.current.open = false;
        }
    });

    return (
        <div className="d-navbar bg-base-100 min-h-10 px-4 shadow-sm sticky top-0 z-10">
            <a
                href="/ficons/"
                className="btn btn-ghost d-btn-sm font-mono font-semibold text-sm text-secondary flex items-center">
                <Globe className="size-5 me-2 inline-block" />
                FICONS
            </a>
            <SearchButton />
            <div className="hidden md:flex ml-auto items-center gap-1">
                <IconsSectionLinks repositories={repositories} />
                <AboutButton />
            </div>
            <details ref={detailRef} className="d-dropdown d-dropdown-end ml-auto md:hidden">
                <summary className="d-btn d-btn-sm d-btn-ghost -mr-2">
                    <Menu size={18} />
                </summary>
                <ul
                    ref={ref}
                    tabIndex={-1}
                    className="d-dropdown-content d-menu bg-base-100 rounded-box z-1 w-72 p-2 shadow-sm">
                    <li>
                        <span>Collections</span>
                        <ul>
                            {repositories.map((repo) => (
                                <li key={repo.id}>
                                    <a
                                        className="capitalize"
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
                    </li>
                    <li>
                        <a href="/about">About</a>
                    </li>
                </ul>
            </details>
        </div>
    );
}
