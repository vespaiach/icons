export default function ColorAdjuster({
    disabled = false,
    color = '#000000',
    className = 'space-y-4',
    onColorChange
}: {
    disabled?: boolean;
    color?: string;
    className?: string;
    onColorChange: (newColor: string) => void;
}) {
    return (
        <div className={className}>
            <div className="flex items-center gap-4">
                <p className="font-semibold text-sm">Color</p>
                <div className="border border-base-200 has-focus:border-primary inline-flex items-center gap-2 p-0.75 bg-base-200 rounded-md">
                    <div className="rounded-sm relative w-6 h-6 overflow-hidden bg-red-100 shrink-0">
                        <input
                            id="color"
                            type="color"
                            value={color}
                            onChange={(e) => {
                                if (disabled) return;
                                const value = e.target.value;
                                onColorChange(value);
                            }}
                            className="appearance-none w-10 h-10 border-0 p-0 bg-transparent overflow-hidden absolute -top-2 -left-2 cursor-pointer"
                            disabled={disabled}
                        />
                    </div>
                    <input
                        type="text"
                        name="color"
                        value={color}
                        onChange={(e) => {
                            if (disabled) return;
                            const value = e.target.value;
                            onColorChange(value);
                        }}
                        className="leading-normal border-none p-0 text-sm outline-none text-base-content/60 grow"
                        placeholder="#000000"
                        disabled={disabled}
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <p className="font-semibold text-sm">Apply current color</p>
                <input
                    type="checkbox"
                    checked={color.toLowerCase() === 'currentcolor'}
                    className="d-toggle d-toggle-sm"
                    onChange={(e) => {
                        e.target.checked ? onColorChange('currentColor') : onColorChange('#000000');
                    }}
                />
            </div>
        </div>
    );
}
