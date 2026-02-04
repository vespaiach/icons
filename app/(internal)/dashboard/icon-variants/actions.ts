'use server';

import { notFound, redirect } from 'next/navigation';
import { getRepositoriesWithIconCount } from '@/db/repositories';
import {
    createVariant,
    getVariantById,
    getVariantRepositoryById,
    getVariantsWithRepository,
    updateVariant
} from '@/db/variants';
import { parseVariantCreateForm, parseVariantUpdateForm } from './validation';

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
    } = payload;

    const variant = await getVariantById(id);
    if (!variant) {
        notFound();
    }

    const updatedVariant = await updateVariant({ id, regex, path });
    if (!updatedVariant) {
        return { ...prevState, errors: { global: ['Failed to update variant.'] } };
    }

    return {
        values: {
            id: updatedVariant.id,
            regex: updatedVariant.regex,
            path: updatedVariant.path,
        },
        errors: {}
    };
}

export async function loadRepositoriesAction(): Promise<RepositoryWithIconCount[]> {
    return await getRepositoriesWithIconCount();
}

interface CreateVariantParams {
    errors: Record<string, string[]>;
    values: {
        repositoryId: number | null;
        name: string;
        regex: string;
        path: string;
        stroke: string | null;
        strokeOn: 'both' | 'parent' | 'children';
        fill: string | null;
        fillOn: 'both' | 'parent' | 'children';
        strokeWidth: string | null;
        strokeWidthOn: 'both' | 'parent' | 'children';
    };
}

export async function createVariantAction(prevState: CreateVariantParams, formData: FormData) {
    const { success, payload, errors } = await parseVariantCreateForm(formData);
    if (!success) {
        return { ...prevState, errors };
    }

    const {
        repositoryId,
        name,
        regex,
        path,
        enableStrokeColor,
        stroke,
        strokeOn,
        enableFillColor,
        fill,
        fillOn,
        enableStrokeWidth,
        strokeWidth,
        strokeWidthOn
    } = payload;

    const newVariant = await createVariant({
        repositoryId,
        name,
        regex,
        path,
        stroke: enableStrokeColor && stroke ? stroke : null,
        strokeOn: strokeOn ?? 'parent',
        fill: enableFillColor && fill ? fill : null,
        fillOn: fillOn ?? 'parent',
        strokeWidth: enableStrokeWidth && strokeWidth !== undefined ? String(strokeWidth) : null,
        strokeWidthOn: strokeWidthOn ?? 'parent'
    });

    if (!newVariant) {
        return { ...prevState, errors: { global: ['Failed to create variant.'] } };
    }

    redirect('/dashboard/icon-variants');
}
