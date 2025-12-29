import { retrieveUserFromSession } from '@/utils/session';
import { loadRepositories } from './actions';
import RepoForm from './RepoForm';

export default async function RepositoriesManagementPage() {
    await retrieveUserFromSession();
    const repos = await loadRepositories();

    return (
        <div>
            <h1>Repositories Management Page</h1>
            <ul className="space-y-4">
                {repos.map((repo) => (
                    <li key={repo.id}>
                        <RepoForm initialState={repo} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
