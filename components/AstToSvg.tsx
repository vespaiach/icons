import { astToInnerHtml, prepareAst } from '@/utils/ast-2-html';

interface AstToSvgProps {
    svgAst: SvgNode;
    variant: Variant;
    adjustment?: Adjustment;
    className?: string;
}

export default function AstToSvg({ svgAst, adjustment, variant, className }: AstToSvgProps) {
    const preparedAst = prepareAst(svgAst, variant, adjustment);
    const innerHtml = astToInnerHtml(preparedAst);

    return (
        <svg
            {...svgAst.attrs}
            fill={preparedAst.attrs.fill as string | undefined}
            stroke={preparedAst.attrs.stroke as string | undefined}
            strokeWidth={variant.strokeWidth ? variant.strokeWidth : undefined}
            width={preparedAst.attrs.width as string | number | undefined}
            height={preparedAst.attrs.height as string | number | undefined}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: we need this to render SVG from AST
            dangerouslySetInnerHTML={{ __html: innerHtml }}
            className={className}
        />
    );
}
