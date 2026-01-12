# Copilot Instructions for Icons Management App

## Project Architecture

This is a **Next.js 16 App Router** application for managing and browsing SVG icons from GitHub repositories. Built with Bun runtime, using **Bun's native SQL driver** for PostgreSQL.

### Route Structure

- **(external)/icons**: Public icon browsing interface with search and filtering
- **(internal)/dashboard**: Protected admin area with subroutes:
  - `/dashboard/icon-repositories`: Repository management and icon imports
  - `/dashboard/icon-variants`: Variant configuration and editing

Routes prefixed with `(external)` and `(internal)` are **route groups** - the parentheses are excluded from the URL path.

### Data Flow Pattern

The app uses **server actions as the data layer**, not API routes. Example pattern from [app/(external)/icons/page.tsx](app/(external)/icons/page.tsx):

```tsx
const [repositories, variants] = await Promise.all([getRepositoriesAction(), getVariantsAction()]);
const iconsByRepoIdPromise = Object.fromEntries(
    repositories.map((repo) => [repo.id, getIconsByRepositoryIdAction(repo.id)])
);
```

Components unwrap promises using React's `use()` hook. See [app/(external)/icons/_components/IconSection.tsx](app/(external)/icons/_components/IconSection.tsx) for pattern usage.

## Database Layer

### Bun SQL Client

Uses **Bun's native SQL driver** via `new SQL(Bun.env.DATABASE_URL)` (see [db/db.client.ts](db/db.client.ts)). Query syntax uses **tagged templates**:

```typescript
await dbClient`SELECT * FROM icons WHERE variant_id = ${variantId}`;
```

Array parameters use `sql.array()` helper from `bun`:

```typescript
import { sql } from 'bun';
await dbClient`UPDATE variants SET attributes_to_adjust = ${sql.array(data.attributesToAdjust, 'text')}`;
```

### Migration System

Custom migration system in [utils/migration.service.ts](utils/migration.service.ts):

- `bun run migrate:create` - Generate new timestamped migration
- `bun run migrate` - Run pending migrations
- Migrations are TypeScript files with `up()` and `down()` functions (see [migrations/20251228_171007_init_db.ts](migrations/20251228_171007_init_db.ts))

### Schema Overview

- **repositories**: GitHub repo metadata (owner, name, ref, github_id)
- **variants**: Multiple icon variants per repo (e.g., "outline", "solid") - each variant has name, path, regex for matching SVG files, and `attributes_to_adjust` array
- **icons**: Parsed SVG stored as `svg_ast` JSONB, linked to variants via variant_id
- **users**: Admin authentication with hashed passwords

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
2. Extracts to `/tmp` directory using Bun's `$` shell helper
3. Scans variant directories (defined in database) for SVG files matching the regex pattern
4. Parses each SVG: converts to AST structure with `svg_ast` containing nodes with id, type, attrs, and children
5. Batch inserts icons using `PROCESSING_BATCH_SIZE` env var
6. Cleans up temporary files

SVG parsing utilities in [utils/svg-helpers.ts](utils/svg-helpers.ts) use `fast-xml-parser`. The AST structure (`SvgNode`) stores SVG elements recursively with attributes and text content.

## Validation Pattern

Uses **Valibot** (not Zod). Custom form parser in [utils/validation.helpers.ts](utils/validation.helpers.ts):

```typescript
const parseRepositoryForm = buildFormParser(repositoryFormSchema);
const { success, payload, errors } = await parseRepositoryForm(formData);
```

Returns structured errors keyed by field name. The `buildFormParser` utility extracts form data (including arrays with `[]` suffix) and validates against Valibot schemas. See [app/(internal)/dashboard/icon-repositories/validation.ts](app/(internal)/dashboard/icon-repositories/validation.ts) for schema examples.

## Code Style & Tooling

- **Biome** (not ESLint/Prettier) - config in [biome.json](biome.json)
- Single quotes, 4-space indentation, 110 char line width
- `bun run lint` - Check formatting/linting
- `bun run format` - Auto-format
- Disabled rules:
  - `suspicious/noUnknownAtRules` - For Tailwind CSS 4 directives
  - `suspicious/noArrayIndexKey` - Allowed for static arrays
  - `correctness/noUnknownProperty` - For DaisyUI plugin syntax

### Type Definitions

Global types in [global.d.ts](global.d.ts) - `Repository`, `Icon`, `Variant`, etc. No need to import these types.

**Core Types:**

