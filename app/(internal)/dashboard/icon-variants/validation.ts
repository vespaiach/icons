import * as v from 'valibot';
import { buildFormParser } from '@/utils/validation.helpers';

export const variantUpdateFormSchema = v.object({
    id: v.pipe(v.string(), v.transform(Number), v.number(), v.integer()),
    regex: v.pipe(v.string(), v.minLength(1, 'Regex is required')),
    path: v.pipe(v.string(), v.minLength(1, 'Path is required')),
    size: v.nullish(
        v.pipe(v.string(), v.transform((val) => val === 'on'))
    ),
    strokeColor: v.optional(
        v.pipe(v.string(), v.transform((val) => val === 'on'))
    ),
    fillColor: v.optional(
        v.pipe(v.string(), v.transform((val) => val === 'on'))
    ),
    strokeWidth: v.optional(
        v.pipe(v.string(), v.transform((val) => val === 'on'))
    )
});

export const parseVariantUpdateForm = buildFormParser(variantUpdateFormSchema);
