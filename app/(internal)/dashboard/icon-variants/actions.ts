'use server';

import { notFound } from 'next/navigation';
import {
    getVariantById,
    getVariantRepositoryById,
    getVariantsWithRepository,
    updateVariant
} from '@/db/variants';
import { parseVariantUpdateForm } from './validation';

export async function loadVariantsAction(): Promise<VariantWithRepository[]> {
    return await getVariantsWithRepository();
}

export async function loadVariantByIdAction(id: number) {
    const variant = await getVariantRepositoryById(id);
    if (!variant) {
        notFound();
    }
    return variant;
}

interface UpdateVariantParams {
    errors: Record<string, string[]>;
    values: {
        id: number;
        regex: string;
        path: string;
        attributesToAdjust: string[];
    };
}

export async function updateVariantAction(prevState: UpdateVariantParams, formData: FormData) {
    const { success, payload, errors } = await parseVariantUpdateForm(formData);
    if (!success) {
        return { ...prevState, errors };
    }

    const { id, regex, path, size, strokeColor, fillColor, strokeWidth } = payload;

    const variant = await getVariantById(id);
    if (!variant) {
        notFound();
    }

    const attributesToAdjust = (
        [
            ['size', size],
            ['strokeColor', strokeColor],
            ['fillColor', fillColor],
            ['strokeWidth', strokeWidth]
        ] as [string, boolean | undefined][]
    )
        .filter(([_, value]) => value !== undefined)
        .map(([key]) => key);

    const updatedVariant = await updateVariant({ id, regex, attributesToAdjust, path });
    if (!updatedVariant) {
        return { ...prevState, errors: { global: ['Failed to update variant.'] } };
    }

    return {
        values: {
            id: updatedVariant.id,
            regex: updatedVariant.regex,
            path: updatedVariant.path,
            attributesToAdjust: updatedVariant.attributesToAdjust
        },
        errors: {}
    };
}
