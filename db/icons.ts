import { dbClient } from './db.client';

export async function createIcon(
    directoryId: number,
    name: string,
    svgAttributes: Record<string, string>,
    svgContent: string
): Promise<Icon | null> {
    const rows = await dbClient`
        INSERT INTO icons (directory_id, name, svg_content, svg_attributes)
        VALUES (${directoryId}, ${name}, ${svgContent}, ${svgAttributes})
        RETURNING *;
    `;
    return rows[0] ? rows[0] : null;
}

export async function deleteIconsByRepositoryId(repositoryId: number) {
    await dbClient`
        DELETE FROM icons
        WHERE directory_id IN (
            SELECT id FROM directories WHERE repository_id = ${repositoryId}
        );
    `;
}

export async function getIconsByRepositoryId(repositoryId: number) {
    const rows = await dbClient`
        SELECT 
            i.id,
            i.directory_id AS "directoryId",
            i.name,
            i.svg_content AS "svgContent",
            i.svg_attributes AS "svgAttributes",
            i.created_at AS "createdAt"
        FROM icons i INNER JOIN directories d ON i.directory_id = d.id
        WHERE d.repository_id = ${repositoryId}
        ORDER BY i.name ASC
    `;
    return rows as Icon[];
}