import { textFormatToSvgFormatted } from '@/converters/text-to-svg-converter';
import { extractSvgAttributes, extractSvgInnerContent } from '@/utils/client-side/svg-helpers';
import { applyAdjustmentColor } from '@/utils/string-helpers';

interface TextToSvgProps {
    svgText: string;
    adjustment?: Adjustment;
    className?: string;
}

export default function TextToSvg({ svgText, adjustment, className }: TextToSvgProps) {
    const svgTextAppliedColor = applyAdjustmentColor(svgText, adjustment);
    const svgHtml = textFormatToSvgFormatted(svgTextAppliedColor);
    const attributes = extractSvgAttributes(svgHtml);
    const innerHtml = extractSvgInnerContent(svgHtml);

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            {...attributes}
            width={adjustment?.size || 24}
            height={adjustment?.size || 24}
            className={className}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: we need this to render SVG from text format
            dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
    );
}
