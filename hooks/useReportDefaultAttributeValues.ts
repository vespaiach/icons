import { useEffect, useRef } from 'react';
import { usePageContext } from '@/app/(external)/ficons/_components/PageContext';

export default function useReportDefaultAttributeValues(
    _variant: Variant,
    svgRef: React.RefObject<SVGSVGElement | null>
) {
    const { updatedVariant } = usePageContext();

    const variantRef = useRef<Variant>(_variant);
    variantRef.current = _variant;
    const ref = svgRef.current;

    useEffect(() => {
        const variant = variantRef.current;
        // Only initialize defaultSvgAttributes if they haven't been set yet
        const needsInitialization =
            variant.defaultSvgAttributes.fillColor === undefined &&
            variant.defaultSvgAttributes.strokeColor === undefined &&
            variant.defaultSvgAttributes.strokeWidth === undefined &&
            variant.defaultSvgAttributes.size === undefined;

        if (ref && needsInitialization) {
            const computedStyles = window.getComputedStyle(ref);
            const defaultSvgAttributes: Variant['defaultSvgAttributes'] = {};

            // Initialize with computed values from the actual rendered SVG
            const fill = computedStyles.fill;
            if (fill && fill !== 'none') {
                defaultSvgAttributes.fillColor = fill;
            }

            const stroke = computedStyles.stroke;
            if (stroke && stroke !== 'none') {
                defaultSvgAttributes.strokeColor = stroke;
            }

            const strokeWidth = computedStyles.strokeWidth;
            if (strokeWidth) {
                defaultSvgAttributes.strokeWidth = parseFloat(strokeWidth || '0');
            }

            defaultSvgAttributes.size = 24;

            updatedVariant({ ...variant, defaultSvgAttributes });
        }
    }, [updatedVariant, ref]);
}
