import { Provider } from 'jotai';
import Footer from '@/components/Footer';
import Drawer from './_components/Drawer';
import DrawerToggler from './_components/DrawerToggler';
import IconModal from './_components/IconModal';
import IconSection from './_components/IconsSection';
import Navbar from './_components/Navbar';
import { PageContextProvider } from './_components/PageContext';
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
                        <Navbar repositories={repositoriesVariants} />

                        <div className="mt-6">
                            {repositoriesVariants.map((repository) => (
                                <IconSection key={repository.id} repository={repository} />
                            ))}
                        </div>

                        <SearchModal repositories={repositoriesVariants} />
                        <IconModal repositories={repositoriesVariants} />
                        <Footer />
                    </div>
                    <Drawer />
                </PageContextProvider>
            </Provider>
        </div>
    );
}
