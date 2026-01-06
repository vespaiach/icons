import { dbClient } from './db.client';

export async function getRepositories(): Promise<Repository[]> {
    const rows = await dbClient`
        SELECT 
            id,
            owner,
            name,
            ref,
            github_id AS "githubId",
            created_at AS "createdAt",
            last_imported_at AS "lastImportedAt"
        FROM repositories
        ORDER BY name ASC;
    `;
    return rows;
}

export async function getRepositoriesWithIconCount(): Promise<RepositoryWithIconCount[]> {
    const rows = await dbClient`
        SELECT 
            r.id,
            r.owner,
            r.name,
            r.ref,
            r.github_id AS "githubId",
            r.created_at AS "createdAt",
            r.last_imported_at AS "lastImportedAt",
            COUNT(icons.id)::int AS "iconCount"
        FROM repositories as r
        LEFT JOIN directories ON r.id = directories.repository_id
        LEFT JOIN icons ON directories.id = icons.directory_id
        GROUP BY r.id, r.owner, r.name, r.ref, r.github_id, r.created_at, r.last_imported_at
        ORDER BY r.name ASC
    `;
    return rows;
}

export async function getRepositoryDirectories(): Promise<RepositoryDirectories[]> {
    const rows = await dbClient`
        SELECT 
            repositories.id,
            owner,
            name,
            ref,
            github_id AS "githubId",
            repositories.created_at AS "createdAt",
            last_imported_at AS "lastImportedAt",
            json_agg(
                json_build_object(
                    'id', directories.id,
                    'path', directories.path,
                    'variant', directories.variant,
                    'createdAt', directories.created_at
                )
            ) AS directories
        FROM repositories INNER JOIN directories ON repositories.id = directories.repository_id
        GROUP BY 1, 2, 3, 4, 5, 6, 7
    `;
    return rows;
}

export async function getRepositoryDirectoriesById(
    repositoryId: number
): Promise<RepositoryDirectories | null> {
    const rows = await dbClient`
        SELECT 
            repositories.id,
            owner,
            name,
            ref,
            github_id AS "githubId",
            repositories.created_at AS "createdAt",
            last_imported_at AS "lastImportedAt",
            json_agg(
                json_build_object(
                    'id', directories.id,
                    'path', directories.path,
                    'variant', directories.variant,
                    'createdAt', directories.created_at
                )
            ) AS directories
        FROM repositories INNER JOIN directories ON repositories.id = directories.repository_id
        WHERE repositories.id = ${repositoryId}
        GROUP BY 1, 2, 3, 4, 5, 6, 7
    `;
    return rows.length > 0 ? rows[0] : null;
}

export async function updateRepository(
    data: Partial<Omit<Repository, 'createdAt' | 'id'>> & { id: number }
): Promise<Repository | null> {
    const rows = await dbClient`
        UPDATE repositories
        SET owner = COALESCE(${data.owner}, owner),
            name = COALESCE(${data.name}, name),
            ref = COALESCE(${data.ref}, ref),
            github_id = COALESCE(${data.githubId}, github_id),
            last_imported_at = COALESCE(${data.lastImportedAt}, last_imported_at)
        WHERE id = ${data.id}
        RETURNING 
            id,
            owner,
            name,
            ref,
            github_id AS "githubId",
            created_at AS "createdAt",
            last_imported_at AS "lastImportedAt"
    `;
    return rows[0] ? rows[0] : null;
}
