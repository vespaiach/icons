import { getIconsByRepositoryIdAction } from '../../actions';
import IconsGrid from './IconsGrid';

export default function SectionContent({ repository }: { repository: RepositoryVariants }) {
    const iconsPromise = getIconsByRepositoryIdAction(repository.id);
    const variants = repository.variants;

    return <IconsGrid iconsPromise={iconsPromise} variants={variants} />;
}
