import { Suspense } from 'react';
import Drawer from './_components/Drawer';
import DrawerToggler from './_components/DrawerToggler';
import IconDetailsModal from './_components/IconDetailsModal';
import IconSection from './_components/IconSection';
import Navbar from './_components/Navbar';
import { PageContextProvider } from './_components/PageContext';
import SearchModal from './_components/SearchModal';
import { getIconsByRepositoryIdAction, getRepositoriesAction } from './actions';

export default async function PageIcons() {
    const repositoriesVariants = await getRepositoriesAction();
    const iconsByRepoIdPromise = Object.fromEntries(
        repositoriesVariants.map((repo) => [repo.id, getIconsByRepositoryIdAction(repo.id)])
    );

    return (
        <PageContextProvider repositoriesVariants={repositoriesVariants}>
            <div className="d-drawer">
                <DrawerToggler />
                <div className="d-drawer-content">
                    <Suspense>
                        <Navbar repositories={repositoriesVariants} />
                    </Suspense>

                    <div className="mt-6">
                        {repositoriesVariants.map((repository) => (
                            <Suspense key={repository.id}>
                                <IconSection iconsPromise={iconsByRepoIdPromise[repository.id]} />
                            </Suspense>
                        ))}
                    </div>

                    <SearchModal repositories={repositoriesVariants} />
                    <IconDetailsModal repositories={repositoriesVariants} />
                </div>
                <Drawer />
            </div>
        </PageContextProvider>
    );
}
