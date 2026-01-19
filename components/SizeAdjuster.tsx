'use client';

export default function SizeAdjuster({
    size,
    className,
    disabled,
    onSizeChange
}: {
    size: number;
    className?: string;
    disabled?: boolean;
    onSizeChange: (newSize: number) => void;
}) {
    return (
        <div className={className}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Size</p>
                <p className="text-sm text-base-content/60">{size}px</p>
            </div>
            <input
                type="range"
                name="size"
                min="4"
                max="512"
                value={size}
                onChange={(e) => {
                    onSizeChange(Number.parseInt(e.target.value, 10));
                }}
                className="d-range d-range-xs disabled:opacity-50"
                disabled={disabled}
            />
        </div>
    );
}
