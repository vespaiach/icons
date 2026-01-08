import { Suspense } from 'react';
import IconsContainer from './_components/IconsContainer';
import Navbar from './_components/Navbar';
import SearchModal from './_components/SearchModal';
import { getDirectoriesAction, getRepositoriesAction } from './actions';

export default async function PageIcons() {
    const repositoriesMapPromise = getRepositoriesAction();
    const directoriesMapPromise = getDirectoriesAction();

    return (
        <>
            <Navbar />
            <Suspense fallback={<div>Loading IconsContainer...</div>}>
                <IconsContainer
                    repositoriesMapPromise={repositoriesMapPromise}
                    directoriesMapPromise={directoriesMapPromise}
                />
            </Suspense>
            <Suspense fallback={<div>Loading IconsContainer...</div>}>
                <SearchModal repositoriesMapPromise={repositoriesMapPromise} />
            </Suspense>
        </>
    );
}
