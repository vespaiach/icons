import { log } from '../utils/log.helpers';
import { sql } from './db.client';

export async function getUserById(id: number) {
    log('info', '[DB] getUserById - START', { id });
    const row = await sql`
        SELECT 
            id,
            email,
            name,
            hashed_password as "hashedPassword",
            profile_picture_url as "profilePictureUrl",
            deleted_at as "deletedAt",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM users
        WHERE 
            id = ${id}
            AND deleted_at IS NULL
    `;
    log('info', `[DB] getUserById - END (found: ${!!row[0]})`);
    if (Bun.env.DEBUG_QUERIES === 'true' && row[0]) {
        // biome-ignore lint/correctness/noUnusedVariables: Used in destructuring to exclude sensitive data
        const { hashedPassword, ...safeUser } = row[0] as User;
        log('info', '[DB] getUserById - RESULT (password hidden)', safeUser);
    }
    return row[0] ? (row[0] as User) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    log('info', '[DB] getUserByEmail - START', { email });
    const row = await sql`
        SELECT 
            id,
            email,
            hashed_password as "hashedPassword",
            name,
            profile_picture_url as "profilePictureUrl",
            deleted_at as "deletedAt",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM users
        WHERE
            email = ${email}
            AND deleted_at IS NULL;
    `;
    log('info', `[DB] getUserByEmail - END (found: ${!!row[0]})`);
    if (Bun.env.DEBUG_QUERIES === 'true' && row[0]) {
        // biome-ignore lint/correctness/noUnusedVariables: Used in destructuring to exclude sensitive data
        const { hashedPassword, ...safeUser } = row[0] as User;
        log('info', '[DB] getUserByEmail - RESULT (password hidden)', safeUser);
    }
    return row[0] ? (row[0] as User) : null;
}

export async function createUser(data: {
    name: string;
    profilePictureUrl?: string | null;
    email: string;
    hashedPassword: string;
}): Promise<User | null> {
    log('info', '[DB] createUser - START', { email: data.email, name: data.name });
    const row = await sql`
        INSERT INTO users (
            email,
            name,
            hashed_password,
            profile_picture_url
        )
        VALUES (
            ${data.email},
            ${data.name},
            ${data.hashedPassword},
            ${data.profilePictureUrl ?? null},
        )
        RETURNING 
            id,
            email,
            name,
            profile_picture_url as "profilePictureUrl",
            hashed_password as "hashedPassword",
            deleted_at as "deletedAt",
            created_at as "createdAt",
            updated_at as "updatedAt";
    `;
    log('info', `[DB] createUser - END (success: ${!!row[0]})`);
    if (Bun.env.DEBUG_QUERIES === 'true' && row[0]) {
        // biome-ignore lint/correctness/noUnusedVariables: Used in destructuring to exclude sensitive data
        const { hashedPassword, ...safeUser } = row[0] as User;
        log('info', '[DB] createUser - RESULT (password hidden)', safeUser);
    }
    return row[0] as User;
}
