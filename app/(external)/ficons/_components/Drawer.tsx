'use client';

import { Download, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import AstToSvg from '@/components/AstToSvg';
import ColorAdjuster from '@/components/ColorAdjuster';
import SizeAdjuster from '@/components/SizeAdjuster';
import { useFavoritesAction, useFavoritesValue } from './PageContext';

export default function Drawer() {
    const { ids, byIds } = useFavoritesValue();
    const [_, removeFromFavorites, removeAll] = useFavoritesAction();
    const [attributes, setAttributes] = useState({ size: 24, color: 'currentColor' });

    useEffect(() => {
        if (ids.size === 0) {
            document.getElementById('drawer_toggler')?.click();
        }
    }, [ids]);

    return (
        <div className="d-drawer-side">
            <label htmlFor="drawer_toggler" aria-label="close sidebar" className="d-drawer-overlay" />
            <div className="bg-white dark:bg-base-200 w-80 p-5 min-h-full flex flex-col">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Favorites</h2>
                    <button
                        type="button"
                        className="d-btn d-btn-circle d-btn-error d-btn-ghost d-btn-sm"
                        onClick={() => {
                            removeAll();
                            document.getElementById('drawer_toggler')?.click();
                        }}>
                        <Trash size={18} />
                    </button>
                </div>
                <div className="d-divider-vertical d-divider"></div>
                <div className="flex gap-2 flex-wrap flex-1 overflow-auto">
                    {Array.from(ids).map((id) => {
                        const favorite = byIds[id];
                        return (
                            <button
                                aria-label="Click to remove from favorites"
                                type="button"
                                key={id}
                                onClick={() => removeFromFavorites(id)}
                                className="d-btn d-btn-sm d-btn-error d-btn-ghost p-1 relative group">
                                <AstToSvg svgAst={favorite.svgAst} width={28} height={28} />
                            </button>
                        );
                    })}
                </div>
                <div className="d-divider-vertical d-divider"></div>
                <div className="shrink-0">
                    <SizeAdjuster
                        size={attributes.size}
                        onSizeChange={(newSize) => setAttributes({ ...attributes, size: newSize })}
                    />
                    <ColorAdjuster
                        className="mt-3 space-y-3"
                        color={attributes.color}
                        onColorChange={(newColor) => setAttributes({ ...attributes, color: newColor })}
                    />
                </div>
                <div className="d-divider-vertical d-divider"></div>
                <button
                    type="button"
                    className="d-btn d-btn-secondary d-btn-sm w-full"
                    onClick={() => {
                        Array.from(ids).forEach((id) => removeFromFavorites(id));
                    }}>
                    <Download size={18} />
                    Download
                </button>
            </div>
        </div>
    );
}
