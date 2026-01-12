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
    // biome-ignore lint/security/noDangerouslySetInnerHtml: we need this to render SVG from AST
    return <svg {...svgAst.attrs} {...rest} dangerouslySetInnerHTML={{ __html: innerHtml }} />;
}
