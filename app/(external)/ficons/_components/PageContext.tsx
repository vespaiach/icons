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
    repositories: RepositoryVariants[];
    setSelectedIcon: (icon: IconWithRelativeData | null) => void;
    setSelectedRepository: (repo: Repository | null) => void;
    setRepositoriesVariants: Dispatch<SetStateAction<RepositoryVariants[]>>;
    getVariantsByRepositoryId: (repoId: number) => Variant[];
    updatedVariant: (updatedVariant: Variant) => void;
}

const IconContext = createContext<IconContextType | undefined>(undefined);

export function PageContextProvider({
    children,
    repositoriesVariants
}: {
    children: ReactNode;
    repositoriesVariants: RepositoryVariants[];
}) {
    const isClient = useIsClient();
    const [selectedIcon, setSelectedIcon] = useState<IconWithRelativeData | null>(null);
    const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
    const [_repositoriesVariants, setRepositoriesVariants] = useState<RepositoryVariants[]>([
        ...repositoriesVariants
    ]);

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
            const repository = _repositoriesVariants.find((repo) => repo.id === repoId);
            return repository?.variants || [];
        },
        [_repositoriesVariants]
    );

    const updatedVariant = useCallback((updatedVariant: Variant) => {
        setRepositoriesVariants((repos) =>
            repos.map((repo) => ({
                ...repo,
                variants: repo.variants.map((v) => (v.id === updatedVariant.id ? updatedVariant : v))
            }))
        );
    }, []);

    return (
        <IconContext.Provider
            value={{
                selectedIcon,
                selectedRepository,
                repositories: _repositoriesVariants,
                setSelectedIcon,
                setSelectedRepository,
                setRepositoriesVariants,
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
