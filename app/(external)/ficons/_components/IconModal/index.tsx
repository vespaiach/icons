'use client';

import { X } from 'lucide-react';
import { usePageContext } from '../PageContext';
import IconDetails from './IconDetails';

export default function IconModal({ repositories }: { repositories: RepositoryVariants[] }) {
    const { selectedIcon, svgAttributeAdjustments, setSelectedIcon } = usePageContext();
    const repository = selectedIcon
        ? repositories.find((repo) => repo.id === selectedIcon.repositoryId)
        : null;
    const variant =
        selectedIcon && repository ? repository.variants.find((v) => v.id === selectedIcon.variantId) : null;
    const adjustment = variant ? svgAttributeAdjustments[variant.id] || {} : {};

    const handleClose = () => {
        setSelectedIcon(null);
    };

    return (
        <dialog id="icon_modal" className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 w-133 max-w-133 rounded-3xl">
            <div className="relative bg-gray-200 rounded-3xl p-5 shadow-lg">
                <button
                    type="button"
                    className="absolute top-1 right-1 d-btn d-btn-sm d-btn-ghost d-btn-circle"
                    onClick={handleClose}>
                    <X size={20} />
                </button>
                {selectedIcon && variant && (
                    <IconDetails selectedIcon={selectedIcon} variant={variant} adjustment={adjustment} />
                )}
            </div>
        </dialog>
    );
}
