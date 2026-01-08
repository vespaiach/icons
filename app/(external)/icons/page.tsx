import { get } from 'lodash';
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
            <IconsContainer
                repositoriesMapPromise={repositoriesMapPromise}
                directoriesMapPromise={directoriesMapPromise}
            />
            <SearchModal repositoriesMapPromise={repositoriesMapPromise} />
        </>
    );
}
