import Box, { BoxHeader } from '@/components/Box';
import Row from './_components/Row';
import { loadRepositoriesAction } from './actions';

export default async function RepositoriesManagementPage() {
    const repos = await loadRepositoriesAction();

    return (
        <div>
            <h1 className="text-xl font-semibold mb-8">Repositories Management</h1>
            <Box>
                <BoxHeader>Icon Repositories</BoxHeader>
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <table className="d-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Github Id</th>
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
