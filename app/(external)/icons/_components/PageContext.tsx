'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

interface IconContextType {
    selectedIcon: IconWithRelativeData | null;
    setSelectedIcon: (icon: IconWithRelativeData | null) => void;
    selectedRepository: Repository | null;
    setSelectedRepository: (repo: Repository | null) => void;
    repositoriesMap: Record<number, Repository>;
}

const IconContext = createContext<IconContextType | undefined>(undefined);

export function PageContextProvider({
    children,
    repositoriesMap
}: {
    children: ReactNode;
    repositoriesMap: Record<number, Repository>;
}) {
    const [selectedIcon, setSelectedIcon] = useState<IconWithRelativeData | null>(null);
    const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);

    useEffect(() => {
        const modalElement = document.getElementById('bottom_panel') as HTMLDialogElement | null;
        if (!modalElement) return;

        if (selectedIcon) {
            modalElement.showModal();
        } else {
            modalElement.close();
        }
    }, [selectedIcon]);

    return (
        <IconContext.Provider
            value={{
                selectedIcon,
                setSelectedIcon,
                selectedRepository,
                setSelectedRepository,
                repositoriesMap
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
