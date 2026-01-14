import type { Ref } from 'react';
import { astToInnerHtml } from '@/utils/client-side/svg-helpers';

interface AstToSvgProps
    extends Pick<
        React.SVGAttributes<SVGSVGElement>,
        'fill' | 'stroke' | 'strokeWidth' | 'width' | 'height' | 'className' | 'viewBox' | 'xmlns'
    > {
    svgAst: SvgNode;
    dataVariantId?: string;
    ref?: Ref<SVGSVGElement>;
}

export default function AstToSvg({
    svgAst,
    dataVariantId,
    ref,
    fill,
    stroke,
    strokeWidth,
    ...rest
}: AstToSvgProps) {
    const innerHtml = astToInnerHtml(svgAst);
    return (
        <svg
            {...Object.assign(
                {},
                svgAst.attrs,
                Object.fromEntries(
                    [
                        ['fill', fill],
                        ['stroke', stroke],
                        ['strokeWidth', strokeWidth]
                    ].filter(([, v]) => v !== undefined)
                )
            )}
            {...rest}
            ref={ref}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: we need this to render SVG from AST
            dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
    );
}
