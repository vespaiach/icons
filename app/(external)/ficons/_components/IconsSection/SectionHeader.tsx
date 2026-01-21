'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { Info, RotateCcw, Settings, X } from 'lucide-react';
import { useRef, useTransition } from 'react';
import ColorAdjuster from '@/components/ColorAdjuster';
import SizeAdjuster from '@/components/SizeAdjuster';
import { adjustmentsByRepoIdAtom } from '../PageContext';
import RepositoryInfo from '../RepositoryInfo';

export default function SectionHeader({ repository }: { repository: RepositoryVariants }) {
    const [_, startTransition] = useTransition();
    const infoDialogRef = useRef<HTMLDialogElement>(null);
    const adjustments = useAtomValue(adjustmentsByRepoIdAtom);
    const setAdjustment = useSetAtom(adjustmentsByRepoIdAtom);
    const adjustment = adjustments[repository.id];

    const adjust = ({ color, size }: { color?: string; size?: number }) => {
        startTransition(() => {
            setAdjustment((prev) => ({
                ...prev,
                [repository.id]: { color: color ?? adjustment.color, size: size ?? adjustment.size }
            }));
        });
    };

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
                <div className="d-modal-box relative w-72 max-w-72">
                    <form method="dialog">
                        <button
                            type="submit"
                            className="absolute top-1 right-1 d-btn d-btn-ghost d-btn-sm d-btn-circle">
                            <X />
                        </button>
                    </form>
                    <h2 className="font-semibold text-xl capitalize mb-4">{repository.name}</h2>
                    <RepositoryInfo selectedRepository={repository} />
                    <div className="flex items-center justify-between mb-4 mt-6">
                        <h2 className="font-semibold text-xl capitalize">Customizer</h2>
                        <button
                            type="button"
                            aria-label="Reset"
                            className="d-btn d-btn-ghost d-btn-sm d-btn-circle"
                            onClick={() => adjust({ color: 'currentColor', size: 24 })}>
                            <RotateCcw size={18} />
                        </button>
                    </div>
                    <div className="shrink-0">
                        <SizeAdjuster
                            size={adjustment?.size}
                            onSizeChange={(newSize) => adjust({ size: newSize })}
                        />
                        <ColorAdjuster
                            className="mt-5 flex flex-col items-start gap-3"
                            color={adjustment.color}
                            onColorChange={(newColor) => adjust({ color: newColor, size: adjustment.size })}
                        />
                    </div>
                </div>
                <form method="dialog" className="d-modal-backdrop">
                    <button type="submit">close</button>
                </form>
            </dialog>
        </>
    );
}
