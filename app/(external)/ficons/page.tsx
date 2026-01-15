import Drawer from './_components/Drawer';
import DrawerToggler from './_components/DrawerToggler';
import IconDetailsModal from './_components/IconDetailsModal';
import IconSection from './_components/IconsSection';
import Navbar from './_components/Navbar';
import { PageContextProvider } from './_components/PageContext';
import SearchModal from './_components/SearchModal';
import { getRepositoriesAction } from './actions';

export default async function PageIcons() {
    const repositoriesVariants = await getRepositoriesAction();

    return (
        <div className="d-drawer">
            <PageContextProvider repositoriesVariants={repositoriesVariants}>
                <DrawerToggler />
                <div className="d-drawer-content">
                    <Navbar repositories={repositoriesVariants} />

                    <div className="mt-6">
                        {repositoriesVariants.map((repository) => (
                            <IconSection key={repository.id} repository={repository} />
                        ))}
                    </div>

                    <SearchModal repositories={repositoriesVariants} />
                    <IconDetailsModal repositories={repositoriesVariants} />
                </div>
                <Drawer />
            </PageContextProvider>
        </div>
    );
}
