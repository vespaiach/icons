import IconsContainer from './_components/IconsContainer';
import Navbar from './_components/Navbar';
import SearchModal from './_components/SearchModal';
import { getAllRepositoriesAction } from './actions';

export default async function PageIcons() {
    const repositories = await getAllRepositoriesAction();

    return (
        <>
            <Navbar />
            <SearchModal repositories={repositories} />
            <IconsContainer repositories={repositories} />
        </>
    );
}
