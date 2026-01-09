'use server';

import { getIconsByRepositoryId } from '@/db/icons';
import { getRepositories } from '@/db/repositories';
import { getVariants } from '@/db/variants';

export async function getRepositoriesAction() {
    const repos = await getRepositories();
    return Object.fromEntries(repos.map((repo) => [repo.id, repo]));
}

export async function getIconsByRepositoryIdAction(repositoryId: number) {
    return await getIconsByRepositoryId(repositoryId);
}

export async function getVariantsAction() {
    const variants = await getVariants();
    return Object.fromEntries(variants.map((variant) => [variant.id, variant]));
}
