# Copilot Instructions for Icons Management App

## Project Architecture

This is a **Next.js 16 App Router** application for managing and browsing SVG icons from GitHub repositories. Built with Bun runtime, using **Bun's native SQL driver** for PostgreSQL.

### Route Structure

- **(external)/icons**: Public icon browsing interface with search and filtering
- **(internal)/dashboard**: Protected admin area for repository management and icon imports

Routes prefixed with `(external)` and `(internal)` are **route groups** - the parentheses are excluded from the URL path.

### Data Flow Pattern

The app uses **server actions as the data layer**, not API routes. Example pattern from [app/(external)/icons/page.tsx](app/(external)/icons/page.tsx):

```tsx
const repositoriesMapPromise = getRepositoriesAction(); // Server action returns promise
<IconsContainer repositoriesMapPromise={repositoriesMapPromise} /> // Pass promise directly
```

Components unwrap promises using React's `use()` hook or streaming patterns. See [app/(external)/icons/\_components/IconsContainer/IconsContent.tsx](app/(external)/icons/_components/IconsContainer/IconsContent.tsx).

## Database Layer

### Bun SQL Client

Uses **Bun's native SQL driver** via `new SQL(Bun.env.DATABASE_URL)` (see [db/db.client.ts](db/db.client.ts)). Query syntax uses **tagged templates**:

```typescript
await dbClient`SELECT * FROM icons WHERE variant_id = ${variantId}`;
```

### Migration System

Custom migration system in [utils/migration.service.ts](utils/migration.service.ts):

- `bun run migrate:create` - Generate new timestamped migration
- `bun run migrate` - Run pending migrations
- Migrations are TypeScript files with `up()` and `down()` functions (see [migrations/20251228_171007_init_db.ts](migrations/20251228_171007_init_db.ts))

### Schema Overview

- **repositories**: GitHub repo metadata (owner, name, ref, github_id)
- **variants**: Multiple icon variants per repo (e.g., "outline", "solid") - each variant has name, path, and regex for matching SVG files
- **icons**: Parsed SVG data with attributes stored as JSONB, linked to variants via variant_id
- **users**: Admin authentication

## Authentication Pattern

Uses **iron-session** with Bun environment variables. Session logic in [utils/session.ts](utils/session.ts):

```typescript
await getAuthSession(); // Throws redirect if not authenticated
await retrieveUserFromSession(); // Returns user object or redirects
```

Cookie-based auth with `COOKIE_SECRET` and `COOKIE_MAX_AGE` env vars. Protected routes call `retrieveUserFromSession()` at page level.

## Icon Import Workflow

Repository imports happen in [app/(internal)/dashboard/icon-repositories/actions.ts](app/(internal)/dashboard/icon-repositories/actions.ts):

1. Downloads GitHub repo as ZIP using `codeload.github.com`
2. Extracts to `/tmp` directory
3. Scans variants (icon directories) defined in database for SVG files
4. Parses each SVG: extracts root attributes (width/height/viewBox) + inner content
5. Batch inserts icons using `PROCESSING_BATCH_SIZE` env var
6. Cleans up temporary files

SVG parsing utilities in [utils/svg-helpers.ts](utils/svg-helpers.ts) use `fast-xml-parser`.

## Validation Pattern

Uses **Valibot** (not Zod). Custom form parser in [utils/validation.helpers.ts](utils/validation.helpers.ts):

```typescript
const parseRepositoryForm = buildFormParser(repositoryFormSchema);
const { success, payload, errors } = await parseRepositoryForm(formData);
```

Returns structured errors keyed by field name. See [app/(internal)/dashboard/repositories/validation.ts](app/(internal)/dashboard/repositories/validation.ts) for schema examples.

## Code Style & Tooling

- **Biome** (not ESLint/Prettier) - config in [biome.json](biome.json)
- Single quotes, 4-space indentation, 110 char line width
- `bun run lint` - Check formatting/linting
- `bun run format` - Auto-format

### Type Definitions

Global types in [global.d.ts](global.d.ts) - `Repository`, `Icon`, `Variant`, etc. No need to import these types.

## Development Commands

```bash
bun run dev              # Start dev server (uses --bun flag)
bun run build            # Production build
bun run migrate:create   # Generate new migration
bun run migrate          # Run pending migrations
```

React Compiler is **enabled** in [next.config.ts](next.config.ts). Client components automatically optimized.

## Key Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `COOKIE_SECRET` - Iron-session encryption key
- `COOKIE_MAX_AGE` - Session duration
- `PROCESSING_BATCH_SIZE` - Icons batch insert size
- `PWD` - Working directory for temp files

## UI Framework

- **Tailwind CSS 4** with **DaisyUI** components
- **Lucide React** for UI icons (not the managed SVG icons)
- Fonts: Inclusive Sans (body), Geist Mono (code)

## Common Patterns

### Server Actions

Always mark with `'use server'` directive. Return structured objects, not throwing errors:

```typescript
return { ...prevState, errors: { field: ['Error message'] } };
```

### Client State

Context providers wrap page-level features (see [IconContext.tsx](app/(external)/icons/_components/IconsContainer/IconContext.tsx)). Use `'use client'` only when needed.

### Logging

Custom logger in [utils/log.helpers.ts](utils/log.helpers.ts):

```typescript
log('info', 'Message', optionalData);
log('error', 'Failed operation', error);
```
