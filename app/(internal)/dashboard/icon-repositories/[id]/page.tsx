import { notFound } from 'next/navigation';
import Box, { BoxHeader } from '@/components/Box';
import RepositoryForm from '../_components/RepositoryForm';
import { loadRepositoryAction, updateRepositoryAction } from '../actions';

interface EditRepositoryPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditRepositoryPage({ params }: EditRepositoryPageProps) {
    const { id } = await params;
    const repositoryId = parseInt(id, 10);

    if (Number.isNaN(repositoryId)) {
        notFound();
    }

    const repository = await loadRepositoryAction(repositoryId);

    if (!repository) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-xl font-semibold mb-8">Edit Icon Repository</h1>
            <Box>
                <BoxHeader>Repository Details</BoxHeader>
                <div className="p-6">
                    <RepositoryForm
                        mode="edit"
                        formAction={updateRepositoryAction}
                        initialData={{
                            id: repository.id,
                            owner: repository.owner,
                            name: repository.name,
                            ref: repository.ref
                        }}
                    />
                </div>
            </Box>
        </div>
    );
}
