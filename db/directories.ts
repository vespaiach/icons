import { dbClient } from './db.client';

export async function getDirectories(): Promise<Directory[]> {
    const rows = await dbClient`
        SELECT 
            id,
            repository_id AS "repositoryId",
            variant,
            path,
            created_at AS "createdAt"
        FROM directories;
        ORDER BY id ASC
    `;
    return rows as Directory[];
}
