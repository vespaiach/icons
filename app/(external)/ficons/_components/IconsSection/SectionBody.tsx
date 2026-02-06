'use client';

import { useIntersectionObserver } from '@uidotdev/usehooks';
import { useEffect, useMemo, useState } from 'react';
import { cx } from '@/utils/common-helpers';
import {
    useAdjustmentValue,
    useSearchCountAction,
    useSearchKeywordValue,
    useSetSearchCountAction
} from '../PageContext';
import IconButton from './IconButton';

export default function SectionBody({
    variant,
    repository,
    active
}: {
    variant: Variant;
    repository: RepositoryVariants & { hash: string };
    active: boolean;
}) {
    const [ref, entry] = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px', threshold: 0 });

    const searchCount = useSearchCountAction(variant.id);

    const style = useMemo(() => {
        const count = searchCount !== null && searchCount !== undefined ? searchCount : variant.iconCount;
        const viewPortWidth = document.documentElement.clientWidth;
        const iconsPerRow =
            viewPortWidth >= 1536
                ? 12
                : viewPortWidth >= 1280
                  ? 10
                  : viewPortWidth >= 1024
                    ? 8
                    : viewPortWidth >= 768
                      ? 6
                      : viewPortWidth >= 640
                        ? 4
                        : 3;
        return {
            minHeight: Math.ceil(count / iconsPerRow) * 100
        };
    }, [searchCount, variant.iconCount]);

    const [_icons, setIcons] = useState<IconWithRelativeData[] | null>(null);

    useEffect(() => {
        fetch(`/ficons/icons?v=${variant.id}&h=${repository.hash}`)
            .then((res) => res.json())
            .then((data: IconWithRelativeData[]) => {
                setIcons(data);
            })
            .catch(() => {
                setIcons([]);
                // TODO: report error
            });
    }, [variant.id, repository.hash]);

    const q = useSearchKeywordValue();
    const icons = useMemo(() => {
        if (!q || !_icons) {
            return _icons;
        }

        const lowerQ = q.toLowerCase();
        return _icons.filter((icon) => icon.name.toLowerCase().includes(lowerQ));
    }, [_icons, q]);

    if (!active) return null;

    return (
        <div className="ic-grid" style={style} ref={ref}>
            {entry?.isIntersecting ? <Content icons={icons} variant={variant} /> : null}
        </div>
    );
}

function Content({ icons, variant }: { icons: IconWithRelativeData[] | null; variant: Variant }) {
    const setSearchCount = useSetSearchCountAction();
    const adjustments = useAdjustmentValue(variant.repositoryId);

    useEffect(() => {
        if (icons !== null && icons !== undefined && icons.length !== variant.iconCount) {
            setSearchCount(variant.id, icons.length);
        } else {
            setSearchCount(variant.id, null);
        }
    }, [icons, setSearchCount, variant.id, variant.iconCount]);

    if (icons === null) {
        return new Array(variant.iconCount).fill(null).map((_, index) => {
            return <IconSkeleton key={index} index={index} />;
        });
    }

    if (icons.length === 0) {
        return (
            <div className="col-span-full text-center text-sm text-base-content/50 py-10">
                No icons found.
            </div>
        );
    }

    return icons.map((icon) => (
        <IconButton key={icon.id} icon={icon} variant={variant} adjustment={adjustments} />
    ));
}

function IconSkeleton({ index }: { index: number }) {
    return (
        <div className="animate-pulse bg-base-100 flex flex-col items-center justify-center gap-2">
            <div
                className={cx(
                    'bg-base-300 animate-pulse h-12 w-12',
                    index % 2 === 0 ? 'rounded-full' : 'rounded'
                )}
            />
            <div className="bg-base-300 animate-pulse h-3 w-15" />
        </div>
    );
}
