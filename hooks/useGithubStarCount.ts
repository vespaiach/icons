'use client';

import { useEffect, useState } from 'react';

export default function useGithubRepoInfo(repository: { owner: string; name: string }) {
    const [repoInfo, setRepoInfo] = useState<{
        starCount: number;
        license: string;
        lastUpdatedAt: Date | null;
        createdAt: Date | null;
        homepage: string | null;
    } | null>(null);

    useEffect(() => {
        const fetchStarCount = async () => {
            try {
                const response = await fetch(
                    `https://api.github.com/repos/${repository.owner}/${repository.name}`,
                    {
                        cache: 'force-cache', // Use browser's HTTP cache
                        next: { revalidate: 3600 } // Revalidate after 1 hour
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setRepoInfo({
                        starCount: data.stargazers_count,
                        license: data.license?.name || 'N/A',
                        lastUpdatedAt: data.pushed_at ? new Date(data.pushed_at) : null,
                        homepage: data.homepage || null,
                        createdAt: data.created_at ? new Date(data.created_at) : null
                    });
                }
            } catch (error) {
                console.error('Failed to fetch star count:', error);
            }
        };
        fetchStarCount();
    }, [repository.owner, repository.name]);

    return repoInfo;
}
