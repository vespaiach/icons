import * as v from 'valibot';
import { buildFormParser } from '@/utils/validation.helpers';

export const variantUpdateFormSchema = v.object({
    id: v.pipe(v.string(), v.transform(Number), v.number(), v.integer()),
    regex: v.pipe(v.string(), v.minLength(1, 'Regex is required')),
    path: v.pipe(v.string(), v.minLength(1, 'Path is required')),
    enableSize: v.optional(
        v.pipe(
            v.string(),
            v.transform((val) => val === 'on')
        )
    ),
    size: v.optional(
        v.pipe(
            v.string(),
            v.transform((val) => (val ? Number(val) : undefined))
        )
    ),
    enableStrokeColor: v.optional(
        v.pipe(
            v.string(),
            v.transform((val) => val === 'on')
        )
    ),
    strokeColor: v.optional(v.string()),
    enableFillColor: v.optional(
        v.pipe(
            v.string(),
            v.transform((val) => val === 'on')
        )
    ),
    fillColor: v.optional(v.string()),
    enableStrokeWidth: v.optional(
        v.pipe(
            v.string(),
            v.transform((val) => val === 'on')
        )
    ),
    strokeWidth: v.optional(
        v.pipe(
            v.string(),
            v.transform((val) => (val ? Number(val) : undefined))
        )
    )
});

export const parseVariantUpdateForm = buildFormParser(variantUpdateFormSchema);
