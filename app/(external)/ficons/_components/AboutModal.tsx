'use client';

import { Globe, X } from 'lucide-react';

export default function AboutModal() {
    return (
        <dialog id="about_modal" className="d-modal items-start pt-12">
            <div className="d-modal-box max-w-3xl">
                <form method="dialog">
                    <button
                        type="submit"
                        className="d-btn d-btn-sm d-btn-circle d-btn-ghost absolute right-4 top-5">
                        <X size={20} />
                    </button>
                </form>
                <h3 className="font-bold text-2xl mb-4 flex items-center gap-2">
                    About <Globe size={20} /> Ficons
                </h3>
                <div className="prose max-w-none">
                    <p>
                        Ficons is a curated, all-in-one icon explorer designed for developers and designers
                        who need quick access to free vector icons. Instead of jumping between multiple
                        documentation sites, Ficons brings together the most popular libraries—including
                        Feather, Heroicons, Lucide... into a single, searchable interface.
                    </p>

                    <h4 className="text-lg font-semibold mt-6 mb-3">To Use This Page</h4>

                    <h5 className="font-semibold mt-4 mb-2">1. Browse Collections</h5>
                    <p>Use the navigation links to jump to different icon sets.</p>

                    <h5 className="font-semibold mt-4 mb-2">2. Quick Search</h5>
                    <p>
                        Press <kbd className="d-kbd d-kbd-sm">⌘ K</kbd> (or{' '}
                        <kbd className="d-kbd d-kbd-sm">Ctrl K</kbd>) to jump to the Search bar. Hit enter to
                        search for specific keywords (e.g., "arrow", "user", "settings") to find icons.
                    </p>

                    <h5 className="font-semibold mt-4 mb-2">3. Customize Styles</h5>
                    <p>
                        Many libraries offer different weights and styles. Use sidebar to change those
                        settings:
                    </p>

                    <h5 className="font-semibold mt-4 mb-2">4. Copy or Download</h5>
                    <p>
                        Simply click on any icon to copy its name or SVG code directly to your clipboard. Or
                        click download to save the icon.
                    </p>
                </div>
            </div>
            <form method="dialog" className="d-modal-backdrop">
                <button type="submit" aria-label="close">
                    close
                </button>
            </form>
        </dialog>
    );
}
