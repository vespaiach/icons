'use client';

import { astToInnerHtml } from '@/utils/svg-helpers';
import { usePageContext } from '../PageContext';

export default function IconsContent({ icons }: { icons: IconWithRelativeData[] }) {
    const { setSelectedIcon } = usePageContext();

    return icons.map((icon) => {
        return (
            <div className="icon" key={icon.id}>
                <button
                    onClick={() => {
                        setSelectedIcon(icon);
                    }}
                    type="button"
                    className="cursor-pointer d-tooltip d-tooltip-bottom"
                    data-tip={icon.name}>
                    <svg
                        {...icon.svgAst.attrs}
                        width={24}
                        height={24}
                        dangerouslySetInnerHTML={{ __html: astToInnerHtml(icon.svgAst) }}
                    />
                </button>
            </div>
        );
    });
}
