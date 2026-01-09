'use client';

import { Regex } from 'lucide-react';
import { useState } from 'react';
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
    const [strokeColor, setStrokeColor] = useState(formState.values.stroke || '#000000');
    const [fillColor, setFillColor] = useState(formState.values.fill || '#000000');
    const [strokeWidth, setStrokeWidth] = useState(
        formState.values.strokeWidth ? Number.parseFloat(formState.values.strokeWidth) : 1
    );
    const [iconWidth, setIconWidth] = useState(
        formState.values.width ? Number.parseInt(formState.values.width, 10) : 24
    );
    const [iconHeight, setIconHeight] = useState(
        formState.values.height ? Number.parseInt(formState.values.height, 10) : 24
    );

    const [enableStroke, setEnableStroke] = useState(formState.values.stroke !== undefined);
    const [enableFill, setEnableFill] = useState(formState.values.fill !== undefined);
    const [enableStrokeWidth, setEnableStrokeWidth] = useState(formState.values.strokeWidth !== undefined);
    const [enableWidth, setEnableWidth] = useState(formState.values.width !== undefined);
    const [enableHeight, setEnableHeight] = useState(formState.values.height !== undefined);

    const attributesToUpdate = {};
    if (enableStroke) {
        Object.assign(attributesToUpdate, { stroke: strokeColor });
    }
    if (enableFill) {
        Object.assign(attributesToUpdate, { fill: fillColor });
    }
    if (enableStrokeWidth) {
        Object.assign(attributesToUpdate, { strokeWidth: strokeWidth.toString() });
    }
    if (enableWidth) {
        Object.assign(attributesToUpdate, { width: iconWidth.toString() });
    }
    if (enableHeight) {
        Object.assign(attributesToUpdate, { height: iconHeight.toString() });
    }

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

            <div className="flex gap-8">
                <div className="flex-1 space-y-5">
                    <fieldset className="d-fieldset flex-1">
                        <legend className="d-fieldset-legend flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="enableStroke"
                                checked={enableStroke}
                                onChange={(e) => setEnableStroke(e.target.checked)}
                                className="d-checkbox d-checkbox-sm"
                            />
                            Stroke Color
                        </legend>
                        <div className="flex items-center gap-3">
                            <input
                                id="stroke-color"
                                type="color"
                                value={strokeColor}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setStrokeColor(value);
                                }}
                                disabled={!enableStroke}
                                className="d-input d-input-bordered w-16 h-8 p-1 cursor-pointer disabled:opacity-50"
                            />
                            <input
                                type="text"
                                name={enableStroke ? 'stroke' : ''}
                                value={strokeColor}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setStrokeColor(value);
                                }}
                                disabled={!enableStroke}
                                className="d-input d-input-bordered d-input-sm flex-1 font-mono text-xs disabled:opacity-50"
                                placeholder="#000000"
                            />
                        </div>
                    </fieldset>

                    <fieldset className="d-fieldset flex-1">
                        <legend className="d-fieldset-legend flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={enableFill}
                                name="enableFill"
                                onChange={(e) => setEnableFill(e.target.checked)}
                                className="d-checkbox d-checkbox-sm"
                            />
                            Fill Color
                        </legend>
                        <div className="flex items-center gap-3">
                            <input
                                id="fill-color"
                                type="color"
                                value={fillColor}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFillColor(value);
                                }}
                                disabled={!enableFill}
                                className="d-input d-input-bordered w-16 h-8 p-1 cursor-pointer disabled:opacity-50"
                            />
                            <input
                                type="text"
                                name={enableFill ? 'fill' : ''}
                                value={fillColor}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFillColor(value);
                                }}
                                disabled={!enableFill}
                                className="d-input d-input-bordered d-input-sm flex-1 font-mono text-xs disabled:opacity-50"
                                placeholder="#000000"
                            />
                        </div>
                    </fieldset>

                    <fieldset className="d-fieldset flex-1">
                        <legend className="d-fieldset-legend flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={enableStrokeWidth}
                                name="enableStrokeWidth"
                                onChange={(e) => setEnableStrokeWidth(e.target.checked)}
                                className="d-checkbox d-checkbox-sm"
                            />
                            Stroke Width: {strokeWidth}px
                        </legend>
                        <input
                            id="stroke-width"
                            type="range"
                            name={enableStrokeWidth ? 'strokeWidth' : ''}
                            min="0.5"
                            max="10"
                            step="0.5"
                            value={strokeWidth}
                            onChange={(e) => setStrokeWidth(Number.parseFloat(e.target.value))}
                            disabled={!enableStrokeWidth}
                            className="d-range d-range-xs disabled:opacity-50"
                        />
                    </fieldset>

                    <fieldset className="d-fieldset">
                        <legend className="d-fieldset-legend flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="enableWidth"
                                checked={enableWidth}
                                onChange={(e) => setEnableWidth(e.target.checked)}
                                className="d-checkbox d-checkbox-sm"
                            />
                            Width: {iconWidth}px
                        </legend>
                        <input
                            id="width-control"
                            type="range"
                            name={enableWidth ? 'width' : ''}
                            min="8"
                            max="300"
                            value={iconWidth}
                            onChange={(e) => setIconWidth(Number.parseInt(e.target.value, 10))}
                            disabled={!enableWidth}
                            className="d-range d-range-xs disabled:opacity-50"
                        />
                    </fieldset>

                    <fieldset className="d-fieldset">
                        <legend className="d-fieldset-legend flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="enableHeight"
                                checked={enableHeight}
                                onChange={(e) => setEnableHeight(e.target.checked)}
                                className="d-checkbox d-checkbox-sm"
                            />
                            Height: {iconHeight}px
                        </legend>
                        <input
                            id="height-control"
                            type="range"
                            name={enableHeight ? 'height' : ''}
                            min="8"
                            max="300"
                            value={iconHeight}
                            onChange={(e) => setIconHeight(Number.parseInt(e.target.value, 10))}
                            disabled={!enableHeight}
                            className="d-range d-range-xs disabled:opacity-50"
                        />
                    </fieldset>
                </div>

                <div className="flex-1 rounded-2xl bg-base-300 p-5 flex items-center">
                    <pre>{JSON.stringify(attributesToUpdate, null, 4)}</pre>
                </div>
            </div>

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
