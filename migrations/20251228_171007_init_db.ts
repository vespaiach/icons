import type { SQL } from 'bun';
import repoData from './icon.repositories.yaml';

export const version = '20251228_171007_init_db';

export async function up(sql: SQL): Promise<void> {
    // Write your migration here
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            hashed_password VARCHAR(255) NOT NULL,
            profile_picture_url VARCHAR(1024),
            deleted_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS repositories (
            id SERIAL PRIMARY KEY, 
            owner VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            ref VARCHAR(255) NOT NULL,
            github_id INTEGER NOT NULL UNIQUE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            last_imported_at TIMESTAMPTZ,
            UNIQUE(owner, name)
        );
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS directories (
            id SERIAL PRIMARY KEY, 
            repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
            variant VARCHAR(255) NOT NULL,
            path VARCHAR(1024) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(repository_id, path)
        );
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS icons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            directory_id INTEGER REFERENCES directories(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            svg_attributes JSONB NOT NULL,
            svg_content TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
    `;

    for (const repo of repoData.repos) {
        const result = await sql`
            INSERT INTO repositories (owner, name, ref, github_id)
            VALUES (${repo.owner}, ${repo.name}, ${repo.ref}, ${repo.github_id})
            ON CONFLICT (github_id) DO NOTHING
            RETURNING id;
        `;

        if (result.length > 0) {
            const repoId = result[0].id;
            for (const dir of repo.directories) {
                await sql`
                    INSERT INTO directories (repository_id, variant, path)
                    VALUES (${repoId}, ${dir.variant}, ${dir.path})
                    ON CONFLICT (repository_id, path) DO NOTHING;
                `;
            }
        }
    }

    const hashedPassword = await Bun.password.hash('LegMeIn1!');
    await sql`
        INSERT INTO users (email, name, hashed_password)
        VALUES ('nta.toan@gmail.com', 'Toan Nguyen', ${hashedPassword});
    `;
}

export async function down(sql: SQL): Promise<void> {
    // Write your rollback here
    await sql`
        DROP TABLE IF EXISTS icons;
        DROP TABLE IF EXISTS directories;
        DROP TABLE IF EXISTS repositories;
        DROP TABLE IF EXISTS users;
    `;
}
