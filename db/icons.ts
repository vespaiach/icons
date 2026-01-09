import { dbClient } from './db.client';

export async function createIcon(variantId: number, name: string, svgAst: SvgNode): Promise<Icon | null> {
    const rows = await dbClient`
        INSERT INTO icons (variant_id, name, svg_ast)
        VALUES (${variantId}, ${name}, ${svgAst})
        RETURNING *;
    `;
    return rows[0] ? rows[0] : null;
}

export async function deleteIconsByRepositoryId(repositoryId: number) {
    await dbClient`
        DELETE FROM icons
        WHERE variant_id IN (
            SELECT id FROM variants WHERE repository_id = ${repositoryId}
        );
    `;
}

export async function getIconsByRepositoryId(repositoryId: number) {
    const rows = await dbClient`
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
    return rows as IconWithRelativeData[];
}
