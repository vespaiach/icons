import repoData from './icon.repositories.yaml';

export const version = '20251228_171007_init_db';

// biome-ignore lint/suspicious/noExplicitAny: Migration functions need to work with both Sql and TransactionSql
export async function up(sql: any): Promise<void> {
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
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            last_imported_at TIMESTAMPTZ,
            UNIQUE(owner, name)
        );
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS variants (
            id SERIAL PRIMARY KEY, 
            repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            path VARCHAR(1024) NOT NULL,
            regex VARCHAR(255) NOT NULL DEFAULT '\\.svg$',
            attributes_to_adjust VARCHAR(63)[] DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS icons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            variant_id INTEGER REFERENCES variants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            svg_ast JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    `;

    for (const repo of repoData.repos) {
        const result = await sql`
            INSERT INTO repositories (owner, name, ref)
            VALUES (${repo.owner}, ${repo.name}, ${repo.ref})
            ON CONFLICT (owner, name) DO NOTHING
            RETURNING id;
        `;

        if (result.length > 0) {
            const repoId = result[0].id;
            for (const dir of repo.variants) {
                await sql`
                    INSERT INTO variants (repository_id, name, path, regex)
                    VALUES (${repoId}, ${dir.name}, ${dir.path}, ${dir.regex ?? '\\.svg$'});
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

// biome-ignore lint/suspicious/noExplicitAny: Migration functions need to work with both Sql and TransactionSql
export async function down(sql: any): Promise<void> {
    // Write your rollback here
    await sql`
        DROP TABLE IF EXISTS icons;
        DROP TABLE IF EXISTS variants;
        DROP TABLE IF EXISTS repositories;
        DROP TABLE IF EXISTS users;
    `;
}
