'use client';

import { useIsClient } from '@uidotdev/usehooks';
import { useSetAtom } from 'jotai';
import { Settings } from 'lucide-react';
import { startTransition, useEffect, useRef, useState } from 'react';
import { assertNumber } from '@/utils/assert-helpers';
import { cx, repoToId } from '@/utils/common-helpers';
import { repositoryAtom, useSearchCountAction } from '../PageContext';
import SectionBody from './SectionBody';

export default function IconSection({ repository }: { repository: RepositoryVariants & { hash: string } }) {
    const isClient = useIsClient();
    const id = repoToId(repository);
    const [selectedVariant, setSelectedVariant] = useState(repository.variants[0]);
    const [isSticky, setIsSticky] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const setRepository = useSetAtom(repositoryAtom);
    const searchCount = useSearchCountAction(selectedVariant.id);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting);
            },
            { threshold: [0], rootMargin: '-48px 0px 0px 0px' }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div
            className="pb-20"
            id={id}
            data-name={`${repository.owner}/${repository.name}`}
            style={{ scrollMarginTop: '72px' }}>
            <div ref={sentinelRef} className="h-0" />
            <div
                className={cx(
                    'gap-x-6 flex flex-col md:flex-row md:justify-between sticky top-12 z-10 text-base-content px-2 pt-2 transition-colors',
                    isSticky ? 'bg-base-300' : ''
                )}>
                <h2 className="font-semibold text-2xl capitalize flex items-center whitespace-nowrap">
                    {repository.owner}/{repository.name}
                    <button
                        type="button"
                        className="d-btn d-btn-ghost d-btn-sm d-btn-square cursor-pointer ml-2"
                        aria-label="Repository Settings"
                        onClick={() => {
                            setRepository(repository);
                        }}>
                        <Settings className="w-4 h-4" />
                    </button>
                </h2>
                <div className="tablist-container">
                    <div role="tablist" className="d-tabs d-tabs-border flex-nowrap">
                        {repository.variants.map((variant) => {
                            return (
                                <button
                                    key={variant.id}
                                    type="button"
                                    role="tab"
                                    className={cx(
                                        'd-tab capitalize',
                                        selectedVariant.id === variant.id && 'd-tab-active'
                                    )}
                                    onClick={() => {
                                        startTransition(() => {
                                            setSelectedVariant(variant);
                                            document
                                                .getElementById(id)
                                                ?.scrollIntoView({ behavior: 'smooth' });
                                        });
                                    }}>
                                    {variant.name} (
                                    {assertNumber(searchCount) && selectedVariant.id === variant.id
                                        ? `${searchCount}/`
                                        : ''}
                                    {variant.iconCount})
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="px-2">
                <div className="d-tab-content block border-base-300 bg-base-100">
                    {isClient
                        ? repository.variants.map((v) => (
                              <SectionBody
                                  key={v.id}
                                  repository={repository}
                                  variant={selectedVariant}
                                  active={v.id === selectedVariant.id}
                              />
                          ))
                        : null}
                </div>
            </div>
        </div>
    );
}
