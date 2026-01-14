'use client';

import { ExternalLink, Info, Settings } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';
import { repoToId } from '@/utils/common-helpers';
import { usePageContext } from './PageContext';

export default function IconSectionSkeleton({ repository }: { repository: RepositoryVariants }) {
    const { setSelectedRepository } = usePageContext();

    return (
        <div
            className="pb-12 px-4"
            id={repoToId(repository)}
            data-name={`${repository.owner}/${repository.name}`}
            style={{ scrollMarginTop: '72px' }}>
            <div className="mb-4">
                <h2 className="font-semibold text-lg capitalize flex items-center">
                    {repository.owner}/{repository.name}
                    <a
                        href={`https://github.com/${repository.owner}/${repository.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-btn d-btn-ghost d-btn-sm d-btn-square cursor-pointer ml-4">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                        type="button"
                        className="d-btn d-btn-ghost d-btn-sm d-btn-square cursor-pointer"
                        aria-label="Repository Information"
                        onClick={() => {
                            setSelectedRepository(repository);
                        }}>
                        <Info className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        className="d-btn d-btn-ghost d-btn-sm d-btn-square cursor-pointer"
                        aria-label="Repository Settings"
                        onClick={() => {
                            setSelectedRepository(repository);
                        }}>
                        <Settings className="w-4 h-4" />
                    </button>
                </h2>

                <div className="d-tabs d-tabs-lift mt-3">
                    {repository.variants.map((variant, index) => {
                        return (
                            <Fragment key={variant.id}>
                                <input
                                    type="radio"
                                    name={`variant_tabs_${variant.repositoryId}`}
                                    className="d-tab font-semibold"
                                    aria-label={`${variant.name} (${variant.iconCount})`}
                                    defaultChecked={index === 0}
                                />
                                <div className="d-tab-content mt-2">
                                    <div className="icons-grid">
                                        <SkeletonIconsContainer iconCount={variant.iconCount} />
                                    </div>
                                </div>
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function SkeletonIconsContainer({ iconCount }: { iconCount: number }) {
    return Array.from({ length: iconCount }, (_, index) => (
        <div key={index} className="w-14 h-14 bg-gray-200 rounded-md animate-pulse"></div>
    ));
}
