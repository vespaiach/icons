'use client';

import { useIntersectionObserver } from '@uidotdev/usehooks';
import { useEffect, useMemo, useState } from 'react';
import { cx } from '@/utils/common-helpers';
import IconButton from './IconButton';

export default function SectionBody({ variant }: { variant: Variant }) {
    const [ref, entry] = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px', threshold: 0 });
    const style = useMemo(() => {
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
            minHeight: Math.ceil(variant.iconCount / iconsPerRow) * 100
        };
    }, [variant.iconCount]);

    const [icons, setIcons] = useState<IconWithRelativeData[] | null>(null);

    useEffect(() => {
        fetch(`/ficons/icons?variantId=${variant.id}`)
            .then((res) => res.json())
            .then((data) => setIcons(data))
            .catch(() => {
                setIcons([]);
                // TODO: report error
            });
    }, [variant.id]);

    return (
        <div className="ic-grid" style={style} ref={ref}>
            {entry?.isIntersecting ? <Content variant={variant} icons={icons} /> : null}
        </div>
    );
}

function Content({ variant, icons }: { variant: Variant; icons: IconWithRelativeData[] | null }) {
    if (icons === null)
        return new Array(variant.iconCount).fill(null).map((_, index) => {
            return <IconSkeleton key={index} index={index} />;
        });

    if (icons.length === 0) {
        return (
            <div className="col-span-full text-center text-sm text-base-content/50 py-10">
                No icons found.
            </div>
        );
    }

    return icons.map((icon) => (
        <IconButton
            key={icon.id}
            icon={icon}
            variant={variant}
            adjustment={{ color: 'currentColor', size: 24 }}
        />
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
