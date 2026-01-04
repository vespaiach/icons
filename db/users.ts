import { dbClient } from './db.client';

export async function getUserById(id: number) {
    const row = await dbClient`
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
    return row[0] ? (row[0] as User) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const row = await dbClient`
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
    return row[0] ? (row[0] as User) : null;
}

export async function createUser(data: {
    name: string;
    profilePictureUrl?: string | null;
    email: string;
    hashedPassword: string;
}): Promise<User | null> {
    const row = await dbClient`
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
    return row[0];
}
