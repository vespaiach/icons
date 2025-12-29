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
