import { astToInnerHtml } from '@/utils/client-side/svg-helpers';

interface AstToSvgProps {
    svgAst: SvgNode;
    variant: Variant;
    adjustment?: Adjustment;
    className?: string;
}

export default function AstToSvg({ svgAst, adjustment, variant, className }: AstToSvgProps) {
    const innerHtml = astToInnerHtml(svgAst);

    return (
        <svg
            {...svgAst.attrs}
            fill={
                variant.fill === 'none'
                    ? 'none'
                    : variant.fill
                      ? adjustment?.color || variant.fill || undefined
                      : undefined
            }
            stroke={
                variant.stroke === 'none'
                    ? 'none'
                    : variant.stroke
                      ? adjustment?.color || variant.stroke || undefined
                      : undefined
            }
            strokeWidth={variant.strokeWidth ? variant.strokeWidth : undefined}
            width={adjustment?.size || svgAst.attrs.width}
            height={adjustment?.size || svgAst.attrs.height}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: we need this to render SVG from AST
            dangerouslySetInnerHTML={{ __html: innerHtml }}
            className={className}
        />
    );
}
