import * as v from 'valibot';

type ValidationResult<P> =
    | { success: true; payload: P; errors: null }
    | { success: false; payload: null; errors: Record<string, string[]> };

function defaultValuesExtractor(form: FormData): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const key of form.keys()) {
        if (key.endsWith('[]')) {
            const values = form.getAll(key).map((v) => (typeof v === 'string' ? v : null));
            data[key.slice(0, -2)] = values;
            continue;
        }
        const value = form.get(key);
        data[key] = value;
    }
    return data;
}

export const buildFormParser = <TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
    schema: TSchema
) => {
    return async (
        form: FormData,
        extractor = defaultValuesExtractor
    ): Promise<ValidationResult<v.InferOutput<TSchema>>> => {
        const result = v.safeParse(schema, extractor(form));

        if (result.success) {
            return Promise.resolve({
                success: true,
                payload: result.output as v.InferOutput<TSchema>,
                errors: null
            });
        } else {
            const errorMap: Record<string, string[]> = {};
            for (const issue of result.issues) {
                const fieldName = issue.path?.[0]?.key as string;
                if (fieldName && issue.message) {
                    // Remove the "-> at..." suffix if present
                    const message = issue.message.split('->')[0].trim();
                    errorMap[fieldName] = errorMap[fieldName] || [];
                    errorMap[fieldName].push(message);
                }
            }
            return Promise.resolve({
                success: false,
                payload: null,
                errors: errorMap
            });
        }
    };
};
