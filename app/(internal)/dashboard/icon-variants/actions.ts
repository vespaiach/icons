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
        stroke: string | null;
        fill: string | null;
        strokeWidth: string | null;
    };
}

export async function updateVariantAction(prevState: UpdateVariantParams, formData: FormData) {
    const { success, payload, errors } = await parseVariantUpdateForm(formData);
    if (!success) {
        return { ...prevState, errors };
    }

    const {
        id,
        regex,
        path,
        enableStrokeColor,
        stroke,
        enableFillColor,
        fill,
        enableStrokeWidth,
        strokeWidth
    } = payload;

    const variant = await getVariantById(id);
    if (!variant) {
        notFound();
    }

    const updatedVariant = await updateVariant({
        id,
        regex,
        path,
        stroke: enableStrokeColor && stroke ? stroke : null,
        fill: enableFillColor && fill ? fill : null,
        strokeWidth: enableStrokeWidth && strokeWidth !== undefined ? String(strokeWidth) : null
    });
    if (!updatedVariant) {
        return { ...prevState, errors: { global: ['Failed to update variant.'] } };
    }

    return {
        values: {
            id: updatedVariant.id,
            regex: updatedVariant.regex,
            path: updatedVariant.path,
            stroke: updatedVariant.stroke,
            fill: updatedVariant.fill,
            strokeWidth: updatedVariant.strokeWidth
        },
        errors: {}
    };
}
