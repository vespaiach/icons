import { Provider } from 'jotai';
import Footer from '@/components/Footer';
import Drawer from './_components/Drawer';
import DrawerToggler from './_components/DrawerToggler';
import IconModal from './_components/IconModal';
import IconSection from './_components/IconsSection';
import MenuItem from './_components/MenuItem';
import Navbar from './_components/Navbar';
import { PageContextProvider } from './_components/PageContext';
import RepositoryModal from './_components/RepositoryModal';
import SearchModal from './_components/SearchModal';
import { getRepositoriesAction } from './actions';

export default async function PageIcons() {
    const repositoriesVariants = await getRepositoriesAction();

    return (
        <div className="d-drawer">
            <Provider>
                <PageContextProvider repositories={repositoriesVariants}>
                    <DrawerToggler />
                    <div className="d-drawer-content">
                        <div className="d-drawer d-drawer-end">
                            <input id="right_drawer_toggler" type="checkbox" className="d-drawer-toggle" />
                            <div className="d-drawer-content">
                                <Navbar repositories={repositoriesVariants} />

                                <div className="mt-6 space-y-20">
                                    {repositoriesVariants.map((repository) => (
                                        <IconSection key={repository.id} repository={repository} />
                                    ))}
                                </div>

                                <SearchModal repositories={repositoriesVariants} />
                                <IconModal repositories={repositoriesVariants} />
                                <RepositoryModal />
                                <Footer />
                            </div>
                            <div className="d-drawer-side">
                                <label
                                    htmlFor="right_drawer_toggler"
                                    aria-label="close sidebar"
                                    className="d-drawer-overlay"
                                />
                                <ul className="d-menu bg-base-200 min-h-full w-80 p-4">
                                    <h4 className="font-semibold mb-4 text-md">Collections</h4>
                                    {repositoriesVariants.map((repo) => {
                                        return <MenuItem key={repo.id} repo={repo} />;
                                    })}
                                    <li className="mt-4 pt-4 border-t border-t-base-300 mb-6">
                                        <a href="/about" className="font-semibold">
                                            About
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <Drawer repositories={repositoriesVariants} />
                </PageContextProvider>
            </Provider>
        </div>
    );
}
