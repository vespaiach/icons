import { notFound } from 'next/navigation';
import { loadVariantByIdAction } from '../actions';
import PageContent from './_components/PageContent';

export default async function VariantEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const variantId = Number.parseInt(id, 10);

    if (Number.isNaN(variantId)) {
        notFound();
    }

    const variant = await loadVariantByIdAction(variantId);

    return (
        <div>
            <h1 className="text-xl font-semibold mb-8">
                Edit Variant: <span className="text-primary">{variant.name}</span>
            </h1>
            <PageContent variant={variant} />
        </div>
    );
}
