import { dbClient } from './db.client';

export async function getRepositories(): Promise<Repository[]> {
    const rows = await dbClient`
        SELECT 
            id,
            owner,
            name,
            ref,
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
            r.created_at AS "createdAt",
            r.last_imported_at AS "lastImportedAt",
            COUNT(icons.id)::int AS "iconCount"
        FROM repositories as r
        LEFT JOIN variants ON r.id = variants.repository_id
        LEFT JOIN icons ON variants.id = icons.variant_id
        GROUP BY r.id, r.owner, r.name, r.ref, r.created_at, r.last_imported_at
        ORDER BY r.name ASC
    `;
    return rows;
}

export async function getRepositoryVariants(): Promise<RepositoryVariants[]> {
    const rows = await dbClient`
        SELECT 
            repositories.id,
            repositories.owner,
            repositories.name,
            repositories.ref,
            repositories.created_at AS "createdAt",
            repositories.last_imported_at AS "lastImportedAt",
            json_agg(
                json_build_object(
                    'id', variants.id,
                    'path', variants.path,
                    'name', variants.name,
                    'regex', variants.regex,
                    'svgRootAttributes', variants.svg_root_attributes,
                    'createdAt', variants.created_at,
                    'updatedAt', variants.updated_at
                )
            ) AS variants
        FROM repositories INNER JOIN variants ON repositories.id = variants.repository_id
        GROUP BY 1, 2, 3, 4, 5, 6
    `;
    return rows;
}

export async function getRepositoryVariantsWithIconCount(): Promise<RepositoryVariantsWithIconCount[]> {
    const rows = await dbClient`
        WITH icon_counts AS (
            SELECT 
                variants.repository_id,
                COUNT(icons.id) AS icon_count
            FROM variants LEFT JOIN icons ON variants.id = icons.variant_id
            GROUP BY variants.repository_id
        )
        SELECT 
            r.id,
            r.owner,
            r.name,
            r.ref,
            r.created_at AS "createdAt",
            r.last_imported_at AS "lastImportedAt",
            COALESCE(i.icon_count, 0)::int AS "iconCount",
            json_agg(
                json_build_object(
                    'id', v.id,
                    'path', v.path,
                    'name', v.name,
                    'regex', v.regex,
                    'svgRootAttributes', v.svg_root_attributes,
                    'createdAt', v.created_at,
                    'updatedAt', v.updated_at
                )
            ) AS variants
        FROM repositories as r INNER JOIN variants as v ON r.id = v.repository_id
        LEFT JOIN icon_counts as i ON r.id = i.repository_id
        GROUP BY r.id, r.owner, r.name, r.ref, r.created_at, r.last_imported_at, i.icon_count
        ORDER BY r.name ASC
    `;
    return rows;
}

export async function getRepositoryVariantsById(repositoryId: number): Promise<RepositoryVariants | null> {
    const rows = await dbClient`
        SELECT 
            repositories.id,
            repositories.owner,
            repositories.name,
            repositories.ref,
            repositories.created_at AS "createdAt",
            repositories.last_imported_at AS "lastImportedAt",
            json_agg(
                json_build_object(
                    'id', variants.id,
                    'path', variants.path,
                    'name', variants.name,
                    'regex', variants.regex,
                    'svgRootAttributes', variants.svg_root_attributes,
                    'createdAt', variants.created_at,
                    'updatedAt', variants.updated_at
                )
            ) AS variants
        FROM repositories INNER JOIN variants ON repositories.id = variants.repository_id
        WHERE repositories.id = ${repositoryId}
        GROUP BY 1, 2, 3, 4, 5, 6
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
            last_imported_at = COALESCE(${data.lastImportedAt}, last_imported_at)
        WHERE id = ${data.id}
        RETURNING 
            id,
            owner,
            name,
            ref,
            created_at AS "createdAt",
            last_imported_at AS "lastImportedAt"
    `;
    return rows[0] ? rows[0] : null;
}
