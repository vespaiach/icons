import Drawer from './_components/Drawer';
import DrawerToggler from './_components/DrawerToggler';
import IconsContainer from './_components/IconsContainer';
import Navbar from './_components/Navbar';
import { PageContextProvider } from './_components/PageContext';
import SearchModal from './_components/SearchModal';
import { getRepositoriesAction, getVariantsAction } from './actions';

export default async function PageIcons() {
    const variantsMapPromise = getVariantsAction();
    const repositoriesMap = await getRepositoriesAction();

    return (
        <PageContextProvider repositoriesMap={repositoriesMap}>
            <div className="d-drawer">
                <DrawerToggler />
                <div className="d-drawer-content">
                    <Navbar />
                    <IconsContainer variantsMapPromise={variantsMapPromise} />
                    <SearchModal />
                </div>
                <Drawer />
            </div>
        </PageContextProvider>
    );
}
