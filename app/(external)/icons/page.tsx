import { Suspense } from 'react';
import Drawer from './_components/Drawer';
import DrawerToggler from './_components/DrawerToggler';
import IconDetailsModal from './_components/IconDetailsModal';
import IconSection from './_components/IconSection';
import Navbar from './_components/Navbar';
import { PageContextProvider } from './_components/PageContext';
import SearchModal from './_components/SearchModal';
import { getIconsByRepositoryIdAction, getRepositoriesAction, getVariantsAction } from './actions';

export default async function PageIcons() {
    const [repositories, variants] = await Promise.all([getRepositoriesAction(), getVariantsAction()]);
    const iconsByRepoIdPromise = Object.fromEntries(
        repositories.map((repo) => [repo.id, getIconsByRepositoryIdAction(repo.id)])
    );

    return (
        <PageContextProvider variants={variants}>
            <div className="d-drawer">
                <DrawerToggler />
                <div className="d-drawer-content">
                    <Navbar repositories={repositories} />

                    <div className="mt-6">
                        {repositories.map((repository) => (
                            <Suspense key={repository.id}>
                                <IconSection
                                    key={repository.id}
                                    repository={repository}
                                    variants={variants.filter((v) => v.repositoryId === repository.id)}
                                    iconsPromise={iconsByRepoIdPromise[repository.id]}
                                />
                            </Suspense>
                        ))}
                    </div>

                    <SearchModal repositories={repositories} />
                    <IconDetailsModal repositories={repositories} />
                </div>
                <Drawer />
            </div>
        </PageContextProvider>
    );
}
