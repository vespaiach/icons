import { getIconsByRepositoryId } from '@/db/icons';
import { getRepositoriesWithIconCount } from '@/db/repositories';

export function getRepositoriesAction() {
    return getRepositoriesWithIconCount();
}

export async function getIconsByRepositoryIdAction(repositoryId: number) {
    return await getIconsByRepositoryId(repositoryId);
}
