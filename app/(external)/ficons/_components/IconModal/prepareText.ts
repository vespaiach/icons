import { textFormatToSvg } from '@/converters/svg-to-text-converter';
import { applyAdjustment2SvgText } from '@/utils/string-helpers';
import { svgToReactComponent } from '@/utils/svg-to-tsx';

export default function prepareText(
    icon: { name: string; svgText: string },
    format: string,
    adjustment?: { color?: string; size?: string | number }
) {
    let preparedContent = '';
    if (format === 'Raw SVG') {
        preparedContent = applyAdjustment2SvgText(icon.svgText, adjustment);
        preparedContent = textFormatToSvg(preparedContent);
    } else if (format === 'React TSX') {
        preparedContent = svgToReactComponent({
            name: icon.name,
            svgString: textFormatToSvg(icon.svgText),
            size: adjustment?.size || 24,
            color: adjustment?.color
        });
    }

    return preparedContent;
}
