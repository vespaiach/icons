import { cx } from '@/utils/common-helpers';

export default function StrokeWidthAdjuster({
    disabled = false,
    strokeWidth,
    onStrokeWidthChange
}: {
    disabled?: boolean;
    strokeWidth: number;
    onStrokeWidthChange: (newStrokeWidth: number) => void;
}) {
    return (
        <fieldset className="d-fieldset flex-1">
            <legend className={cx('d-fieldset-legend flex items-center gap-2', disabled && 'opacity-50')}>
                Stroke Width: {strokeWidth}px
            </legend>
            <input
                type="range"
                name="strokeWidth"
                min="0.5"
                max="10"
                step="0.5"
                value={strokeWidth}
                onChange={(e) => onStrokeWidthChange(Number.parseFloat(e.target.value))}
                className="d-range d-range-xs disabled:opacity-50"
                disabled={disabled}
            />
        </fieldset>
    );
}
