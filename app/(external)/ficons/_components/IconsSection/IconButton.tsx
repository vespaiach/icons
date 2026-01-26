import { useMemo } from 'react';
import AstToSvg from '@/components/AstToSvg';
import { cx } from '@/utils/common-helpers';
import FavoriteButton from '../FavoriteButton';
import { useIconAction, useIconValue } from '../PageContext';

export default function IconButton({
    icon,
    variant,
    adjustment
}: {
    icon: IconWithRelativeData;
    variant: Variant;
    adjustment: { color: string; size: number };
}) {
    const [setIcon] = useIconAction();
    const selectedIcon = useIconValue();
    const iconElement = useMemo(() => {
        return <AstToSvg svgAst={icon.svgAst} variant={variant} adjustment={{ ...adjustment, size: 38 }} />;
    }, [icon.svgAst, adjustment, variant]);

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
