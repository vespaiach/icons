import { log } from '../utils/log.helpers';
import { sql } from './db.client';

export async function getVariants(): Promise<Variant[]> {
    log('info', '[DB] getVariants - START');
    const rows = await sql`
        SELECT 
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            stroke,
            fill,
            stroke_width AS "strokeWidth",
            icon_count AS "iconCount",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        FROM variants
        ORDER BY id ASC
    `;
    log('info', `[DB] getVariants - END (${rows.length} rows)`);
    if (Bun.env.DEBUG_QUERIES === 'true' && rows.length > 0) {
        log('info', `[DB] getVariants - SAMPLE RESULT (first row)`, rows[0]);
    }
    return rows as unknown as Variant[];
}

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
            fill,
            stroke_width AS "strokeWidth",
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
            v.fill,
            v.stroke_width AS "strokeWidth",
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
            v.fill,
            v.stroke_width AS "strokeWidth",
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
    data: Pick<Variant, 'id' | 'path' | 'regex' | 'stroke' | 'fill' | 'strokeWidth'>
) {
    log('info', '[DB] updateVariant - START', { id: data.id });
    const rows = await sql`
        UPDATE variants
        SET
            regex = ${data.regex},
            stroke = ${data.stroke},
            fill = ${data.fill},
            stroke_width = ${data.strokeWidth},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${data.id}
        RETURNING
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            stroke,
            fill,
            stroke_width AS "strokeWidth",
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
