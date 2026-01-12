import { sql } from 'bun';
import { dbClient } from './db.client';

export async function getVariants(): Promise<Variant[]> {
    const rows = await dbClient`
        SELECT 
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            attributes_to_adjust AS "attributesToAdjust",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        FROM variants
        ORDER BY id ASC
    `;
    return rows as Variant[];
}

export async function getVariantById(id: number): Promise<Variant | null> {
    const rows = await dbClient`
        SELECT 
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            attributes_to_adjust AS "attributesToAdjust",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        FROM variants
        WHERE id = ${id}
        LIMIT 1
    `;
    return rows.length > 0 ? (rows[0] as Variant) : null;
}

export async function getVariantsWithRepository(): Promise<VariantWithRepository[]> {
    const rows = await dbClient`
        SELECT 
            v.id,
            v.repository_id AS "repositoryId",
            v.name,
            v.path,
            v.regex,
            v.attributes_to_adjust AS "attributesToAdjust",
            v.created_at AS "createdAt",
            v.updated_at AS "updatedAt",
            r.owner AS "repositoryOwner",
            r.name AS "repositoryName"
        FROM variants v
        INNER JOIN repositories r ON v.repository_id = r.id
        ORDER BY v.id ASC
    `;
    return rows as VariantWithRepository[];
}

export async function getVariantRepositoryById(
    id: number
): Promise<(Variant & { repository: Repository }) | null> {
    const rows = await dbClient`
        SELECT 
            v.id,
            v.repository_id AS "repositoryId",
            v.name,
            v.path,
            v.regex,
            v.attributes_to_adjust AS "attributesToAdjust",
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
    return rows.length > 0 ? (rows[0] as Variant & { repository: Repository }) : null;
}

export async function updateVariant(data: Pick<Variant, 'id' | 'path' | 'regex' | 'attributesToAdjust'>) {
    const rows = await dbClient`
        UPDATE variants
        SET 
            regex = ${data.regex},
            attributes_to_adjust = ${sql.array(data.attributesToAdjust, 'text')},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${data.id}
        RETURNING 
            id,
            repository_id AS "repositoryId",
            name,
            path,
            regex,
            attributes_to_adjust AS "attributesToAdjust",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
    `;
    return rows.length > 0 ? (rows[0] as Variant) : null;
}
