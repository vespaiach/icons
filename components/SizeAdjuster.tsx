export default function SizeAdjuster({
    size,
    onSizeChange
}: {
    size: number;
    onSizeChange: (newSize: number) => void;
}) {
    return (
        <fieldset className="d-fieldset">
            <legend className="d-fieldset-legend flex items-center gap-2">Size: {size}px</legend>
            <input
                type="range"
                name="size"
                min="8"
                max="512"
                value={size}
                onChange={(e) => {
                    onSizeChange(Number.parseInt(e.target.value, 10));
                }}
                className="d-range d-range-xs disabled:opacity-50"
            />
        </fieldset>
    );
}
