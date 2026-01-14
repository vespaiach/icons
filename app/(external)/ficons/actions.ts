'use server';

import { getIconsByRepositoryId } from '@/db/icons';
import { getRepositoriesWithVariants } from '@/db/repositories';

export async function getRepositoriesAction() {
    return await getRepositoriesWithVariants();
}

export async function getIconsByRepositoryIdAction(repositoryId: number) {
    return await getIconsByRepositoryId(repositoryId);
}
