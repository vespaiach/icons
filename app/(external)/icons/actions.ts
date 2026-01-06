import { getIconsByRepositoryId } from '@/db/icons';
import { getRepositoriesWithIconCount } from '@/db/repositories';

export function getRepositoriesAction() {
    return getRepositoriesWithIconCount();
}

export async function getIconsByRepositoryIdAction(repositoryId: number) {
    const icons = await getIconsByRepositoryId(repositoryId);
    return icons.map((icon) => ({
        ...icon,
        name: icon.variant === 'default' ? icon.name : `${icon.name} (${icon.variant})`
    }));
}
