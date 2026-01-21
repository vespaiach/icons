'use client';

import { useClickAway } from '@uidotdev/usehooks';
import { useMemo, useState } from 'react';
import useTrackingVisibleSections from '@/hooks/useTrackingVisibleSections';
import { repoToId } from '@/utils/common-helpers';

export default function IconsSectionLinks({ repositories }: { repositories: Repository[] }) {
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
                                    // Get navbar height for proper offset
                                    const navbarHeight = 80; // Matches the -80px rootMargin in useTrackingVisibleSections
                                    const elementPosition = element.getBoundingClientRect().top;
                                    const offsetPosition = elementPosition + window.scrollY - navbarHeight;

                                    window.scrollTo({
                                        top: offsetPosition,
                                        behavior: 'smooth'
                                    });
                                }

                                // Close dropdown
                                setIsDropdownOpen(false);

                                // Update visible section after scroll completes
                                // Use longer timeout for mobile smooth scrolling
                                setTimeout(() => {
                                    setVisibleSectionId(id);
                                }, 1500);
                            }}>
                            {repo.owner}/{repo.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
