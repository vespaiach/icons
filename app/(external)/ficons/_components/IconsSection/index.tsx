import { repoToId } from '@/utils/common-helpers';
import SectionContent from './SectionContent';
import SectionHeader from './SectionHeader';

export default function IconSection({
    repository,
    csrfToken
}: {
    repository: RepositoryVariants;
    csrfToken: string;
}) {
    return (
        <div
            className="pb-20 px-2"
            id={repoToId(repository)}
            data-name={`${repository.owner}/${repository.name}`}
            style={{ scrollMarginTop: '72px' }}>
            <SectionHeader repository={repository} />
            <SectionContent repository={repository} csrfToken={csrfToken} />
        </div>
    );
}
