import { useMemo } from 'react';
import TextToSvg from '@/components/TextToSvg';
import { cx } from '@/utils/common-helpers';
import FavoriteButton from '../FavoriteButton';
import { useIconAction, useIconValue } from '../PageContext';

export default function IconButton({
    icon,
    adjustment
}: {
    icon: IconWithRelativeData;
    variant: Variant;
    adjustment: { color: string; size: number };
}) {
    const [setIcon] = useIconAction();
    const selectedIcon = useIconValue();
    const iconElement = useMemo(() => {
        return <TextToSvg svgText={icon.svgText} adjustment={{ ...adjustment, size: 38 }} />;
    }, [icon.svgText, adjustment]);

    return (
        <div className={cx('icon group rounded-md', selectedIcon?.id === icon.id && 'ring-2 ring-secondary')}>
            <button
                className="btn"
                onClick={() => {
                    setIcon(icon);
                }}
                type="button">
                {iconElement}
                <span>{icon.name}</span>
            </button>
            <FavoriteButton icon={icon} className="absolute top-2 right-2" defaultHide />
        </div>
    );
}
