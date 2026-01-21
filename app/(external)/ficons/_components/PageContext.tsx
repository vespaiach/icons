'use client';

import { useIsClient } from '@uidotdev/usehooks';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo } from 'react';

export const adjustmentsByRepoIdAtom = atom<Record<number, { color: string; size: number }>>({});
export const iconAtom = atom<IconWithRelativeData | null>(null);
export const favoritesAtom = atom<Favorite[]>([]);
export const drawerOpenAtom = atom<boolean>(false);

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
    const selectedIcon = useIconValue();

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

    return children;
}

export function useAdjustment(repositoryId?: number) {
    const adjustments = useAtomValue(adjustmentsByRepoIdAtom);
    return repositoryId ? adjustments[repositoryId] : { color: 'currentColor', size: 24 };
}

export function useIconAcion() {
    const set = useSetAtom(iconAtom);
    return [
        useCallback(
            (icon: IconWithRelativeData) => {
                set(icon);
            },
            [set]
        ),
        useCallback(() => {
            set(null);
        }, [set])
    ] as const;
}

export function useIconValue() {
    return useAtomValue(iconAtom);
}

export function useFavoritesAction() {
    const set = useSetAtom(favoritesAtom);
    return [
        useCallback(
            (icon: { id: number; svgAst: SvgNode }) => {
                set((prev) => {
                    const exists = prev.find((fav) => fav.iconId === icon.id);
                    if (exists) {
                        return prev.map((fav) =>
                            fav.iconId === icon.id ? { iconId: icon.id, svgAst: icon.svgAst } : fav
                        );
                    } else {
                        return [...prev, { iconId: icon.id, svgAst: icon.svgAst }];
                    }
                });
            },
            [set]
        ),
        useCallback(
            (id: number) => {
                set((prev) => prev.filter((fav) => fav.iconId !== id));
            },
            [set]
        ),
        useCallback(() => {
            set([]);
        }, [set])
    ] as const;
}

export function useFavoritesValue() {
    const favs = useAtomValue(favoritesAtom);
    return useMemo(() => {
        return {
            ids: new Set(favs.map((fav) => fav.iconId)),
            byIds: Object.fromEntries(favs.map((fav) => [fav.iconId, fav]))
        };
    }, [favs]);
}

export function useDrawerValue() {
    return useAtomValue(drawerOpenAtom);
}

export function useDrawerAction() {
    const set = useSetAtom(drawerOpenAtom);
    return [
        useCallback(() => {
            set(true);
        }, [set]),
        useCallback(() => {
            set(false);
        }, [set])
    ] as const;
}
