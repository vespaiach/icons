import { Suspense } from 'react';
import IconsContainer from './_components/IconsContainer';
import Navbar from './_components/Navbar';
import SearchModal from './_components/SearchModal';
import { getIconsByRepositoryIdAction, getRepositoriesAction } from './actions';

export default async function PageIcons() {
    const repositories = await getRepositoriesAction();
    const iconsByRepositoryPromises = Object.fromEntries(
        repositories.map((repo) => [repo.id, getIconsByRepositoryIdAction(repo.id)])
    );

    return (
        <>
            <Navbar />
            {Object.keys(iconsByRepositoryPromises).map((repoId) => {
                const repository = repositories.find((repo) => repo.id === Number(repoId));
                if (!repository) return null;
                
                return (
                    <Suspense key={repoId}>
                        <IconsContainer
                            repository={repository}
                            iconsPromise={iconsByRepositoryPromises[repoId]}
                        />
                    </Suspense>
                );
            })}
            <SearchModal repositories={repositories} />
        </>
    );
}
