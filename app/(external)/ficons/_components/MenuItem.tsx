'use client';

import { repoToId } from '@/utils/common-helpers';

export default function MenuItem({ repo }: { repo: RepositoryVariants }) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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

        // Close drawer
        const drawerToggler = document.getElementById('right_drawer_toggler') as HTMLInputElement;
        if (drawerToggler) {
            drawerToggler.checked = false;
        }

        // Close collections dropdown
        const collectionsDropdown = document.getElementById('collections_dropdown') as HTMLDetailsElement;
        if (collectionsDropdown) {
            collectionsDropdown.open = false;
        }
    };
    const iconCount = repo.variants.reduce((acc, variant) => acc + variant.iconCount, 0);

    return (
        <li>
            <a className="capitalize" href={`#${repoToId(repo)}`} onClick={handleClick}>
                {repo.owner}/{repo.name} ({iconCount})
            </a>
        </li>
    );
}
