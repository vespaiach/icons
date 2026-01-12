'use client';

import { useIsClient } from '@uidotdev/usehooks';
import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useState
} from 'react';

interface IconContextType {
    selectedIcon: IconWithRelativeData | null;
    selectedRepository: Repository | null;
    variants: ExtendedVariant[];
    setSelectedIcon: (icon: IconWithRelativeData | null) => void;
    setSelectedRepository: (repo: Repository | null) => void;
    setVariants: Dispatch<SetStateAction<ExtendedVariant[]>>;
    getVariantsByRepositoryId: (repoId: number) => ExtendedVariant[];
    updatedVariant: (updatedVariant: ExtendedVariant) => void;
}

export interface ExtendedVariant extends Variant {
    svgAttributes?: {
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        width: number;
        height: number;
    };
}

const IconContext = createContext<IconContextType | undefined>(undefined);

export function PageContextProvider({ children, variants }: { children: ReactNode; variants: Variant[] }) {
    const isClient = useIsClient();
    const [selectedIcon, setSelectedIcon] = useState<IconWithRelativeData | null>(null);
    const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
    const [_variants, setVariants] = useState<ExtendedVariant[]>([...variants]);

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

    const getVariantsByRepositoryId = useCallback(
        (repoId: number) => {
            return _variants.filter((variant) => variant.repositoryId === repoId);
        },
        [_variants]
    );

    const updatedVariant = useCallback((updatedVariant: ExtendedVariant) => {
        setVariants((vas) => vas.map((v) => (v.id === updatedVariant.id ? updatedVariant : v)));
    }, []);

    return (
        <IconContext.Provider
            value={{
                selectedIcon,
                selectedRepository,
                variants: _variants,
                setSelectedIcon,
                setSelectedRepository,
                setVariants,
                getVariantsByRepositoryId,
                updatedVariant
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
