import { dbClient } from './db.client';

export async function getVariants(): Promise<Variant[]> {
    const rows = await dbClient`
        SELECT 
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        FROM variants
        ORDER BY id ASC
    `;
    return rows as Variant[];
}
