'use client';

import { Info, Settings, X } from 'lucide-react';
import { useRef, useState } from 'react';
import ColorAdjuster from '@/components/ColorAdjuster';
import SizeAdjuster from '@/components/SizeAdjuster';
import RepositoryInfo from '../RepositoryInfo';

export default function SectionHeader({ repository }: { repository: RepositoryVariants }) {
    const infoDialogRef = useRef<HTMLDialogElement>(null);
    const variants = repository.variants;

    const [attributes, setAttributes] = useState({
        size: 24,
        color:
            variants[0].defaultSvgAttributes.fill ?? variants[0].defaultSvgAttributes.stroke ?? 'currentColor'
    });

    return (
        <>
            <h2 className="font-semibold text-2xl capitalize flex items-center mb-2">
                {repository.owner}/{repository.name}
                <button
                    type="button"
                    className="d-btn d-btn-ghost d-btn-sm d-btn-square cursor-pointer ml-2"
                    aria-label="Repository Information"
                    onClick={() => {
                        infoDialogRef.current?.showModal();
                    }}>
                    <Info className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    className="d-btn d-btn-ghost d-btn-sm d-btn-square cursor-pointer"
                    aria-label="Repository Settings"
                    onClick={() => {
                        infoDialogRef.current?.showModal();
                    }}>
                    <Settings className="w-4 h-4" />
                </button>
            </h2>
            <dialog ref={infoDialogRef} className="d-modal">
                <div className="d-modal-box relative">
                    <form method="dialog">
                        <button className="absolute top-2 right-2 d-btn d-btn-sm d-btn-ghost d-btn-circle">
                            <X />
                        </button>
                    </form>
                    <h2 className="font-semibold text-xl capitalize mb-4">{repository.name}</h2>
                    <RepositoryInfo selectedRepository={repository} />
                    <h2 className="font-semibold text-xl capitalize mb-4 mt-6">Customizer</h2>
                    <div className="shrink-0">
                        <SizeAdjuster
                            size={attributes.size}
                            onSizeChange={(newSize) => setAttributes({ ...attributes, size: newSize })}
                        />
                        <ColorAdjuster
                            className="mt-5 flex items-center justify-between"
                            color={attributes.color}
                            onColorChange={(newColor) => setAttributes({ ...attributes, color: newColor })}
                        />
                    </div>
                </div>
                <form method="dialog" className="d-modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}
