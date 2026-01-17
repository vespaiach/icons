# Database Query Debugging

## Overview

The application uses **postgres.js** as the database client with built-in debug logging to help monitor and debug SQL operations.

## Features

### 1. Query Logging (postgres.js built-in)

All SQL queries executed through the `sql` client are automatically logged when debug mode is enabled. The postgres.js debug mode logs:

- The SQL query text
- Query parameters/values  
- Execution time
- Connection details

### 2. Function Logging

Each database function logs:
- Function entry with relevant parameters (e.g., IDs, filters)
- Function exit with results summary (e.g., row count, success status)
- Timestamps for performance monitoring

## Enabling Debug Mode

Add the following environment variable to your `.env` file:

```bash
DEBUG_QUERIES=true
```

To disable query logging (default behavior):

```bash
DEBUG_QUERIES=false
# or simply omit the variable
```

## Log Format

### Query Logs (postgres.js format)
```
postgres | SELECT * FROM repositories WHERE id = $1
postgres | Parameters: [1]
postgres | Execution time: 2.34ms
```

### Function Logs

**Entry:**
```
[INFO - 2026-01-17T10:30:45.120Z] [DB] getRepositoryVariantsById - START
{ repositoryId: 1 }
```

**Exit:**
```
[INFO - 2026-01-17T10:30:45.125Z] [DB] getRepositoryVariantsById - END (found: true)
```

## Logged Database Functions

### Repositories (`db/repositories.ts`)
- `getRepositoriesWithVariants()`
- `getRepositoriesWithIconCount()`
- `getRepositoryVariants()`
- `getRepositoryVariantsWithIconCount()`
- `getRepositoryVariantsById(repositoryId)`
- `updateRepository(data)`

### Icons (`db/icons.ts`)
- `createIcon(variantId, name, svgAst)`
- `deleteIconsByRepositoryId(repositoryId)`
- `getIconsByRepositoryId(repositoryId)`

### Variants (`db/variants.ts`)
- `getVariants()`
- `getVariantById(id)`
- `getVariantsWithRepository()`
- `getVariantRepositoryById(id)`
- `updateVariant(data)`
- `updateVariantIconCount(repositoryId)`

### Users (`db/users.ts`)
- `getUserById(id)`
- `getUserByEmail(email)`
- `createUser(data)`

## Performance Monitoring

Use the timestamps in logs to monitor:
- Query execution time
- Function execution time
- Slow queries that may need optimization

## Best Practices

1. **Development**: Enable `DEBUG_QUERIES=true` for debugging
2. **Production**: Keep `DEBUG_QUERIES=false` to reduce log noise
3. **Testing**: Use debug logs to verify database interactions
4. **Monitoring**: Review logs to identify performance bottlenecks

## Example Usage

```bash
# Enable debug mode
export DEBUG_QUERIES=true

# Run your application
bun run dev

# You'll see output like:
[INFO - 2026-01-17T10:30:45.120Z] [DB] getRepositoriesWithVariants - START
postgres | SELECT repositories.id, repositories.owner, ...
postgres | Execution time: 3.21ms
[INFO - 2026-01-17T10:30:45.145Z] [DB] getRepositoriesWithVariants - END (5 rows)
```

## Implementation Details

### postgres.js Client

The application uses **postgres.js** ([github.com/porsager/postgres](https://github.com/porsager/postgres)) as the PostgreSQL client. 

Configuration in [db/db.client.ts](../db/db.client.ts):
```typescript
import postgres from 'postgres';

const sql = postgres(DATABASE_URL, {
    debug: DEBUG_QUERIES,
    onnotice: DEBUG_QUERIES ? (notice) => console.log('[SQL Notice]', notice) : undefined,
});
```

### Benefits of postgres.js

- **Built-in debug mode**: No custom proxy needed
- **Performance**: Fast and lightweight
- **Type-safe**: Full TypeScript support
- **Tagged templates**: Clean SQL syntax with automatic parameter escaping
- **Connection pooling**: Automatic connection management

### Log Helper

Function entry/exit logging uses the centralized `log()` function from [utils/log.helpers.ts](../utils/log.helpers.ts), which:
- Formats messages with severity level and timestamp
- Supports optional context objects
- Can be extended to integrate with external logging services

## Troubleshooting

**Logs not appearing?**
- Verify `DEBUG_QUERIES=true` in your `.env` file
- Check that the application has been restarted after changing the env var
- Ensure console output is visible (not redirected)

**Too much log noise?**
- Set `DEBUG_QUERIES=false` to disable SQL query logging
- Function entry/exit logs will still appear (always enabled)

## Migration Notes

When creating migrations, use `any` type for the SQL parameter to support both regular and transaction contexts:

```typescript
export async function up(sql: any): Promise<void> {
    await sql`CREATE TABLE ...`;
}
```
