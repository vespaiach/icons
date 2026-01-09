import * as v from 'valibot';
import { buildFormParser } from '@/utils/validation.helpers';

export const variantUpdateFormSchema = v.object({
    id: v.pipe(v.string(), v.transform(Number), v.number(), v.integer()),
    regex: v.pipe(v.string(), v.minLength(1, 'Regex is required')),
    path: v.pipe(v.string(), v.minLength(1, 'Path is required')),
    enableStroke: v.optional(v.literal('on')),
    stroke: v.optional(v.string()),
    enableFill: v.optional(v.literal('on')),
    fill: v.optional(v.string()),
    enableStrokeWidth: v.optional(v.literal('on')),
    strokeWidth: v.optional(v.string()),
    enableWidth: v.optional(v.literal('on')),
    width: v.optional(v.string()),
    enableHeight: v.optional(v.literal('on')),
    height: v.optional(v.string())
});

export const parseVariantUpdateForm = buildFormParser(variantUpdateFormSchema);
