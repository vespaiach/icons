'use client';

import { FolderTree, Regex, Tag } from 'lucide-react';
import { useActionState, useState } from 'react';
import FillColorAdjuster from '@/components/FillColorAdjuster';
import StrokeColorAdjuster from '@/components/StrokeColorAdjuster';
import StrokeWidthAdjuster from '@/components/StrokeWidthAdjuster';
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
        stroke: null,
        fill: null,
        strokeWidth: null
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

    const [enableStrokeColor, setEnableStrokeColor] = useState(false);
    const [strokeColor, setStrokeColor] = useState('#000000');

    const [enableFillColor, setEnableFillColor] = useState(false);
    const [fillColor, setFillColor] = useState('#000000');

    const [enableStrokeWidth, setEnableStrokeWidth] = useState(false);
    const [strokeWidth, setStrokeWidth] = useState(2);

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

            <fieldset className="d-fieldset flex-1">
                <legend className="d-fieldset-legend">Default SVG Attributes</legend>
                <div className="space-y-4 mt-4">
                    <div className="flex items-start gap-4">
                        <label className="flex items-center gap-2 w-48 pt-2">
                            <input
                                type="checkbox"
                                className="d-checkbox d-checkbox-md"
                                checked={enableStrokeColor}
                                onChange={(e) => setEnableStrokeColor(e.target.checked)}
                                name="enableStrokeColor"
                            />
                            <span>Stroke color</span>
                        </label>
                        <div className="flex-1">
                            {enableStrokeColor && (
                                <>
                                    <input type="hidden" name="stroke" value={strokeColor} />
                                    <StrokeColorAdjuster
                                        strokeColor={strokeColor}
                                        onStrokeColorChange={setStrokeColor}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <label className="flex items-center gap-2 w-48 pt-2">
                            <input
                                type="checkbox"
                                className="d-checkbox d-checkbox-md"
                                checked={enableFillColor}
                                onChange={(e) => setEnableFillColor(e.target.checked)}
                                name="enableFillColor"
                            />
                            <span>Fill color</span>
                        </label>
                        <div className="flex-1">
                            {enableFillColor && (
                                <>
                                    <input type="hidden" name="fill" value={fillColor} />
                                    <FillColorAdjuster
                                        fillColor={fillColor}
                                        onFillColorChange={setFillColor}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <label className="flex items-center gap-2 w-48 pt-2">
                            <input
                                type="checkbox"
                                className="d-checkbox d-checkbox-md"
                                checked={enableStrokeWidth}
                                onChange={(e) => setEnableStrokeWidth(e.target.checked)}
                                name="enableStrokeWidth"
                            />
                            <span>Stroke width</span>
                        </label>
                        <div className="flex-1">
                            {enableStrokeWidth && (
                                <>
                                    <input type="hidden" name="strokeWidth" value={strokeWidth} />
                                    <StrokeWidthAdjuster
                                        strokeWidth={strokeWidth}
                                        onStrokeWidthChange={setStrokeWidth}
                                    />
                                </>
                            )}
                        </div>
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
