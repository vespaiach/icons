import type { SQL } from 'bun';
import repoData from './icon.repositories.yaml';

export const version = '20251228_171007_add_icons_table';

export async function up(sql: SQL): Promise<void> {
    // Write your migration here
    await sql`
        CREATE TABLE IF NOT EXISTS repositories (
            id SERIAL PRIMARY KEY, 
            owner VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            github_id INTEGER NOT NULL UNIQUE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(owner, name)
        );
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS directories (
            id SERIAL PRIMARY KEY, 
            repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
            path VARCHAR(1024) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(repository_id, path)
        );
    `;

    await sql`
        CREATE TABLE icons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            svg_content TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
    `;

    repoData.repos.forEach(async (repo) => {
        await sql`
            INSERT INTO repositories (owner, name, ref, github_id)
            VALUES (${repo.owner}, ${repo.name}, ${repo.ref}, ${repo.github_id})
            ON CONFLICT (github_id) DO NOTHING;
        `;
    });
}

export async function down(sql: SQL): Promise<void> {
    // Write your rollback here
    await sql`
        DROP TABLE IF EXISTS icons;
        DROP TABLE IF EXISTS repositories;
    `;
}
