import * as v from 'valibot';
import { buildFormParser } from '@/utils/validation.helpers';

const RepositoryValidationSchema = v.object({
    repositoryId: v.pipe(
        v.string(),
        v.minLength(1),
        v.transform((val) => parseInt(val, 10))
    )
});

const CreateRepositorySchema = v.object({
    owner: v.pipe(v.string(), v.minLength(1, 'Owner is required')),
    name: v.pipe(v.string(), v.minLength(1, 'Repository name is required')),
    ref: v.pipe(v.string(), v.minLength(1, 'Branch/ref is required'))
});

const UpdateRepositorySchema = v.object({
    id: v.pipe(
        v.string(),
        v.minLength(1),
        v.transform((val) => parseInt(val, 10))
    ),
    owner: v.pipe(v.string(), v.minLength(1, 'Owner is required')),
    name: v.pipe(v.string(), v.minLength(1, 'Repository name is required')),
    ref: v.pipe(v.string(), v.minLength(1, 'Branch/ref is required'))
});

export const parseRepositoryForm = buildFormParser(RepositoryValidationSchema);
export const parseCreateRepositoryForm = buildFormParser(CreateRepositorySchema);
export const parseUpdateRepositoryForm = buildFormParser(UpdateRepositorySchema);
