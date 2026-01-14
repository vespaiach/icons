'use client';

import { Regex } from 'lucide-react';
import { useState } from 'react';
import FillColorAdjuster from '@/components/FillColorAdjuster';
import SizeAdjuster from '@/components/SizeAdjuster';
import StrokeColorAdjuster from '@/components/StrokeColorAdjuster';
import StrokeWidthAdjuster from '@/components/StrokeWidthAdjuster';
import { assertArray } from '@/utils/assert-helpers';
import { cx } from '@/utils/common-helpers';
import type { updateVariantAction } from '../../actions';

type UpdateVariantReturn = Awaited<ReturnType<typeof updateVariantAction>>;

export default function VariantForm({
    formState,
    isPending,
    formAction
}: {
    formState: UpdateVariantReturn;
    isPending: boolean;
    formAction: (formData: FormData) => void;
}) {
    const [enableSize, setEnableSize] = useState(formState.values.defaultSvgAttributes.size !== undefined);
    const [size, setSize] = useState(formState.values.defaultSvgAttributes.size ?? 24);

    const [enableStrokeColor, setEnableStrokeColor] = useState(
        formState.values.defaultSvgAttributes.strokeColor !== undefined
    );
    const [strokeColor, setStrokeColor] = useState(
        formState.values.defaultSvgAttributes.strokeColor ?? '#000000'
    );

    const [enableFillColor, setEnableFillColor] = useState(
        formState.values.defaultSvgAttributes.fillColor !== undefined
    );
    const [fillColor, setFillColor] = useState(formState.values.defaultSvgAttributes.fillColor ?? '#000000');

    const [enableStrokeWidth, setEnableStrokeWidth] = useState(
        formState.values.defaultSvgAttributes.strokeWidth !== undefined
    );
    const [strokeWidth, setStrokeWidth] = useState(formState.values.defaultSvgAttributes.strokeWidth ?? 2);

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
                <legend className="d-fieldset-legend">Default SVG Attributes</legend>
                <div className="space-y-4 mt-4">
                    <div className="flex items-start gap-4">
                        <label className="flex items-center gap-2 w-48 pt-2">
                            <input
                                type="checkbox"
                                className="d-checkbox d-checkbox-md"
                                checked={enableSize}
                                onChange={(e) => setEnableSize(e.target.checked)}
                                name="enableSize"
                            />
                            <span>Size (width & height)</span>
                        </label>
                        <div className="flex-1">
                            {enableSize && (
                                <>
                                    <input type="hidden" name="size" value={size} />
                                    <SizeAdjuster size={size} onSizeChange={setSize} />
                                </>
                            )}
                        </div>
                    </div>

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
                                    <input type="hidden" name="strokeColor" value={strokeColor} />
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
                                    <input type="hidden" name="fillColor" value={fillColor} />
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
