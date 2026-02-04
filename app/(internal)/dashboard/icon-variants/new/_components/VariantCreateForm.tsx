'use client';

import { FolderTree, Regex, Tag } from 'lucide-react';
import { useActionState, useState } from 'react';
import { assertArray } from '@/utils/assert-helpers';
import { cx } from '@/utils/common-helpers';
import type { createVariantAction } from '../../actions';

type CreateVariantReturn = Awaited<ReturnType<typeof createVariantAction>>;

const initialState: CreateVariantReturn = {
    errors: {},
    values: {
        repositoryId: null,
        name: '',
        regex: '',
        path: '',
        colorOn: null,
        replacements: null
    }
};

export default function VariantCreateForm({
    repositories,
    formAction
}: {
    repositories: RepositoryWithIconCount[];
    formAction: (prevState: CreateVariantReturn, formData: FormData) => Promise<CreateVariantReturn>;
}) {
    const [formState, action, isPending] = useActionState(formAction, initialState);

    const [colorOn, setColorOn] = useState<'fill' | 'stroke' | ''>('');
    const [replacements, setReplacements] = useState<string>('');

    return (
        <form action={action} className="space-y-6">
            {assertArray(formState.errors.global) && (
                <div className="d-alert d-alert-error">
                    <ul className="list-disc list-inside">
                        {formState.errors.global.map((m) => (
                            <li key={m}>{m}</li>
                        ))}
                    </ul>
                </div>
            )}

            <fieldset className="d-fieldset">
                <legend className="d-fieldset-legend">Repository</legend>
                <select
                    name="repositoryId"
                    className={cx('d-select w-full', formState.errors.repositoryId && 'd-select-error')}
                    required
                    defaultValue="">
                    <option value="" disabled>
                        Select a repository
                    </option>
                    {repositories.map((repo) => (
                        <option key={repo.id} value={repo.id}>
                            {repo.owner}/{repo.name}
                        </option>
                    ))}
                </select>
                {assertArray(formState.errors.repositoryId) &&
                    formState.errors.repositoryId.map((m) => (
                        <p className="d-label text-error" key={m}>
                            {m}
                        </p>
                    ))}
            </fieldset>

            <fieldset className="d-fieldset">
                <legend className="d-fieldset-legend">Variant Name</legend>
                <label className={cx('d-input w-full d-validator', formState.errors.name && 'd-input-error')}>
                    <Tag className="text-info-content opacity-50 w-4" />
                    <input
                        required
                        type="text"
                        name="name"
                        className="d-grow"
                        placeholder="e.g., outline, solid, duotone"
                        defaultValue={formState.values.name}
                    />
                </label>
                {assertArray(formState.errors.name) &&
                    formState.errors.name.map((m) => (
                        <p className="d-label text-error" key={m}>
                            {m}
                        </p>
                    ))}
            </fieldset>

            <div className="flex gap-8">
                <fieldset className="d-fieldset flex-1">
                    <legend className="d-fieldset-legend">Path</legend>
                    <label
                        className={cx(
                            'd-input w-full d-validator',
                            formState.errors.path && 'd-input-error'
                        )}>
                        <FolderTree className="text-info-content opacity-50 w-4" />
                        <input
                            required
                            type="text"
                            name="path"
                            className="d-grow"
                            placeholder="e.g., /icons"
                            defaultValue={formState.values.path}
                        />
                    </label>
                    {assertArray(formState.errors.path) &&
                        formState.errors.path.map((m) => (
                            <p className="d-label text-error" key={m}>
                                {m}
                            </p>
                        ))}
                </fieldset>

                <fieldset className="d-fieldset flex-1">
                    <legend className="d-fieldset-legend">Regex Pattern</legend>
                    <label
                        className={cx(
                            'd-input w-full d-validator',
                            formState.errors.regex && 'd-input-error'
                        )}>
                        <Regex className="text-info-content opacity-50 w-4" />
                        <input
                            required
                            type="text"
                            name="regex"
                            className="d-grow"
                            placeholder="e.g., \\.svg$"
                            defaultValue={formState.values.regex}
                        />
                    </label>
                    {assertArray(formState.errors.regex) &&
                        formState.errors.regex.map((m) => (
                            <p className="d-label text-error" key={m}>
                                {m}
                            </p>
                        ))}
                </fieldset>
            </div>

            <fieldset className="d-fieldset">
                <legend className="d-fieldset-legend">Color Replacement Configuration</legend>
                <div className="space-y-4 mt-4">
                    <div>
                        <label htmlFor="colorOn" className="d-label">
                            <span className="d-label-text">Apply color to:</span>
                        </label>
                        <select
                            id="colorOn"
                            name="colorOn"
                            className="d-select d-select-bordered w-full"
                            value={colorOn}
                            onChange={(e) => setColorOn(e.target.value as 'fill' | 'stroke' | '')}>
                            <option value="">None</option>
                            <option value="fill">Fill</option>
                            <option value="stroke">Stroke</option>
                        </select>
                        <p className="d-label-text-alt mt-2 text-base-content/70">
                            Specifies which SVG attribute should be replaced with user-selected colors
                        </p>
                    </div>

                    <div>
                        <label htmlFor="replacements" className="d-label">
                            <span className="d-label-text">Replacements (comma-separated):</span>
                        </label>
                        <textarea
                            id="replacements"
                            name="replacements"
                            className="d-textarea d-textarea-bordered w-full"
                            rows={3}
                            placeholder="e.g., currentColor, #000000, #fff"
                            value={replacements}
                            onChange={(e) => setReplacements(e.target.value)}
                        />
                        <p className="d-label-text-alt mt-2 text-base-content/70">
                            List of color values to be replaced. Each value will be replaced with the
                            user-selected color.
                        </p>
                    </div>
                </div>
            </fieldset>
            <div className="flex gap-4 justify-end">
                {!isPending && (
                    <button type="submit" className="d-btn d-btn-primary" disabled={isPending}>
                        Create Variant
                    </button>
                )}
                {isPending && (
                    <div className="d-btn d-btn-disabled">
                        <span className="d-loading d-loading-spinner d-loading-sm"></span> Creating...
                    </div>
                )}
            </div>
        </form>
    );
}
