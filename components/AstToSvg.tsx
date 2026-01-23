import { astToInnerHtml, mergeAttributes } from '@/utils/client-side/svg-helpers';

interface AstToSvgProps {
    svgAst: SvgNode;
    variant: Variant;
    adjustment?: Adjustment;
    className?: string;
}

export default function AstToSvg({ svgAst, adjustment, variant, className }: AstToSvgProps) {
    const innerHtml = astToInnerHtml(
        svgAst,
        variant.colorOnChildren
            ? {
                  fill: mergeAttributes(variant.fill, adjustment?.color),
                  stroke: mergeAttributes(variant.stroke, adjustment?.color)
              }
            : undefined
    );

    return (
        <svg
            {...svgAst.attrs}
            fill={mergeAttributes(variant.fill, adjustment?.color)}
            stroke={mergeAttributes(variant.stroke, adjustment?.color)}
            strokeWidth={variant.strokeWidth ? variant.strokeWidth : undefined}
            width={adjustment?.size || 24}
            height={adjustment?.size || 24}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: we need this to render SVG from AST
            dangerouslySetInnerHTML={{ __html: innerHtml }}
            className={className}
        />
    );
}
