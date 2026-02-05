'use client';

import { useClickAway } from '@uidotdev/usehooks';
import { Globe, Menu } from 'lucide-react';
import { useRef } from 'react';
import AboutButton from './AboutButton';
import IconsSectionLinks from './IconsSectionLinks';
import SearchButton from './SearchButton';

export default function Navbar({ repositories }: { repositories: RepositoryVariants[] }) {
    const detailRef = useRef<HTMLDetailsElement>(null);
    const _ref = useClickAway<HTMLUListElement>(() => {
        if (detailRef.current) {
            detailRef.current.open = false;
        }
    });

    return (
        <div className="d-navbar bg-base-100 min-h-10 px-4 shadow-sm sticky top-0 z-100">
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
            <label
                className="d-btn d-btn-sm d-btn-ghost -mr-2 md:hidden ml-auto"
                htmlFor="right_drawer_toggler">
                <Menu size={18} />
            </label>
        </div>
    );
}
