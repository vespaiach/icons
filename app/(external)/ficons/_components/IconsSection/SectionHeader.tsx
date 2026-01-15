'use client';

import { ExternalLink, Info, Settings } from 'lucide-react';
import { usePageContext } from '../PageContext';

export default function SectionHeader({ repository }: { repository: RepositoryVariants }) {
    const { setSelectedRepository } = usePageContext();

    return (
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
    );
}
