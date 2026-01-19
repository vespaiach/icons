'use client';

import { ExternalLink, Star } from 'lucide-react';
import useGithubRepoInfo from '@/hooks/useGithubStarCount';
import { assertDate, assertNumber, assertString } from '@/utils/assert-helpers';

export default function RepositoryInfo({ selectedRepository }: { selectedRepository: Repository }) {
    const repoInfo = useGithubRepoInfo(selectedRepository);
    const githubUrl = `https://github.com/${selectedRepository.owner}/${selectedRepository.name}`;

    return (
        <div className="flex justify-between">
            <div>
                <div className="flex gap-2">
                    <span className="text-sm shrink-0 font-semibold">Github:</span>
                    <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-link d-link-hover inline-flex grow items-center gap-2 text-sm">
                        <span>
                            {selectedRepository.owner}/{selectedRepository.name}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                {assertNumber(repoInfo?.starCount) && (
                    <div className="flex gap-2">
                        <span className="text-sm shrink-0 font-semibold">Star(s):</span>
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-link d-link-hover inline-flex grow items-center gap-2">
                            <span className="text-sm flex items-center gap-1">
                                <Star className="w-3 h-3" /> {repoInfo.starCount.toLocaleString()}
                            </span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}
                {assertString(repoInfo?.license) && (
                    <div className="flex gap-2">
                        <span className="text-sm shrink-0 font-semibold">License:</span>
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-link d-link-hover inline-flex grow items-center gap-2 text-sm">
                            <span>{repoInfo.license}</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}
            </div>
            <div>
                {assertDate(repoInfo?.lastUpdatedAt) && (
                    <div className="flex gap-2">
                        <span className="text-sm shrink-0 font-semibold">Recent update:</span>
                        <span className="d-link no-underline text-sm cursor-default">
                            {repoInfo.lastUpdatedAt.toLocaleDateString()}
                        </span>
                    </div>
                )}
                {assertDate(repoInfo?.createdAt) && (
                    <div className="flex gap-2">
                        <span className="text-sm shrink-0 font-semibold">Created at:</span>
                        <span className="d-link no-underline text-sm cursor-default">
                            {repoInfo.createdAt.toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
