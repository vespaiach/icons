import { SQL } from 'bun';

// Use a singleton pattern to prevent connection leaks during hot reload
const globalForDb = globalThis as unknown as {
    dbClient: SQL | undefined;
};

export const dbClient = globalForDb.dbClient ?? new SQL(Bun.env.DATABASE_URL);

if (process.env.NODE_ENV !== 'production') {
    globalForDb.dbClient = dbClient;
}
