import { randomBytes } from 'node:crypto';
import { Provider } from 'jotai';
import { cookies } from 'next/headers';
import { dropCsrfTokenCookie } from '@/utils/session';
import AboutModal from './_components/AboutModal';
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

    // Generate CSRF token
    const cookieStore = await cookies();
    let csrfToken = cookieStore.get('csrf-token')?.value;

    if (!csrfToken) {
        csrfToken = randomBytes(32).toString('base64url');
        await dropCsrfTokenCookie(csrfToken);
    }

    return (
        <div className="d-drawer">
            <Provider>
                <PageContextProvider repositories={repositoriesVariants}>
                    <DrawerToggler />
                    <div className="d-drawer-content">
                        <Navbar repositories={repositoriesVariants} />

                        <div className="mt-6">
                            {repositoriesVariants.map((repository) => (
                                <IconSection
                                    key={repository.id}
                                    repository={repository}
                                    csrfToken={csrfToken}
                                />
                            ))}
                        </div>

                        <SearchModal repositories={repositoriesVariants} />
                        <AboutModal />
                        <IconModal repositories={repositoriesVariants} />
                    </div>
                    <Drawer />
                </PageContextProvider>
            </Provider>
        </div>
    );
}
