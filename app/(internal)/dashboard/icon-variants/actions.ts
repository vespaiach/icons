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
        stroke?: string;
        fill?: string;
        strokeWidth?: string;
        width?: string;
        height?: string;
    };
}

export async function updateVariantAction(prevState: UpdateVariantParams, formData: FormData) {
    const { success, payload, errors } = await parseVariantUpdateForm(formData);
    if (!success) {
        return { ...prevState, errors };
    }

    const { id, regex, stroke, fill, strokeWidth, width, height, path, enableStroke, enableFill, enableStrokeWidth, enableWidth, enableHeight } = payload;

    const variant = await getVariantById(id);
    if (!variant) {
        notFound();
    }

    const svgRootAttributes = {
        ...(enableStroke && stroke !== undefined && { stroke }),
        ...(enableFill && fill !== undefined && { fill }),
        ...(enableStrokeWidth && strokeWidth !== undefined && { strokeWidth }),
        ...(enableWidth && width !== undefined && { width }),
        ...(enableHeight && height !== undefined && { height })
    };

    const updatedVariant = await updateVariant({ id, regex, svgRootAttributes, path });
    if (!updatedVariant) {
        return { ...prevState, errors: { global: ['Failed to update variant.'] } };
    }

    return {
        values: {
            id: updatedVariant.id,
            regex: updatedVariant.regex,
            path: updatedVariant.path,
            stroke: updatedVariant.svgRootAttributes.stroke,
            fill: updatedVariant.svgRootAttributes.fill,
            strokeWidth: updatedVariant.svgRootAttributes.strokeWidth,
            width: updatedVariant.svgRootAttributes.width,
            height: updatedVariant.svgRootAttributes.height
        },
        errors: {}
    };
}
