import { HeartPlus } from 'lucide-react';
import { useCallback } from 'react';
import { cx } from '@/utils/common-helpers';
import { useAdjustment, useFavoritesAction, useFavoritesValue } from './PageContext';

export default function FavoriteButton({
    icon,
    defaultHide = false,
    className
}: {
    className?: string;
    defaultHide?: boolean;
    icon: { id: string; repositoryId: number; svgAst: SvgNode };
}) {
    const { ids } = useFavoritesValue();
    const adjustment = useAdjustment(icon.repositoryId);
    const [addToFavorites, removeFromFavorites] = useFavoritesAction();
    const inFavorites = ids.has(icon.id);

    const handleClick = useCallback(() => {
        if (ids.has(icon.id)) {
            removeFromFavorites(icon.id);
        } else {
            addToFavorites(icon, adjustment.color, adjustment.size);
        }
    }, [ids, icon, addToFavorites, removeFromFavorites, adjustment]);

    return (
        <button
            className={cx(
                'd-btn d-btn-circle d-btn-xs d-btn-secondary d-btn-ghost',
                inFavorites && 'd-btn-active',
                defaultHide && !inFavorites && 'invisible group-hover:visible',
                className
            )}
            type="button"
            title={inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
            aria-label={inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
            onClick={handleClick}>
            <HeartPlus size={16} />
        </button>
    );
}
