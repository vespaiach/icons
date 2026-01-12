import { useEffect, useRef } from 'react';
import { type ExtendedVariant, usePageContext } from '@/app/(external)/icons/_components/PageContext';

export default function useDefaultVariantSettings(
    _variant: ExtendedVariant,
    svgRef: React.RefObject<SVGSVGElement | null>
) {
    const { updatedVariant } = usePageContext();

    const variantRef = useRef<ExtendedVariant>(_variant);
    variantRef.current = _variant;
    const ref = svgRef.current;

    useEffect(() => {
        if (ref && variantRef.current.svgAttributes === undefined) {
            const computedStyles = window.getComputedStyle(ref);
            const variant = variantRef.current;
            const svgAttributes: ExtendedVariant['svgAttributes'] = {
                fill: variant.attributesToAdjust.includes('fillColor') ? computedStyles.fill : undefined,
                stroke: variant.attributesToAdjust.includes('strokeColor')
                    ? computedStyles.stroke
                    : undefined,
                strokeWidth: variant.attributesToAdjust.includes('strokeWidth')
                    ? parseFloat(computedStyles.strokeWidth || '0')
                    : undefined,
                width: 24,
                height: 24
            };
            updatedVariant({ ...variant, svgAttributes });
        }
    }, [updatedVariant, ref]);
}
