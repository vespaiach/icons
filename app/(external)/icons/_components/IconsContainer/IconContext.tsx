'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

interface IconContextType {
    selectedIcon: IconWithRelativeData | null;
    setSelectedIcon: (icon: IconWithRelativeData | null) => void;
}

const IconContext = createContext<IconContextType | undefined>(undefined);

export function SelectedIconProvider({ children }: { children: ReactNode }) {
    console.log('SelectedIconProvider rendered');
    const [selectedIcon, setSelectedIcon] = useState<IconWithRelativeData | null>(null);

    useEffect(() => {
        const modalElement = document.getElementById('bottom_panel') as HTMLDialogElement | null;
        if (!modalElement) return;

        if (selectedIcon) {
            modalElement.showModal();
        } else {
            modalElement.close();
        }
    }, [selectedIcon]);

    return <IconContext.Provider value={{ selectedIcon, setSelectedIcon }}>{children}</IconContext.Provider>;
}

export function useSelectedIcon() {
    const context = useContext(IconContext);
    if (!context) {
        throw new Error('useSelectedIcon must be used within IconProvider');
    }
    return context;
}
