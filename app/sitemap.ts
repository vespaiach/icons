import type { MetadataRoute } from 'next';
import { sql } from '@/db/db.client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://stayon.online';

    try {
        // Get all repositories with their last update time
        const repos = await sql<{ id: number; owner: string; name: string; lastImportedAt: Date | null }[]>`
            SELECT id, owner, name, last_imported_at as "lastImportedAt"
            FROM repositories
            ORDER BY id
        `;
        const now = new Date();

        const repoUrls: MetadataRoute.Sitemap = repos.map((repo) => ({
            url: `${baseUrl}/ficons#repo-${repo.id}`,
            lastModified: repo.lastImportedAt ? new Date(repo.lastImportedAt) : now,
            changeFrequency: 'weekly',
            priority: 0.8
        }));

        return [
            {
                url: baseUrl,
                lastModified: now,
                changeFrequency: 'daily',
                priority: 1
            },
            {
                url: `${baseUrl}/ficons`,
                lastModified: now,
                changeFrequency: 'daily',
                priority: 0.9
            },
            {
                url: `${baseUrl}/about`,
                lastModified: now,
                changeFrequency: 'monthly',
                priority: 0.5
            },
            {
                url: `${baseUrl}/tou`,
                lastModified: now,
                changeFrequency: 'monthly',
                priority: 0.3
            },
            ...repoUrls
        ];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        // Return basic sitemap if database query fails
        const now = new Date();
        return [
            {
                url: baseUrl,
                lastModified: now,
                changeFrequency: 'daily',
                priority: 1
            },
            {
                url: `${baseUrl}/ficons`,
                lastModified: now,
                changeFrequency: 'daily',
                priority: 0.9
            },
            {
                url: `${baseUrl}/about`,
                lastModified: now,
                changeFrequency: 'monthly',
                priority: 0.5
            }
        ];
    }
}
