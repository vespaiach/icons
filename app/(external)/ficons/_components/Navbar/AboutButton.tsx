'use client';

import { BadgeInfo } from 'lucide-react';

export default function AboutButton() {
    const openModal = () => {
        const aboutModal = document.getElementById('about_modal') as HTMLDialogElement;
        if (aboutModal) {
            aboutModal.showModal();
        }
    };

    return (
        <button
            type="button"
            className="d-btn d-btn-sm d-btn-ghost"
            onClick={openModal}>
            About
        </button>
    );
}
