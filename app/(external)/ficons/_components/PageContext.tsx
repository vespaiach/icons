'use client';

import { useIsClient } from '@uidotdev/usehooks';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface IconContextType {
    selectedIcon: IconWithRelativeData | null;
    selectedRepositoryId: number | null;
    svgAttributeAdjustments: Record<number, SvgAdjustableAttributes>;
    setSelectedIcon: (icon: IconWithRelativeData | null) => void;
    setSelectedRepositoryId: (repoId: number | null) => void;
    setSvgAttributeAdjustments: (variantId: number, adjustments: SvgAdjustableAttributes) => void;
}

const IconContext = createContext<IconContextType | undefined>(undefined);

export const adjustmentsByRepoIdAtom = atom<Record<number, { color: string; size: number }>>({});

export function PageContextProvider({
    children,
    repositories
}: {
    repositories: RepositoryVariants[];
    children: ReactNode;
}) {
    useHydrateAtoms([
        [
            adjustmentsByRepoIdAtom,
            repositories.reduce(
                (acc, r) => {
                    acc[r.id] = { color: 'currentColor', size: 24 };
                    return acc;
                },
                {} as Record<number, { color: string; size: number }>
            )
        ]
    ]);

    const isClient = useIsClient();
    const [selectedIcon, setSelectedIcon] = useState<IconWithRelativeData | null>(null);
    const [selectedRepositoryId, setSelectedRepositoryId] = useState<number | null>(null);
    const [svgAttributeAdjustments, _setVariantAdjustments] = useState<
        Record<number, SvgAdjustableAttributes>
    >({});

    const setSvgAttributeAdjustments = useCallback(
        (variantId: number, adjustments: SvgAdjustableAttributes) => {
            _setVariantAdjustments((prev) => ({ ...prev, [variantId]: adjustments }));
        },
        []
    );

    useEffect(() => {
        if (isClient) {
            const modalElement = document.getElementById('icon_modal') as HTMLDialogElement | null;
            if (!modalElement) return;

            if (selectedIcon !== null) {
                modalElement.show();
            } else {
                modalElement.close();
            }
        }
    }, [selectedIcon, isClient]);

    return (
        <IconContext.Provider
            value={{
                selectedIcon,
                selectedRepositoryId,
                svgAttributeAdjustments,
                setSelectedIcon,
                setSelectedRepositoryId,
                setSvgAttributeAdjustments
            }}>
            {children}
        </IconContext.Provider>
    );
}

export function useAdjustment(repositoryId?: number) {
    const adjustments = useAtomValue(adjustmentsByRepoIdAtom);
    return repositoryId ? adjustments[repositoryId] : { color: 'currentColor', size: 24 };
}

export function usePageContext() {
    const context = useContext(IconContext);
    if (!context) {
        throw new Error('usePageContext must be used within PageContextProvider');
    }
    return context;
}
