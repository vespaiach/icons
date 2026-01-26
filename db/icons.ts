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
        RETURNING id, name, svg_ast AS "svgAst";
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
            i.svg_ast AS "svgAst"
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

export async function getIconsByVariantId(variantId: number) {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
    log('info', '[DB] getIconsByVariantId - START', { variantId });
    const rows = await sql`
        SELECT 
            i.id,
            i.variant_id AS "variantId",
            v.repository_id AS "repositoryId",
            i.name,
            i.svg_ast AS "svgAst"
        FROM icons i INNER JOIN variants v ON i.variant_id = v.id
        WHERE i.variant_id = ${variantId}
        ORDER BY i.name ASC
    `;
    log('info', `[DB] getIconsByVariantId - END (${rows.length} rows)`);
    if (Bun.env.DEBUG_QUERIES === 'true' && rows.length > 0) {
        log('info', `[DB] getIconsByVariantId - SAMPLE RESULT (first row)`, rows[0]);
    }
    return rows as unknown as IconWithRelativeData[];
}

export async function getIconsByIds(iconIds: number[]) {
    log('info', '[DB] getIconsByIds - START', { count: iconIds.length });
    const rows = await sql`
        SELECT 
            i.id,
            i.variant_id AS "variantId",
            i.name,
            i.svg_ast AS "svgAst",
            v.name AS "variantName",
            v.stroke,
            v.fill,
            v.stroke_width AS "strokeWidth",
            v.color_on_children AS "colorOnChildren"
        FROM icons i
        INNER JOIN variants v ON i.variant_id = v.id
        WHERE i.id = ANY(${iconIds})
        ORDER BY i.name ASC
    `;
    log('info', `[DB] getIconsByIds - END (${rows.length} rows)`);
    if (Bun.env.DEBUG_QUERIES === 'true' && rows.length > 0) {
        log('info', `[DB] getIconsByIds - SAMPLE RESULT (first row)`, rows[0]);
    }
    return rows as unknown as Array<
        Icon & {
            variantId: number;
            variantName: string;
            stroke: string | null;
            fill: string | null;
            strokeWidth: string | null;
            colorOnChildren: boolean;
        }
    >;
}
