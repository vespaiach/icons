import Box, { BoxHeader } from '@/components/Box';
import { createVariantAction, loadRepositoriesAction } from '../actions';
import VariantCreateForm from './_components/VariantCreateForm';

export default async function NewVariantPage() {
    const repositories = await loadRepositoriesAction();

    return (
        <div>
            <h1 className="text-xl font-semibold mb-8">Add New Variant</h1>
            <Box>
                <BoxHeader>Variant Details</BoxHeader>
                <div className="p-6">
                    <VariantCreateForm repositories={repositories} formAction={createVariantAction} />
                </div>
            </Box>
        </div>
    );
}
