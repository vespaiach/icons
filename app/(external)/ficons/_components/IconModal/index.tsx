'use client';

import { X } from 'lucide-react';
import { useAdjustment, useIconAcion, useIconValue } from '../PageContext';
import IconDetails from './IconDetails';

export default function IconModal({ repositories }: { repositories: RepositoryVariants[] }) {
    const selectedIcon = useIconValue();
    const [_, clearSelectedIcon] = useIconAcion();
    const repository = selectedIcon
        ? repositories.find((repo) => repo.id === selectedIcon.repositoryId)
        : null;
    const adjustment = useAdjustment(repository?.id);
    const variant =
        selectedIcon && repository ? repository.variants.find((v) => v.id === selectedIcon.variantId) : null;

    if (!selectedIcon || !variant) {
        return null;
    }

    return (
        <dialog id="icon_modal" className="d-modal">
            <div className="d-modal-box relative w-70 max-w-70 md:w-130 md:max-w-130">
                <button
                    type="button"
                    className="absolute top-1 right-1 d-btn d-btn-sm d-btn-ghost d-btn-circle"
                    onClick={clearSelectedIcon}>
                    <X size={20} />
                </button>
                <IconDetails selectedIcon={selectedIcon} variant={variant} adjustment={adjustment} />
            </div>
            <form method="dialog" onSubmit={clearSelectedIcon} className="d-modal-backdrop">
                <button type="submit">Close</button>
            </form>
        </dialog>
    );
}
