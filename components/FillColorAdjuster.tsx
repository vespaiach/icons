export default function FillColorAdjuster({
    disabled = false,
    fillColor,
    onFillColorChange
}: {
    disabled?: boolean;
    fillColor: string;
    onFillColorChange: (newFillColor: string) => void;
}) {
    const disableInput = disabled || ['none', 'currentcolor'].includes(fillColor.toLowerCase());
    return (
        <fieldset className="d-fieldset flex-1">
            <legend className="d-fieldset-legend flex items-center gap-2">Fill Color</legend>
            <div className="flex items-center gap-3">
                <input
                    id="fill-color"
                    type="color"
                    value={fillColor}
                    onChange={(e) => {
                        if (disableInput) return;
                        const value = e.target.value;
                        onFillColorChange(value);
                    }}
                    className="d-input d-input-bordered w-16 h-8 p-1 cursor-pointer disabled:opacity-50"
                    disabled={disableInput}
                />
                <input
                    type="text"
                    name="fill"
                    value={fillColor}
                    onChange={(e) => {
                        if (disableInput) return;
                        const value = e.target.value;
                        onFillColorChange(value);
                    }}
                    className="d-input d-input-bordered d-input-sm flex-1 font-mono text-xs disabled:opacity-50"
                    placeholder="#000000"
                    disabled={disabled}
                />
            </div>
        </fieldset>
    );
}
