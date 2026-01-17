import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import postgres, { type Sql } from 'postgres';

interface Migration {
    id: number;
    version: string;
    executed_at: Date;
}

interface MigrationFile {
    version: string;
    name: string;
    // biome-ignore lint/suspicious/noExplicitAny: Migration functions need to work with both Sql and TransactionSql
    up: (sql: any) => Promise<void>;
    // biome-ignore lint/suspicious/noExplicitAny: Migration functions need to work with both Sql and TransactionSql
    down: (sql: any) => Promise<void>;
}

const MIGRATION_DIR = './migrations';

export class MigrationService {
    sql: Sql;
    private verbose: boolean;

    constructor(verbose: boolean = false) {
        this.sql = postgres(Bun.env.DATABASE_URL);
        this.verbose = verbose;
    }

    private log(message: string): void {
        if (this.verbose) {
            console.log(message);
        }
    }

    private logError(message: string, error?: unknown): void {
        if (this.verbose) {
            console.error(message);
            if (error) {
                console.error(error);
            }
        }
    }

    async initialize(): Promise<void> {
        // Create migrations directory if it doesn't exist
        if (!existsSync(MIGRATION_DIR)) {
            mkdirSync(MIGRATION_DIR, { recursive: true });
        }

        // Create migrations tracking table
        await this.sql`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                version VARCHAR(511) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
    }

    async getExecutedMigrations(): Promise<Migration[]> {
        const result = await this.sql`
            SELECT id, version, executed_at 
            FROM schema_migrations 
            ORDER BY version ASC
        `;
        return result as Migration[];
    }

    async getPendingMigrations(): Promise<string[]> {
        const executed = await this.getExecutedMigrations();
        const executedVersions = new Set(executed.map((m) => m.version));

        const files = readdirSync(MIGRATION_DIR)
            .filter((f) => f.endsWith('.ts') && !f.includes('migration.service'))
            .sort();

        return files.filter((f) => !executedVersions.has(f.replace(/\.(ts|js)$/, '')));
    }

    async migrate(steps?: number): Promise<void> {
        await this.initialize();

        const pending = await this.getPendingMigrations();
        const toExecute = steps ? pending.slice(0, steps) : pending;

        if (toExecute.length === 0) {
            this.log('✓ No pending migrations');
            return;
        }

        this.log(`Running ${toExecute.length} migration(s)...\n`);

        for (const file of toExecute) {
            const version = file.replace(/\.(ts|js)$/, '');
            const filePath = resolve(join(MIGRATION_DIR, file));

            try {
                const migration: MigrationFile = await import(filePath);

                this.log(`→ Migrating: ${version}`);

                // biome-ignore lint/suspicious/noExplicitAny: TransactionSql type varies and needs flexible typing
                await this.sql.begin(async (txn: any) => {
                    await migration.up(txn);
                    await txn`INSERT INTO schema_migrations (version) VALUES (${version})`;
                });

                this.log(`✓ Migrated: ${version}\n`);
            } catch (error) {
                this.logError(`✗ Failed to migrate: ${version}`, error);
                throw error;
            }
        }

        this.log('✓ All migrations completed successfully');
    }

    async rollback(steps: number = 1): Promise<void> {
        await this.initialize();

        const executed = await this.getExecutedMigrations();

        if (executed.length === 0) {
            this.log('✓ No migrations to rollback');
            return;
        }

        const toRollback = executed.slice(-steps).reverse();

        this.log(`Rolling back ${toRollback.length} migration(s)...\n`);

        for (const record of toRollback) {
            const version = record.version;
            const file = readdirSync(MIGRATION_DIR).find((f) => f.startsWith(version));

            if (!file) {
                this.logError(`✗ Migration file not found for: ${version}`);
                continue;
            }

            const filePath = resolve(join(MIGRATION_DIR, file));

            try {
                const migration: MigrationFile = await import(filePath);

                this.log(`→ Rolling back: ${version}`);

                // biome-ignore lint/suspicious/noExplicitAny: TransactionSql type varies and needs flexible typing
                await this.sql.begin(async (txn: any) => {
                    await migration.down(txn);
                    await txn`DELETE FROM schema_migrations WHERE version = ${version}`;
                });

                this.log(`✓ Rolled back: ${version}\n`);
            } catch (error) {
                this.logError(`✗ Failed to rollback: ${version}`, error);
                throw error;
            }
        }

        this.log('✓ All rollbacks completed successfully');
    }

    async status(): Promise<void> {
        await this.initialize();

        const executed = await this.getExecutedMigrations();
        const pending = await this.getPendingMigrations();

        this.log('\n=== Migration Status ===\n');

        if (executed.length > 0) {
            this.log('Executed migrations:');
            executed.forEach((m) => {
                this.log(`  ✓ ${m.version} (${m.executed_at.toISOString()})`);
            });
        } else {
            this.log('No executed migrations');
        }

        this.log('');

        if (pending.length > 0) {
            this.log('Pending migrations:');
            pending.forEach((p) => {
                this.log(`  ○ ${p.replace(/\.(ts|js)$/, '')}`);
            });
        } else {
            this.log('No pending migrations');
        }

        this.log('');
    }

    async create(name: string): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');

        const filename = `${timestamp}_${name}.ts`;
        const filepath = join(MIGRATION_DIR, filename);

        const template = `import { SQL } from 'bun';

export const version = '${timestamp}_${name}';

export async function up(sql: SQL): Promise<void> {
    // Write your migration here
    await sql\`
        -- Example: CREATE TABLE users (
        --   id SERIAL PRIMARY KEY,
        --   email VARCHAR(255) NOT NULL UNIQUE,
        --   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        -- )
    \`;
}

export async function down(sql: SQL): Promise<void> {
    // Write your rollback here
    await sql\`
        -- Example: DROP TABLE IF EXISTS users
    \`;
}
`;

        await Bun.write(filepath, template);
        this.log(`✓ Created migration: ${filename}`);
    }

    async close(): Promise<void> {
        await this.sql.end();
    }
}

// CLI interface
if (import.meta.main) {
    const args = process.argv.slice(2);
    const verbose = args.includes('--verbose') || args.includes('-v');
    const filteredArgs = args.filter((arg) => arg !== '--verbose' && arg !== '-v');
    const command = filteredArgs[0];

    const service = new MigrationService(verbose);

    try {
        switch (command) {
            case 'migrate': {
                const steps = filteredArgs[1] ? parseInt(filteredArgs[1], 10) : undefined;
                await service.migrate(steps);
                break;
            }

            case 'rollback': {
                const rollbackSteps = filteredArgs[1] ? parseInt(filteredArgs[1], 10) : 1;
                await service.rollback(rollbackSteps);
                break;
            }

            case 'status':
                await service.status();
                break;

            case 'create': {
                const name = filteredArgs[1];
                if (!name) {
                    console.error('Please provide a migration name');
                    process.exit(1);
                }
                await service.create(name);
                break;
            }

            default:
                console.log(`
Usage:
  bun run migrations/migration-service.ts <command> [options]

Commands:
  migrate [steps]    - Run pending migrations (optionally specify number of steps)
  rollback [steps]   - Rollback migrations (default: 1 step)
  status             - Show migration status
  create <name>      - Create a new migration file

Options:
  --verbose, -v      - Enable verbose logging

Environment:
  DATABASE_URL       - PostgreSQL connection string
        `);
        }
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await service.close();
        process.exit(0);
    }
}
