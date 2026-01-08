import { use } from 'react';
import { useSelectedIcon } from './IconContext';

export default function IconsContent({ iconsPromise }: { iconsPromise: Promise<IconWithRelativeData[]> }) {
    const icons = use(iconsPromise);
    const { setSelectedIcon } = useSelectedIcon();

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
                        {...icon.svgAttributes}
                        width={24}
                        height={24}
                        dangerouslySetInnerHTML={{ __html: icon.svgContent }}
                    />
                </button>
            </div>
        );
    });
}
