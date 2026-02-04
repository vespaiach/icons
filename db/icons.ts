import { log } from '../utils/log.helpers';
import { sql } from './db.client';

/**
 * COMPACT AST FORMAT
 *
 * All SVG icons use compact AST format throughout the application:
 * - Database storage (shorter property names)
 * - Network transmission (smaller bandwidth)
 * - Application usage (direct usage without conversion)
 *
 * SvgNode structure: { i: id, t: type, a: attrs, c: children }
 */

export async function createIcon(variantId: number, name: string, svgText: string): Promise<Icon | null> {
    log('info', '[DB] createIcon - START', { variantId, name });
    const rows = await sql`
        INSERT INTO icons (variant_id, name, svg_text)
        VALUES (${variantId}, ${name}, ${svgText})
        RETURNING id, name, svg_text AS "svgText";
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

export async function getIconsByRepositoryId(repositoryId: number): Promise<IconWithRelativeData[]> {
    log('info', '[DB] getIconsByRepositoryId - START', { repositoryId });
    const rows = await sql`
        SELECT 
            i.id,
            i.variant_id AS "variantId",
            v.repository_id AS "repositoryId",
            i.name,
            i.svg_text AS "svgText"
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

export async function getIconsByVariantId(variantId: number): Promise<IconWithRelativeData[]> {
    // await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
    log('info', '[DB] getIconsByVariantId - START', { variantId });
    const rows = await sql`
        SELECT 
            i.id,
            i.variant_id AS "variantId",
            v.repository_id AS "repositoryId",
            i.name,
            i.svg_text AS "svgText"
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
            i.svg_text AS "svgText",
            v.name AS "variantName",
            v.stroke,
            v.stroke_on AS "strokeOn",
            v.fill,
            v.fill_on AS "fillOn",
            v.stroke_width AS "strokeWidth",
            v.stroke_width_on AS "strokeWidthOn"
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
            strokeOn: 'both' | 'parent' | 'children';
            fill: string | null;
            fillOn: 'both' | 'parent' | 'children';
            strokeWidth: string | null;
            strokeWidthOn: 'both' | 'parent' | 'children';
        }
    >;
}
