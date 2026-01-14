'use server';

import { getIconsByRepositoryId } from '@/db/icons';
import { getRepositories } from '@/db/repositories';
import { getVariants } from '@/db/variants';

export async function getRepositoriesAction() {
    return await getRepositories();
}

export async function getIconsByRepositoryIdAction(repositoryId: number) {
    return await getIconsByRepositoryId(repositoryId);
}

export async function getVariantsAction() {
    return await getVariants();
}