- `Repository`: GitHub repo metadata (id, owner, name, ref, lastImportedAt, createdAt)
- `RepositoryWithIconCount`: Repository with icon count
- `RepositoryVariants`: Repository with nested variants array
- `RepositoryVariantsWithIconCount`: Combined with icon count
- `Variant`: Icon variant configuration (id, repositoryId, path, name, regex, attributesToAdjust)
- `VariantWithRepository`: Variant with denormalized repository owner/name
- `SvgNode`: AST node structure (id, type, attrs, children)
- `Icon`: Parsed icon (id, name, svgAst, createdAt)
- `IconWithRelativeData`: Icon with repositoryId and variantId
- `User`: Admin user (id, name, email, hashedPassword, profilePictureUrl, deletedAt, createdAt, updatedAt)
- `Session`: Session data (userId, userName, userProfilePictureUrl)

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

Context providers wrap page-level features (see [PageContext.tsx](app/(external)/icons/_components/PageContext.tsx)). Use `'use client'` only when needed.

### Page Components Structure

Main icon browsing page: [app/(external)/icons/page.tsx](app/(external)/icons/page.tsx)

**Components:**

- **Drawer.tsx**: Sidebar drawer for repository filtering
- **DrawerToggler.tsx**: Toggle button for drawer
- **IconDetailsModal.tsx**: Modal showing selected icon details with attribute adjusters
- **IconSection.tsx**: Section displaying icons for a repository with variant filtering
- **Navbar.tsx**: Top navigation with search modal trigger
- **PageContext.tsx**: Context provider managing selected icon/repository state
- **RepositoryInfo.tsx**: Repository metadata display with GitHub link
- **SearchModal.tsx**: Modal for icon search functionality
- **SkeletonIconsContainer.tsx**: Loading skeleton for icon grid

All components use React's `use()` hook to unwrap promises passed from server components.

### Logging

Custom logger in [utils/log.helpers.ts](utils/log.helpers.ts):

```typescript
log('info', 'Message', optionalData);
log('error', 'Failed operation', error);
```

## Component Architecture

### Shared Components

Reusable components in [components/](components/) directory:

- **AstToSvg.tsx**: Renders SVG from AST structure using `dangerouslySetInnerHTML` with converted HTML from `astToInnerHtml()`
- **AttributesAdjuster.tsx**: Composite component for adjusting icon properties (size, stroke, fill)
- **SizeAdjuster.tsx**, **StrokeWidthAdjuster.tsx**, **StrokeColorAdjuster.tsx**, **FillColorAdjuster.tsx**: Individual attribute controls
- **Box.tsx**: Generic container component with optional header
- **ThemeSwitcher.tsx**: DaisyUI theme toggle component

### Client-Side Utilities

Client-side helpers in [utils/client-side/](utils/client-side/) directory:

- **svg-helpers.ts**: Client-side SVG manipulation functions
  - `astToInnerHtml()`: Converts AST to inner HTML string (excludes root svg tag)
  - `astToHtml()`: Recursively converts AST nodes to HTML strings

### Custom Hooks

Hooks in [hooks/](hooks/) directory:

- **useDefaultVariantSettings.ts**: Manages default variant settings and attributes
- **useDownloadIconTsx.ts**: Generates and downloads React component code for selected icon
- **useDownloadRawIcon.ts**: Downloads raw SVG file
- **useGithubStarCount.ts**: Fetches GitHub star count for repositories

External hooks from `@uidotdev/usehooks`:

- `useIsClient()`: Used in [PageContext.tsx](app/(external)/icons/_components/PageContext.tsx) for client-side logic
- `useClickAway()`: Used in [Navbar.tsx](app/(external)/icons/_components/Navbar.tsx) for dropdown management

### Context Pattern

Page-level context in [app/(external)/icons/_components/PageContext.tsx](app/(external)/icons/_components/PageContext.tsx):

```typescript
interface IconContextType {
    selectedIcon: IconWithRelativeData | null;
    selectedRepository: Repository | null;
    variants: ExtendedVariant[];
    setSelectedIcon: (icon: IconWithRelativeData | null) => void;
    setSelectedRepository: (repo: Repository | null) => void;
    setVariants: Dispatch<SetStateAction<ExtendedVariant[]>>;
    getVariantsByRepositoryId: (repoId: number) => ExtendedVariant[];
    updatedVariant: (updatedVariant: ExtendedVariant) => void;
}
```

`ExtendedVariant` adds optional `svgAttributes` (fill, stroke, strokeWidth, width, height) to base `Variant` type. Context handles modal state for icon details and adjustable attributes.

## Helper Utilities

- **assert-helpers.ts**: Type guards and assertion functions (`assertNumber`, `assertString`)
- **common-helpers.ts**: 
  - `cx()`: Classname merging utility
  - `nameToId()`: Converts names to URL-safe IDs
- **log.helpers.ts**: Logging utility with severity levels
- **validation.helpers.ts**: Form validation with Valibot
