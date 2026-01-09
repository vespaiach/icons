'use server';

import { getDirectories } from '@/db/directories';
import { getIconsByRepositoryId } from '@/db/icons';
import { getRepositories } from '@/db/repositories';

export async function getRepositoriesAction() {
    const repos = await getRepositories();
    return Object.fromEntries(repos.map((repo) => [repo.id, repo]));
}

export async function getIconsByRepositoryIdAction(repositoryId: number) {
    return await getIconsByRepositoryId(repositoryId);
}

export async function getDirectoriesAction() {
    const directories = await getDirectories();
    return Object.fromEntries(directories.map((dir) => [dir.id, dir]));
}
