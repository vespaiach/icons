import { dbClient } from './db.client';

export async function createIcon(
    directoryId: number,
    name: string,
    svgContent: string
): Promise<Icon | null> {
    const rows = await dbClient`
        INSERT INTO icons (directory_id, name, svg_content)
        VALUES (${directoryId}, ${name}, ${svgContent})
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
            d.id AS "directoryId",
            i.name,
            i.svg_content AS "svgContent",
            d.variant,
            i.created_at AS "createdAt"
        FROM icons i
        JOIN directories d ON i.directory_id = d.id
        WHERE d.repository_id = ${repositoryId};
    `;
    return rows as IconWithDirectoryVariant[];
}