import { ExternalLink, Globe } from 'lucide-react';
import Footer from '@/components/Footer';
import { getRepositoriesAction } from '../ficons/actions';

export default async function AboutPage() {
    const repositories = await getRepositoriesAction();
    return (
        <div className="container mx-auto px-4 pt-8 max-w-3xl">
            <div className="mb-6">
                <a href="/ficons" className="d-btn d-btn-sm d-btn-ghost">
                    ← Back to Icons
                </a>
            </div>

            <h1 className="font-bold text-3xl mb-6 flex items-center gap-3">
                About <Globe size={28} /> Ficons
            </h1>

            <div className="prose max-w-none mb-10">
                <p>
                    Ficons is a curated, all-in-one icon explorer designed for developers and designers who
                    need quick access to free vector icons. Instead of jumping between multiple documentation
                    sites, Ficons brings together the most popular libraries—including Feather, Heroicons,
                    Lucide... into a single, searchable interface.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">To Use This Page</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">1. Browse Collections</h3>
                <p>Use the navigation links to jump to different icon sets.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">2. Quick Search</h3>
                <p>
                    Press <kbd className="d-kbd d-kbd-sm">⌘ K</kbd> (or{' '}
                    <kbd className="d-kbd d-kbd-sm">Ctrl K</kbd>) to jump to the Search bar. Hit enter to
                    search for specific keywords (e.g., "arrow", "user", "settings") to find icons.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">3. Customize Styles</h3>
                <p>
                    Many libraries offer different weights and styles. Use sidebar to change those settings.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">4. Copy or Download</h3>
                <p>
                    Simply click on any icon to copy its name or SVG code directly to your clipboard. Or click
                    download to save the icon.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5. Add to Favorites</h3>
                <p>
                    Click the heart icon on any icon to add it to your Favorites collection. Access your
                    favorites by clicking the heart button in the top-right corner. You can quickly copy or
                    download all your favorite icons from there.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Supported Icon Collections</h2>
                <p className="mb-4">
                    Ficons currently supports {repositories.length} icon collections with a total of{' '}
                    {repositories
                        .reduce(
                            (sum, repo) =>
                                sum + repo.variants.reduce((vSum, v) => vSum + (v.iconCount || 0), 0),
                            0
                        )
                        .toLocaleString()}{' '}
                    icons:
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    {repositories.map((repo) => {
                        const totalIcons = repo.variants.reduce((sum, v) => sum + (v.iconCount || 0), 0);
                        return (
                            <div key={repo.id} className="d-card bg-base-200 p-4">
                                <a
                                    href={`https://github.com/${repo.owner}/${repo.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start justify-between gap-2"
                                    aria-label={`View ${repo.name} on GitHub`}>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{repo.name}</h3>
                                        <p className="text-sm opacity-70 mt-1">
                                            {totalIcons.toLocaleString()} icon{totalIcons !== 1 ? 's' : ''}
                                            {repo.variants.length > 1 &&
                                                ` · ${repo.variants.length} variants`}
                                        </p>
                                    </div>
                                    <span className="d-btn d-btn-ghost d-btn-xs d-btn-square">
                                        <ExternalLink size={14} />
                                    </span>
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Footer />
        </div>
    );
}
