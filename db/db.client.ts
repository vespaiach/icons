import postgres from 'postgres';

// Use a singleton pattern to prevent connection leaks during hot reload
const globalForDb = globalThis as unknown as {
    sql: ReturnType<typeof postgres> | undefined;
};

const DEBUG_QUERIES = Bun.env.DEBUG_QUERIES === 'true';

export const sql =
    globalForDb.sql ??
    postgres(Bun.env.DATABASE_URL, {
        debug: DEBUG_QUERIES
            ? (_connection, query, params, _types) => {
                  console.log('[SQL Query]', query);
                  if (params && params.length > 0) {
                      console.log('[SQL Params]', params);
                  }
              }
            : undefined,
        onnotice: DEBUG_QUERIES ? (notice) => console.log('[SQL Notice]', notice) : undefined
    });

if (process.env.NODE_ENV !== 'production') {
    globalForDb.sql = sql;
}

// Export as dbClient for backward compatibility
export const dbClient = sql;
