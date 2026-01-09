import * as v from 'valibot';
import { buildFormParser } from '@/utils/validation.helpers';

const RepositoryValidationSchema = v.object({
    repositoryId: v.pipe(
        v.string(),
        v.minLength(1),
        v.transform((val) => parseInt(val, 10))
    )
});

export const parseRepositoryForm = buildFormParser(RepositoryValidationSchema);
