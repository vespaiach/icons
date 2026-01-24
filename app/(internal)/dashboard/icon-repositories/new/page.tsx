import Box, { BoxHeader } from '@/components/Box';
import RepositoryForm from '../_components/RepositoryForm';
import { createRepositoryAction } from '../actions';

export default async function NewRepositoryPage() {
    return (
        <div>
            <h1 className="text-xl font-semibold mb-8">Add New Icon Repository</h1>
            <Box>
                <BoxHeader>Repository Details</BoxHeader>
                <div className="p-6">
                    <RepositoryForm mode="create" formAction={createRepositoryAction} />
                </div>
            </Box>
        </div>
    );
}
