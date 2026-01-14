import { assertNumber, assertString } from '@/utils/assert-helpers';
import FillColorAdjuster from './FillColorAdjuster';
import SizeAdjuster from './SizeAdjuster';
import StrokeColorAdjuster from './StrokeColorAdjuster';
import StrokeWidthAdjuster from './StrokeWidthAdjuster';

interface AttributeValues {
    width: number;
    height: number;
    strokeWidth?: number;
    stroke?: string;
    fill?: string;
}

interface AttributesAdjusterProps {
    value: AttributeValues;
    onChange: (newAttributes: AttributeValues) => void;
}

export default function AttributesAdjuster({ value, onChange }: AttributesAdjusterProps) {
    return (
        <>
            {/* Size Control */}
            <SizeAdjuster
                width={value.width}
                height={value.height}
                onSizeChange={(newWidth, newHeight) => onChange({ ...value, width: newWidth, height: newHeight })}
            />
            {/* Stroke Width Control */}
            {assertNumber(value.strokeWidth) && (
                <StrokeWidthAdjuster
                    onStrokeWidthChange={(newStrokeWidth) =>
                        onChange({ ...value, strokeWidth: newStrokeWidth })
                    }
                    strokeWidth={value.strokeWidth}
                />
            )}

            {/* Stroke Color Control */}
            {assertString(value.stroke) && (
                <StrokeColorAdjuster
                    onStrokeColorChange={(newStrokeColor) => onChange({ ...value, stroke: newStrokeColor })}
                    strokeColor={value.stroke}
                />
            )}

            {/* Fill Color Control */}
            {assertString(value.fill) && (
                <FillColorAdjuster
                    onFillColorChange={(newFillColor) => onChange({ ...value, fill: newFillColor })}
                    fillColor={value.fill}
                />
            )}
        </>
    );
}
