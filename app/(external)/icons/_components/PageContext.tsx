'use client';

import { useIsClient } from '@uidotdev/usehooks';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

interface IconContextType {
    selectedIcon: IconWithRelativeData | null;
    setSelectedIcon: (icon: IconWithRelativeData | null) => void;
    selectedRepository: Repository | null;
    setSelectedRepository: (repo: Repository | null) => void;
    variantsById: Record<number, ExtendedVariant>;
}

export interface ExtendedVariant extends Variant {
    allowCustomAttributes: string[];
    svgAttributes?: {
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        width?: number;
        height?: number;
    };
}

const IconContext = createContext<IconContextType | undefined>(undefined);

export function PageContextProvider({ children, variants }: { children: ReactNode; variants: Variant[] }) {
    const isClient = useIsClient();
    const [selectedIcon, setSelectedIcon] = useState<IconWithRelativeData | null>(null);
    const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
    const [variantsById, setVariantsById] = useState<Record<number, ExtendedVariant>>({});

    useEffect(() => {
        setVariantsById(
            Object.fromEntries(
                variants.map((v) => [v.id, { ...v, allowCustomAttributes: Object.keys(v.svgRootAttributes) }])
            )
        );
    }, [variants]);

    useEffect(() => {
        if (isClient) {
            const modalElement = document.getElementById('bottom_panel') as HTMLDialogElement | null;
            if (!modalElement) return;

            if (selectedIcon) {
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
                setSelectedIcon,
                selectedRepository,
                setSelectedRepository,
                variantsById
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
