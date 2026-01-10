import { cx } from '@/utils/common-helpers';

export default function StrokeColorAdjuster({
    disabled = false,
    strokeColor,
    onStrokeColorChange
}: {
    disabled?: boolean;
    strokeColor: string;
    onStrokeColorChange: (newStrokeColor: string) => void;
}) {
    return (
        <fieldset className={cx('d-fieldset flex-1', disabled && 'opacity-50')}>
            <legend className="d-fieldset-legend flex items-center gap-2">Stroke Color</legend>
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => {
                        if (disabled) return;
                        const value = e.target.value;
                        onStrokeColorChange(value);
                    }}
                    disabled={disabled}
                    className="d-input d-input-bordered w-16 h-8 p-1 cursor-pointer"
                />
                <input
                    type="text"
                    name="stroke"
                    value={strokeColor}
                    onChange={(e) => {
                        if (disabled) return;
                        const value = e.target.value;
                        onStrokeColorChange(value);
                    }}
                    disabled={disabled}
                    className="d-input d-input-bordered d-input-sm flex-1 font-mono text-xs"
                    placeholder="#000000"
                />
            </div>
        </fieldset>
    );
}
