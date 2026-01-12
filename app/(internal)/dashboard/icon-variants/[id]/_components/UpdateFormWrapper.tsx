'use client';

import { Regex } from 'lucide-react';
import { assertArray } from '@/utils/assert-helpers';
import { cx } from '@/utils/common-helpers';
import type { updateVariantAction } from '../../actions';

type UpdateVariantReturn = Awaited<ReturnType<typeof updateVariantAction>>;

export default function UpdateForm({
    formState,
    isPending,
    formAction
}: {
    formState: UpdateVariantReturn;
    isPending: boolean;
    formAction: (formData: FormData) => void;
}) {
    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="id" value={formState.values.id} />

            {assertArray(formState.errors.global) && (
                <div className="d-alert d-alert-error">
                    <ul className="list-disc list-inside">
                        {formState.errors.global.map((m) => (
                            <li key={m}>{m}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex gap-8">
                <fieldset className="d-fieldset flex-1">
                    <legend className="d-fieldset-legend">Path</legend>
                    <label
                        className={cx(
                            'd-input w-full d-validator',
                            formState.errors.path && 'd-input-error'
                        )}>
                        <Regex className="text-info-content opacity-50 w-4" />
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
                <legend className="d-fieldset-legend">Regex Pattern</legend>
                <ul className="list-disc pl-6 mt-4 space-y-3">
                    <li className="flex items-center gap-1">
                        <input
                            type="checkbox"
                            className="d-checkbox d-checkbox-md"
                            defaultChecked={formState.values.attributesToAdjust.includes('fillColor')}
                            name="fillColor"
                            id="fill-color"
                        />
                        <label htmlFor="fill-color">Fill color</label>
                    </li>
                    <li className="flex items-center gap-1">
                        <input
                            type="checkbox"
                            className="d-checkbox d-checkbox-md"
                            defaultChecked={formState.values.attributesToAdjust.includes('strokeColor')}
                            name="strokeColor"
                            id="stroke-color"
                        />
                        <label htmlFor="stroke-color">Stroke color</label>
                    </li>
                    <li className="flex items-center gap-1">
                        <input
                            type="checkbox"
                            className="d-checkbox d-checkbox-md"
                            defaultChecked={formState.values.attributesToAdjust.includes('strokeWidth')}
                            name="strokeWidth"
                            id="stroke-width"
                        />
                        <label htmlFor="stroke-width">Stroke width</label>
                    </li>
                    <li className="flex items-center gap-1">
                        <input
                            type="checkbox"
                            className="d-checkbox d-checkbox-md"
                            defaultChecked={formState.values.attributesToAdjust.includes('size')}
                            name="size"
                            id="size"
                        />
                        <label htmlFor="size">Size (width & height)</label>
                    </li>
                </ul>
            </fieldset>
            <div className="flex gap-4 justify-end">
                {!isPending && (
                    <button type="submit" className="d-btn d-btn-primary" disabled={isPending}>
                        Update Variant
                    </button>
                )}
                {isPending && (
                    <div className="d-btn d-btn-disabled">
                        <span className="d-loading d-loading-spinner d-loading-sm"></span> Updating...
                    </div>
                )}
            </div>
        </form>
    );
}
