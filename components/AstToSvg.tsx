import { astToInnerHtml } from '@/utils/client-side/svg-helpers';

interface AstToSvgProps
    extends Pick<
        React.SVGAttributes<SVGSVGElement>,
        'fill' | 'stroke' | 'strokeWidth' | 'width' | 'height' | 'className' | 'viewBox' | 'xmlns'
    > {
    svgAst: SvgNode;
}

export default function AstToSvg({ svgAst, ...rest }: AstToSvgProps) {
    const innerHtml = astToInnerHtml(svgAst);
    return <svg {...svgAst.attrs} {...rest} dangerouslySetInnerHTML={{ __html: innerHtml }} />;
}
