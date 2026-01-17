import { log } from '../utils/log.helpers';
import { sql } from './db.client';

export async function createIcon(variantId: number, name: string, svgAst: SvgNode): Promise<Icon | null> {
    log('info', '[DB] createIcon - START', { variantId, name });
    const rows = await sql`
        INSERT INTO icons (variant_id, name, svg_ast)
        VALUES (${variantId}, ${name}, ${
            // biome-ignore lint/suspicious/noExplicitAny: SvgNode structure doesn't match JSONValue type exactly
            sql.json(svgAst as any)
        })
        RETURNING *;
    `;
    log('info', `[DB] createIcon - END (success: ${!!rows[0]})`);
    if (Bun.env.DEBUG_QUERIES === 'true' && rows[0]) {
        log('info', '[DB] createIcon - RESULT', rows[0]);
    }
    return rows[0] ? (rows[0] as Icon) : null;
}

export async function deleteIconsByRepositoryId(repositoryId: number) {
    log('info', '[DB] deleteIconsByRepositoryId - START', { repositoryId });
    await sql`
        DELETE FROM icons
        WHERE variant_id IN (
            SELECT id FROM variants WHERE repository_id = ${repositoryId}
        );
    `;
    log('info', '[DB] deleteIconsByRepositoryId - END');
}

export async function getIconsByRepositoryId(repositoryId: number) {
    log('info', '[DB] getIconsByRepositoryId - START', { repositoryId });
    const rows = await sql`
        SELECT 
            i.id,
            i.variant_id AS "variantId",
            v.repository_id AS "repositoryId",
            i.name,
            i.svg_ast AS "svgAst",
            i.created_at AS "createdAt"
        FROM icons i INNER JOIN variants v ON i.variant_id = v.id
        WHERE v.repository_id = ${repositoryId}
        ORDER BY i.name ASC
    `;
    log('info', `[DB] getIconsByRepositoryId - END (${rows.length} rows)`);
    if (Bun.env.DEBUG_QUERIES === 'true' && rows.length > 0) {
        log('info', `[DB] getIconsByRepositoryId - SAMPLE RESULT (first row)`, rows[0]);
    }
    return rows as unknown as IconWithRelativeData[];
}
