import { Globe } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 pt-8 max-w-3xl">
            <div className="mb-6">
                <Link href="/ficons" className="d-btn d-btn-sm d-btn-ghost">
                    ← Back to Icons
                </Link>
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
            </div>
            <Footer />
        </div>
    );
}
