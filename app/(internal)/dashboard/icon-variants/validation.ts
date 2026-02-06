import * as v from 'valibot';
import { buildFormParser } from '@/utils/validation.helpers';

export const variantUpdateFormSchema = v.object({
    id: v.pipe(v.string(), v.transform(Number), v.number(), v.integer()),
    regex: v.pipe(v.string(), v.minLength(1, 'Regex is required')),
    path: v.pipe(v.string(), v.minLength(1, 'Path is required')),
    colorOn: v.optional(v.pipe(v.string(), v.picklist(['fill', 'stroke']))),
    noneColorOn: v.optional(v.pipe(v.string(), v.picklist(['fill', 'stroke']))),
    replacements: v.optional(
        v.pipe(
            v.string(),
            v.transform((val) => {
                if (!val || val.trim() === '') return null;
                return val
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
            })
        )
    )
});

export const parseVariantUpdateForm = buildFormParser(variantUpdateFormSchema);

export const variantCreateFormSchema = v.object({
    repositoryId: v.pipe(v.string(), v.transform(Number), v.number(), v.integer()),
    name: v.pipe(v.string(), v.minLength(1, 'Variant name is required')),
    regex: v.pipe(v.string(), v.minLength(1, 'Regex is required')),
    path: v.pipe(v.string(), v.minLength(1, 'Path is required')),
    colorOn: v.optional(v.pipe(v.string(), v.picklist(['fill', 'stroke']))),
    noneColorOn: v.optional(v.pipe(v.string(), v.picklist(['fill', 'stroke']))),
    replacements: v.optional(
        v.pipe(
            v.string(),
            v.transform((val) => {
                if (!val || val.trim() === '') return null;
                return val
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
            })
        )
    )
});

export const parseVariantCreateForm = buildFormParser(variantCreateFormSchema);
