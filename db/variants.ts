import { log } from '../utils/log.helpers';
import { sql } from './db.client';

export async function getVariantById(id: number): Promise<Variant | null> {
    log('info', '[DB] getVariantById - START', { id });
    const rows = await sql`
        SELECT 
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            color_on AS "colorOn",
            none_color_on AS "noneColorOn",
            replacements,
            icon_count AS "iconCount",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        FROM variants
        WHERE id = ${id}
        LIMIT 1
    `;
    log('info', `[DB] getVariantById - END (found: ${rows.length > 0})`);
    if (Bun.env.DEBUG_QUERIES === 'true' && rows[0]) {
        log('info', '[DB] getVariantById - RESULT', rows[0]);
    }
    return rows.length > 0 ? (rows[0] as unknown as Variant) : null;
}

export async function getVariantsWithRepository(): Promise<VariantWithRepository[]> {
    log('info', '[DB] getVariantsWithRepository - START');
    const rows = await sql`
        SELECT 
            v.id,
            v.repository_id AS "repositoryId",
            v.name,
            v.path,
            v.regex,
            v.color_on AS "colorOn",
            v.none_color_on AS "noneColorOn",
            v.replacements,
            v.icon_count AS "iconCount",
            v.created_at AS "createdAt",
            v.updated_at AS "updatedAt",
            r.owner AS "repositoryOwner",
            r.name AS "repositoryName"
        FROM variants v
        INNER JOIN repositories r ON v.repository_id = r.id
        ORDER BY v.id ASC
    `;
    log('info', `[DB] getVariantsWithRepository - END (${rows.length} rows)`);
    return rows as unknown as VariantWithRepository[];
}

export async function getVariantRepositoryById(
    id: number
): Promise<(Variant & { repository: Repository }) | null> {
    log('info', '[DB] getVariantRepositoryById - START', { id });
    const rows = await sql`
        SELECT 
            v.id,
            v.repository_id AS "repositoryId",
            v.name,
            v.path,
            v.regex,
            v.color_on AS "colorOn",
            v.none_color_on AS "noneColorOn",
            v.replacements,
            v.icon_count AS "iconCount",
            v.created_at AS "createdAt",
            v.updated_at AS "updatedAt",
            json_build_object(
                'id', r.id,
                'owner', r.owner,
                'name', r.name,
                'ref', r.ref,
                'lastImportedAt', r.last_imported_at,
                'createdAt', r.created_at
            ) AS repository
        FROM variants as v
        INNER JOIN repositories r ON v.repository_id = r.id
        WHERE v.id = ${id}
        LIMIT 1
    `;
    log('info', `[DB] getVariantRepositoryById - END (found: ${rows.length > 0})`);
    return rows.length > 0 ? (rows[0] as unknown as Variant & { repository: Repository }) : null;
}

export async function updateVariant(
    data: Pick<Variant, 'id' | 'path' | 'regex' | 'colorOn' | 'noneColorOn' | 'replacements'>
) {
    log('info', '[DB] updateVariant - START', { id: data.id });
    const rows = await sql`
        UPDATE variants
        SET
            path = ${data.path},
            regex = ${data.regex},
            color_on = ${data.colorOn},
            none_color_on = ${data.noneColorOn},
            replacements = ${data.replacements},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${data.id}
        RETURNING
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            color_on AS "colorOn",
            none_color_on AS "noneColorOn",
            replacements,
            icon_count AS "iconCount",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
    `;
    log('info', `[DB] updateVariant - END (success: ${rows.length > 0})`);
    if (Bun.env.DEBUG_QUERIES === 'true' && rows[0]) {
        log('info', '[DB] updateVariant - RESULT', rows[0]);
    }
    return rows.length > 0 ? (rows[0] as unknown as Variant) : null;
}

export async function createVariant(
    data: Pick<
        Variant,
        'repositoryId' | 'name' | 'path' | 'regex' | 'colorOn' | 'noneColorOn' | 'replacements'
    >
) {
    log('info', '[DB] createVariant - START', data);
    const rows = await sql`
        INSERT INTO variants (
            repository_id,
            name,
            path,
            regex,
            color_on,
            none_color_on,
            replacements
        )
        VALUES (
            ${data.repositoryId},
            ${data.name},
            ${data.path},
            ${data.regex},
            ${data.colorOn},
            ${data.noneColorOn},
            ${data.replacements}
        )
        RETURNING
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            color_on AS "colorOn",
            none_color_on AS "noneColorOn",
            replacements,
            icon_count AS "iconCount",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
    `;
    log('info', `[DB] createVariant - END (success: ${rows.length > 0})`);
    if (Bun.env.DEBUG_QUERIES === 'true' && rows[0]) {
        log('info', '[DB] createVariant - RESULT', rows[0]);
    }
    return rows.length > 0 ? (rows[0] as unknown as Variant) : null;
}

export async function updateVariantIconCount(repositoryId: number) {
    log('info', '[DB] updateVariantIconCount - START', { repositoryId });
    await sql`
        UPDATE variants
        SET icon_count = (
            SELECT COUNT(*)
            FROM icons
            WHERE icons.variant_id = variants.id
        )
        WHERE repository_id = ${repositoryId}
    `;
    log('info', '[DB] updateVariantIconCount - END');
}
