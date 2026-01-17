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
        defaultSvgAttributes: SvgAdjustableAttributes;
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
        enableSize,
        size,
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

    const defaultSvgAttributes: SvgAdjustableAttributes = {};

    if (enableSize && size !== undefined) {
        defaultSvgAttributes.width = size;
        defaultSvgAttributes.height = size;
    }
    if (enableStrokeColor && stroke) {
        defaultSvgAttributes.stroke = stroke;
    }
    if (enableFillColor && fill) {
        defaultSvgAttributes.fill = fill;
    }
    if (enableStrokeWidth && strokeWidth !== undefined) {
        defaultSvgAttributes.strokeWidth = strokeWidth;
    }

    const updatedVariant = await updateVariant({ id, regex, defaultSvgAttributes, path });
    if (!updatedVariant) {
        return { ...prevState, errors: { global: ['Failed to update variant.'] } };
    }

    return {
        values: {
            id: updatedVariant.id,
            regex: updatedVariant.regex,
            path: updatedVariant.path,
            defaultSvgAttributes: updatedVariant.defaultSvgAttributes
        },
        errors: {}
    };
}
