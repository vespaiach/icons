import repoData from './more-repositories.yaml';

export const version = '20260114_192537_add_more_repos';

// biome-ignore lint/suspicious/noExplicitAny: Migration functions need to work with both Sql and TransactionSql
export async function up(sql: any): Promise<void> {
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
}

// biome-ignore lint/suspicious/noExplicitAny: Migration functions need to work with both Sql and TransactionSql
export async function down(_sql: any): Promise<void> {
    // Rollback by deleting the repositories added in this migration
    // Note: This will also cascade delete related variants and icons
}
