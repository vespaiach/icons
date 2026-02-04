'use client';

import { Download, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import ColorAdjuster from '@/components/ColorAdjuster';
import SizeAdjuster from '@/components/SizeAdjuster';
import TextToSvg from '@/components/TextToSvg';
import { useFavoritesAction, useFavoritesValue } from './PageContext';

export default function Drawer({ repositories }: { repositories: RepositoryVariants[] }) {
    const { ids, byIds } = useFavoritesValue();
    const [_, removeFromFavorites, removeAll] = useFavoritesAction();
    const [attributes, setAttributes] = useState({ size: 24, color: 'currentColor' });
    const [isDownloading, setIsDownloading] = useState(false);

    const getVariant = (iconId: number) => {
        const favorite = byIds[iconId];

        const repository = repositories.find((repo) => repo.id === favorite.repositoryId);
        if (!repository) return null;

        const variant = repository.variants.find((v) => v.id === favorite.variantId);
        if (!variant) return null;

        return variant;
    };

    useEffect(() => {
        if (ids.size === 0) {
            document.getElementById('drawer_toggler')?.click();
        }
    }, [ids]);

    const handleDownload = async () => {
        if (isDownloading) return;

        setIsDownloading(true);
        try {
            const iconIds = Array.from(ids);

            // Call the API route instead of server action
            const response = await fetch('/ficons/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ iconIds, attributes })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Download failed');
            }

            // Get the blob from response
            const blob = await response.blob();

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `icons-${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Clear favorites after successful download
            removeAll();
            document.getElementById('drawer_toggler')?.click();
        } catch (error) {
            console.error('Download error:', error);
            alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDownloading(false);
        }
    };

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
                        const variant = getVariant(favorite.id);
                        if (!variant) return null;

                        return (
                            <button
                                aria-label="Click to remove from favorites"
                                type="button"
                                key={id}
                                onClick={() => removeFromFavorites(id)}
                                className="d-btn d-btn-sm d-btn-error d-btn-ghost p-1 relative group">
                                <TextToSvg svgText={favorite.svgText} />
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
                    onClick={handleDownload}
                    disabled={isDownloading}>
                    <Download size={18} />
                    {isDownloading ? (
                        <span className="flex items-center gap-1">
                            Download<span className="d-loading d-loading-dots d-loading-xs"></span>
                        </span>
                    ) : (
                        'Download'
                    )}
                </button>
            </div>
        </div>
    );
}
