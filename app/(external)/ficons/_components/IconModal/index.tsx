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
        <dialog id="icon_modal" className="d-modal">
            <div className="d-modal-box w-138 max-w-138 relative">
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

            <form method="dialog" className="d-modal-backdrop">
                <button type="button" onClick={handleClose}>
                    close
                </button>
            </form>
        </dialog>
    );
}
