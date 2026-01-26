'use client';

import { useIsClient } from '@uidotdev/usehooks';
import { useSetAtom } from 'jotai';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { cx, repoToId } from '@/utils/common-helpers';
import { repositoryAtom } from '../PageContext';
import SectionBody from './SectionBody';

export default function IconSection({ repository }: { repository: RepositoryVariants }) {
    const isClient = useIsClient();
    const [selectedVariant, setSelectedVariant] = useState(repository.variants[0]);
    const setRepository = useSetAtom(repositoryAtom);

    return (
        <div
            className="pb-20 px-2"
            id={repoToId(repository)}
            data-name={`${repository.owner}/${repository.name}`}
            style={{ scrollMarginTop: '72px' }}>
            <div className="flex flex-col md:flex-row md:justify-between h-12 items-end sticky top-12 z-10 bg-base-100">
                <h2 className="font-semibold text-2xl capitalize flex items-center mb-2">
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
                <div role="tablist" className="d-tabs d-tabs-border">
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
                                onClick={() => setSelectedVariant(variant)}>
                                {variant.name} ({variant.iconCount})
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="d-tab-content block border-base-300 bg-base-100">
                {isClient
                    ? repository.variants.map((v) =>
                          v.id === selectedVariant.id ? (
                              <SectionBody key={v.id} variant={selectedVariant} />
                          ) : null
                      )
                    : null}
            </div>
        </div>
    );
}
