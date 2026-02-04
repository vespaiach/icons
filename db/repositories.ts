import { log } from '../utils/log.helpers';
import { sql } from './db.client';

export async function getRepositoriesWithVariants(): Promise<RepositoryVariants[]> {
    log('info', '[DB] getRepositoriesWithVariants - START');
    const rows = await sql`
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
                    'repositoryId', variants.repository_id,
                    'stroke', variants.stroke,
                    'strokeOn', variants.stroke_on,
                    'fill', variants.fill,
                    'fillOn', variants.fill_on,
                    'strokeWidth', variants.stroke_width,
                    'strokeWidthOn', variants.stroke_width_on,
                    'iconCount', variants.icon_count,
                    'createdAt', variants.created_at,
                    'updatedAt', variants.updated_at
                )
            ) AS variants
        FROM repositories INNER JOIN variants ON repositories.id = variants.repository_id
        GROUP BY 1, 2, 3, 4, 5, 6
        ORDER BY repositories.name ASC
    `;
    log('info', `[DB] getRepositoriesWithVariants - END (${rows.length} rows)`);
    if (Bun.env.DEBUG_QUERIES === 'true') {
        log('info', '[DB] getRepositoriesWithVariants - RESULTS', rows);
    }
    return rows as unknown as RepositoryVariants[];
}

export async function getRepositoriesWithIconCount(): Promise<RepositoryWithIconCount[]> {
    log('info', '[DB] getRepositoriesWithIconCount - START');
    const rows = await sql`
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
    log('info', `[DB] getRepositoriesWithIconCount - END (${rows.length} rows)`);
    if (Bun.env.DEBUG_QUERIES === 'true') {
        log('info', '[DB] getRepositoriesWithIconCount - RESULTS', rows);
    }
    return rows as unknown as RepositoryWithIconCount[];
}

export async function getRepositoryVariantsWithIconCount(): Promise<RepositoryVariantsWithIconCount[]> {
    log('info', '[DB] getRepositoryVariantsWithIconCount - START');
    const rows = await sql`
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
                    'stroke', v.stroke,
                    'strokeOn', v.stroke_on,
                    'fill', v.fill,
                    'fillOn', v.fill_on,
                    'strokeWidth', v.stroke_width,
                    'strokeWidthOn', v.stroke_width_on,
                    'createdAt', v.created_at,
                    'updatedAt', v.updated_at
                )
            ) AS variants
        FROM repositories as r INNER JOIN variants as v ON r.id = v.repository_id
        LEFT JOIN icon_counts as i ON r.id = i.repository_id
        GROUP BY r.id, r.owner, r.name, r.ref, r.created_at, r.last_imported_at, i.icon_count
        ORDER BY r.name ASC
    `;
    log('info', `[DB] getRepositoryVariantsWithIconCount - END (${rows.length} rows)`);
    return rows as unknown as RepositoryVariantsWithIconCount[];
}

export async function getRepositoryVariantsById(repositoryId: number): Promise<RepositoryVariants | null> {
    log('info', '[DB] getRepositoryVariantsById - START', { repositoryId });
    const rows = await sql`
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
                    'stroke', variants.stroke,
                    'strokeOn', variants.stroke_on,
                    'fill', variants.fill,
                    'fillOn', variants.fill_on,
                    'strokeWidth', variants.stroke_width,
                    'strokeWidthOn', variants.stroke_width_on,
                    'createdAt', variants.created_at,
                    'updatedAt', variants.updated_at
                )
            ) AS variants
        FROM repositories INNER JOIN variants ON repositories.id = variants.repository_id
        WHERE repositories.id = ${repositoryId}
        GROUP BY 1, 2, 3, 4, 5, 6
    `;
    log('info', `[DB] getRepositoryVariantsById - END (found: ${rows.length > 0})`);
    return rows.length > 0 ? (rows[0] as RepositoryVariants) : null;
}

export async function getRepositoryById(repositoryId: number): Promise<Repository | null> {
    log('info', '[DB] getRepositoryById - START', { repositoryId });
    const rows = await sql`
        SELECT 
            id,
            owner,
            name,
            ref,
            created_at AS "createdAt",
            last_imported_at AS "lastImportedAt"
        FROM repositories
        WHERE id = ${repositoryId}
    `;
    log('info', `[DB] getRepositoryById - END (found: ${rows.length > 0})`);
    return rows.length > 0 ? (rows[0] as Repository) : null;
}

export async function createRepository(data: {
    owner: string;
    name: string;
    ref: string;
}): Promise<Repository | null> {
    log('info', '[DB] createRepository - START', data);
    const rows = await sql`
        INSERT INTO repositories (owner, name, ref)
        VALUES (${data.owner}, ${data.name}, ${data.ref})
        RETURNING 
            id,
            owner,
            name,
            ref,
            created_at AS "createdAt",
            last_imported_at AS "lastImportedAt"
    `;
    log('info', `[DB] createRepository - END (success: ${!!rows[0]})`);
    return rows[0] ? (rows[0] as Repository) : null;
}

export async function updateRepository(
    data: Partial<Omit<Repository, 'createdAt' | 'id'>> & { id: number }
): Promise<Repository | null> {
    log('info', '[DB] updateRepository - START', { id: data.id });
    const rows = await sql`
        UPDATE repositories
        SET owner = COALESCE(${data.owner ?? null}, owner),
            name = COALESCE(${data.name ?? null}, name),
            ref = COALESCE(${data.ref ?? null}, ref),
            last_imported_at = COALESCE(${data.lastImportedAt ?? null}, last_imported_at)
        WHERE id = ${data.id}
        RETURNING 
            id,
            owner,
            name,
            ref,
            created_at AS "createdAt",
            last_imported_at AS "lastImportedAt"
    `;
    log('info', `[DB] updateRepository - END (success: ${!!rows[0]})`);
    return rows[0] ? (rows[0] as Repository) : null;
}
