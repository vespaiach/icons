'use client';

import { useIsClient } from '@uidotdev/usehooks';
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

export function PageContextProvider({ children }: { children: ReactNode }) {
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
            const modalElement = document.getElementById('bottom_panel') as HTMLDialogElement | null;
            if (!modalElement) return;

            if (selectedIcon !== null) {
                modalElement.showModal();
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

export function usePageContext() {
    const context = useContext(IconContext);
    if (!context) {
        throw new Error('usePageContext must be used within PageContextProvider');
    }
    return context;
}
