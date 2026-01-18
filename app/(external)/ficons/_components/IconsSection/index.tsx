import { repoToId } from '@/utils/common-helpers';
import SectionContent from './SectionContent';
import SectionHeader from './SectionHeader';

export default function IconSection({ repository }: { repository: RepositoryVariants }) {
    return (
        <div
            className="pb-15 px-2"
            id={repoToId(repository)}
            data-name={`${repository.owner}/${repository.name}`}
            style={{ scrollMarginTop: '72px' }}>
            <SectionHeader repository={repository} />
            <SectionContent repository={repository} />
        </div>
    );
}
