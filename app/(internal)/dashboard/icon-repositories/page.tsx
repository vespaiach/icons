import Box, { BoxHeader } from '@/components/Box';
import Row from './_components/Row';
import { loadRepositoriesAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function RepositoriesManagementPage() {
    const repos = await loadRepositoriesAction();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl font-semibold">Icon Repositories</h1>
                <a href="/dashboard/icon-repositories/new" className="d-btn d-btn-primary">
                    Add New Repository
                </a>
            </div>
            <Box>
                <BoxHeader>List of Repositories</BoxHeader>
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <table className="d-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Variants</th>
                                <th>Icon Count</th>
                                <th>Last Import At</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {repos.map((repo, index) => (
                                <Row key={repo.id} repository={repo} order={index + 1} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>
        </div>
    );
}
