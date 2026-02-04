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
            stroke,
            stroke_on AS "strokeOn",
            fill,
            fill_on AS "fillOn",
            stroke_width AS "strokeWidth",
            stroke_width_on AS "strokeWidthOn",
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
            v.stroke,
            v.stroke_on AS "strokeOn",
            v.fill,
            v.fill_on AS "fillOn",
            v.stroke_width AS "strokeWidth",
            v.stroke_width_on AS "strokeWidthOn",
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
            v.stroke,
            v.stroke_on AS "strokeOn",
            v.fill,
            v.fill_on AS "fillOn",
            v.stroke_width AS "strokeWidth",
            v.stroke_width_on AS "strokeWidthOn",
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
    data: Pick<
        Variant,
        'id' | 'path' | 'regex' | 'stroke' | 'strokeOn' | 'fill' | 'fillOn' | 'strokeWidth' | 'strokeWidthOn'
    >
) {
    log('info', '[DB] updateVariant - START', { id: data.id });
    const rows = await sql`
        UPDATE variants
        SET
            regex = ${data.regex},
            stroke = ${data.stroke},
            stroke_on = ${data.strokeOn},
            fill = ${data.fill},
            fill_on = ${data.fillOn},
            stroke_width = ${data.strokeWidth},
            stroke_width_on = ${data.strokeWidthOn},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${data.id}
        RETURNING
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            stroke,
            stroke_on AS "strokeOn",
            fill,
            fill_on AS "fillOn",
            stroke_width AS "strokeWidth",
            stroke_width_on AS "strokeWidthOn",
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
    data: Pick<Variant, 'repositoryId' | 'name' | 'path' | 'regex'> & {
        stroke?: string | null;
        strokeOn?: 'both' | 'parent' | 'children';
        fill?: string | null;
        fillOn?: 'both' | 'parent' | 'children';
        strokeWidth?: string | null;
        strokeWidthOn?: 'both' | 'parent' | 'children';
    }
) {
    log('info', '[DB] createVariant - START', data);
    const rows = await sql`
        INSERT INTO variants (
            repository_id,
            name,
            path,
            regex,
            stroke,
            stroke_on,
            fill,
            fill_on,
            stroke_width,
            stroke_width_on
        )
        VALUES (
            ${data.repositoryId},
            ${data.name},
            ${data.path},
            ${data.regex},
            ${data.stroke ?? null},
            ${data.strokeOn ?? 'parent'},
            ${data.fill ?? null},
            ${data.fillOn ?? 'parent'},
            ${data.strokeWidth ?? null},
            ${data.strokeWidthOn ?? 'parent'}
        )
        RETURNING
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            stroke,
            stroke_on AS "strokeOn",
            fill,
            fill_on AS "fillOn",
            stroke_width AS "strokeWidth",
            stroke_width_on AS "strokeWidthOn",
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
