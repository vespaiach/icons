import { dbClient } from './db.client';
import type { Repository } from './type';

export async function getRepositories(): Promise<Repository[]> {
    const rows = await dbClient`
        SELECT 
            id,
            owner,
            name,
            github_id AS "githubId",
            created_at AS "createdAt"
        FROM repositories
        ORDER BY name ASC
    `;
    return rows;
}

export async function getRepositoryById(
    repositoryId: number
): Promise<Repository | null> {
    const rows = await dbClient`
        SELECT 
            id,
            owner,
            name,
            github_id AS "githubId",
            created_at AS "createdAt"
        FROM repositories
        WHERE id = ${repositoryId}
        LIMIT 1
    `;
    return rows.length > 0 ? rows[0] : null;
}
