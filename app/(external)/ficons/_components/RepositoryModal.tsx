'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { RotateCcw, X } from 'lucide-react';
import { useTransition } from 'react';
import ColorAdjuster from '@/components/ColorAdjuster';
import SizeAdjuster from '@/components/SizeAdjuster';
import { adjustmentsByRepoIdAtom, repositoryAtom } from './PageContext';
import RepositoryInfo from './RepositoryInfo';

export default function RepositoryModal() {
    const [_, startTransition] = useTransition();
    const repository = useAtomValue(repositoryAtom);
    const setRepository = useSetAtom(repositoryAtom);
    const adjustments = useAtomValue(adjustmentsByRepoIdAtom);
    const setAdjustment = useSetAtom(adjustmentsByRepoIdAtom);
    const adjustment = repository ? adjustments[repository.id] : null;

    const adjust = ({ color, size }: { color?: string; size?: number }) => {
        if (!repository || !adjustment) return;

        startTransition(() => {
            setAdjustment((prev) => ({
                ...prev,
                [repository.id]: { color: color ?? adjustment.color, size: size ?? adjustment.size }
            }));
        });
    };

    if (!repository || !adjustment) return null;

    return (
        <dialog id="repository_modal" className="d-modal" open={!!repository}>
            <div className="d-modal-box relative w-72 max-w-72">
                <form
                    method="dialog"
                    onSubmit={() => {
                        setRepository(null);
                    }}>
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
            <form
                method="dialog"
                className="d-modal-backdrop"
                onSubmit={() => {
                    setRepository(null);
                }}>
                <button type="submit">close</button>
            </form>
        </dialog>
    );
}
