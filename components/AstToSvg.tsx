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

export default function AstToSvg({ svgAst, dataVariantId, ref, ...rest }: AstToSvgProps) {
    const innerHtml = astToInnerHtml(svgAst);
    return (
        <svg
            {...svgAst.attrs}
            {...rest}
            ref={ref}
            data-variant-id={dataVariantId}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: we need this to render SVG from AST
            dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
    );
}
