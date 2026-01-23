import { Globe } from 'lucide-react';
import AboutButton from './AboutButton';
import IconsSectionLinks from './IconsSectionLinks';
import SearchButton from './SearchButton';

export default function Navbar({ repositories }: { repositories: RepositoryVariants[] }) {
    return (
        <div className="d-navbar bg-base-100 min-h-10 px-4 shadow-sm sticky top-0 z-10">
            <a
                href="/ficons/"
                className="btn btn-ghost d-btn-sm font-mono font-semibold text-sm text-secondary flex items-center">
                <Globe className="size-5 me-2 inline-block" />
                FICONS
            </a>
            <SearchButton />
            <div className="ml-auto flex items-center gap-1">
                <IconsSectionLinks repositories={repositories} />
                <AboutButton />
            </div>
        </div>
    );
}
