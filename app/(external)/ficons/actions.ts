'use server';

import { getIconsByRepositoryId } from '@/db/icons';
import { getRepositoriesWithVariants } from '@/db/repositories';

export async function getRepositoriesAction(): Promise<(RepositoryVariants & { hash: string })[]> {
    const repositories = await getRepositoriesWithVariants();

    return repositories.map((repo) => ({
        ...repo,
        hash: repo.lastImportedAt ? Bun.hash(repo.lastImportedAt.toISOString()).toString(36).slice(0, 8) : ''
    }));
}

export async function getIconsByRepositoryIdAction(repositoryId: number) {
    return await getIconsByRepositoryId(repositoryId);
}
