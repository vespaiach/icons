# Copilot Instructions for Icons Management App

## Project Architecture

This is a **Next.js 16 App Router** application for managing and browsing SVG icons from GitHub repositories. Built with Bun runtime, using **postgres.js** as the SQL client for PostgreSQL.

### Route Structure

- **(external)/ficons**: Public icon browsing interface with search, filtering, and favorites
  - `/ficons/download/route.ts`: POST endpoint for batch icon downloads as zip
  - `/ficons/icons/route.ts`: GET endpoint for fetching icons by variant ID
- **(external)/about**: About page
- **(external)/tou**: Terms of Use page
- **(internal)/auth**: Public authentication pages (sign-in)
- **(internal)/dashboard**: Protected admin area with subroutes:
  - `/dashboard/icon-repositories`: Repository management and icon imports
  - `/dashboard/icon-variants`: Variant configuration and editing

Routes prefixed with `(external)` and `(internal)` are **route groups** - the parentheses are excluded from the URL path.

### Data Flow Pattern

The app uses **server actions as the data layer** for pages, with **API routes** for specific endpoints like icon downloads and dynamic icon fetching. Example pattern from [app/(external)/ficons/page.tsx](../app/%28external%29/ficons/page.tsx):

```tsx
const repositoriesVariants = await getRepositoriesAction();
```

API Routes:
- `POST /ficons/download`: Batch download icons as zip with adjustments
- `GET /ficons/icons?variantId=X`: Fetch icons by variant ID with caching (revalidate: 86400)
- `POST /api/revalidate`: Revalidate cached external and icon routes using a shared secret

## Database Layer

### postgres.js Client

Uses **postgres.js** ([github.com/porsager/postgres](https://github.com/porsager/postgres)) as the PostgreSQL client (see [db/db.client.ts](../db/db.client.ts)). Query syntax uses **tagged templates**:

```typescript
await sql`SELECT * FROM icons WHERE variant_id = ${variantId}`;
```

The client is configured with debug mode support:

```typescript
import postgres from 'postgres';

const DEBUG_QUERIES = Bun.env.DEBUG_QUERIES === 'true';

export const sql = postgres(Bun.env.DATABASE_URL, {
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
```

### Compact SVG Storage Format

Icons are stored in a **compact text format** instead of JSON AST:

- **Database field**: `svg_text` (TEXT column, not JSONB)
- **Format**: Custom compact notation (e.g., `s vb=0 0 24 24_f=n|:1p M10 6`)
- **Converters**: 
  - `converters/svg-to-text-converter.ts`: SVG → compact text with configurable abbreviations
  - `converters/text-to-svg-converter.ts`: Compact text → SVG HTML
  
**Benefits**:
- ~70% smaller storage than JSON AST
- Faster parsing and transmission
- Direct string manipulation for adjustments (color, size)

**Default abbreviations** (see `DEFAULT_ATTRIBUTE_MAP`, `DEFAULT_VALUE_MAP`, `DEFAULT_ELEMENT_MAP`):
- Elements: `s` (svg), `p` (path), `c` (circle), `r` (rect)
- Attributes: `vb` (viewBox), `f` (fill), `st` (stroke), `stw` (stroke-width)
- Values: `cc` (currentColor), `n` (none)
- Syntax: `element attr1=val1_attr2=val2|:parentId` for hierarchy

### Migration System

Custom migration system in [utils/migration.service.ts](../utils/migration.service.ts):

- `bun run migrate:create` - Generate new timestamped migration
- `bun run migrate` - Run pending migrations
- Migrations are TypeScript files with `up()` and `down()` functions using any compatible SQL executor (see [migrations/20251228_171007_init_db.ts](../migrations/20251228_171007_init_db.ts))
:
  - `name`, `path`, `regex` for matching SVG files
  - `stroke`, `stroke_on` (both/parent/children)
  - `fill`, `fill_on` (both/parent/children)
  - `stroke_width`, `stroke_width_on` (both/parent/children)
- **icons**: Parsed SVG stored as `svg_text` TEXT (compact format)

```typescript
import type { Sql } from 'postgres';

export async function up(sql: any): Promise<void> {
    await sql`CREATE TABLE example (id SERIAL PRIMARY KEY)`;
}

export async function down(sql: any): Promise<void> {
    await sql`DROP TABLE example`;
}
```

**Note**: Use `any` type for the `sql` parameter to support both regular queries and transaction contexts.

### Schema Overview

Main database tables:

- **repositories**: GitHub repositories
  - `id`, `owner`, `name`, `ref`, `last_imported_at`, `created_at`
  - Unique constraint on (`owner`, `name`)
- **variants**: Icon variants with configuration
  - `id`, `repository_id`, `path`, `name`, `regex`
  - `color_on` (TEXT): Which color to adjust (e.g., 'fill', 'stroke', null)
  - `none_color_on` (TEXT): Which attribute to set to 'none'
  - `replacements` (TEXT[]): Array of string replacements to apply
  - `icon_count`, `created_at`, `updated_at`
- **icons**: Parsed SVG stored as `svg_text` (TEXT) in compact format
  - `id`, `variant_id`, `name`, `svg_text`, `created_at`, `updated_at`
- **users**: Admin users
  - `id`, `name`, `email`, `hashed_password`, `profile_picture_url`, `deleted_at`, `created_at`, `updated_at`

## Authentication Pattern

Uses **iron-session** with Bun environment variables. Session logic in [utils/session.ts](../utils/session.ts):

```typescript
await getAuthSession(); // Throws redirect if not authenticated
await retrieveUserFromSession(); // Returns user object or redirects
```

Cookie-based auth with `COOKIE_SECRET` and `COOKIE_MAX_AGE` env vars. Protected routes call `retrieveUserFromSession()` at page level.

## Icon Import Workflow

Repository imports happen in [app/(internal)/dashboard/icon-repositories/actions.ts](../app/%28internal%29/dashboard/icon-repositories/actions.ts):

1. Downloads GitHub repo as ZIP using `codeload.github.com`
2. Extracts to `/var/tmp` directory using Bun's `$` shell helper
3. Scans variant directories (defined in database) for SVG files matching the regex pattern
4. Parses each SVG: converts to compact text format using `svgToTextFormat()` from `converters/svg-to-text-converter.ts`
5. Batch inserts icons using `PROCESSING_BATCH_SIZE` env var
6. Cleans up temporary files

SVG parsing uses `fast-xml-parser` internally within the converters to convert SVG to compact text notation.

## Validation Pattern

Uses **Valibot** (not Zod). Custom form parser in [utils/validation.helpers.ts](../utils/validation.helpers.ts):

```typescript
const parseRepositoryForm = buildFormParser(repositoryFormSchema);
const { success, payload, errors } = await parseRepositoryForm(formData);
```

## Code Style

Uses **Biome** for linting and formatting:
- Single quotes, 4-space indentation, 110 char line width
- `bun run lint` - Check formatting/linting
- `bun run format` - Auto-format
- Disabled rules:
  - `suspicious/noUnknownAtRules` - For Tailwind CSS 4 directives
  - `suspicious/noArrayIndexKey` - Allowed for static arrays
  - `correctness/noUnknownProperty` - For DaisyUI plugin syntax
### Type Definitions

Global types in [global.d.ts](../global.d.ts) - `Repository`, `Icon`, `Variant`, etc. No need to import these types.

**Core Types:**

- `Repository`: GitHub repo metadata (id, owner, name, ref, lastImportedAt, createdAt)
- `RepositoryWithIconCount`: Repository with icon count
- `RepositoryVariants`: Repository with nested variants array
- `RepositoryVariantsWithIconCount`: Combined with icon count
- `Variant`: Icon variant configuration
  - `id`, `repositoryId`, `path`, `name`, `regex`
  - `colorOn` ('fill' | 'stroke' | null): Which color to adjust
  - `noneColorOn` ('fill' | 'stroke' | null): Which attribute to set to 'none'
  - `replacements` (string[] | null): Array of string replacements
  - `iconCount`, `createdAt`, `updatedAt`
- `VariantWithRepository`: Variant with denormalized repository owner/name
- `SvgNode`: AST node structure (i: id, t: type, a: attrs, c: children) - **deprecated, kept for backward compatibility**
- `Icon`: Parsed icon (id, name, svgText) - uses compact text format
- `IconWithRelativeData`: Icon with repositoryId and variantId
- `User`: Admin user (id, name, email, hashedPassword, profilePictureUrl, deletedAt, createdAt, updatedAt)
- `Session`: Session data (userId, userName, userProfilePictureUrl)
- `Adjustment`: Adjustment settings (size, color)
- `SvgAdjustableAttributes`: SVG attributes (fill, stroke, strokeWidth, height, width)
- `Favorite`: Favorite icon reference (iconId, svgAst) - **deprecated field, kept for backward compatibility**

## Development Commands

```bash
bun run dev              # Start dev server (uses --bun flag)
bun run build            # Production build
bun run migrate:create   # Generate new migration
bun run migrate          # Run pending migrations
bun test                 # Run unit tests (e.g., converters)
```

## Component Structure

### Main Page Components

**In [app/(external)/ficons/_components/](../app/%28external%29/ficons/_components/):**

- **Drawer.tsx**: Sidebar drawer for repository filtering and favorites management
- **DrawerToggler.tsx**: Toggle button for drawer
- **RightDrawer.tsx**: Right-side drawer component
- **IconModal/**: Modal showing selected icon details
  - **index.tsx**: Main modal component
  - **IconDetails.tsx**: Icon metadata and preview
  - **CopyButton.tsx**: Copy icon code/SVG button
  - **DownloadButton.tsx**: Download icon button
  - **prepareText.ts**: Utility to prepare icon text with adjustments
- **IconsSection/**: Section displaying icons for a repository
  - **index.tsx**: Main section component
  - **IconButton.tsx**: Individual icon button
  - **SectionBody.tsx**: Grid container for icons
- **Navbar/**: Top navigation components
  - **index.tsx**: Main navbar component
  - **AboutButton.tsx**: About button
  - **SearchButton.tsx**: Search button
  - **IconsSectionLinks.tsx**: Links to icon sections
- **PageContext.tsx**: Jotai state provider and initialization
- **RepositoryInfo.tsx**: Repository metadata display with GitHub link
- **RepositoryModal.tsx**: Modal for repository details
- **SearchModal.tsx**: Modal for icon search functionality
- **AboutModal.tsx**: About page modal
- **FavoriteButton.tsx**: Button to add/remove favorites
- **MenuItem.tsx**: Menu item component

**Uses Jotai atoms for state management instead of React Context**

## Common Patterns

### Server Actions

Always mark with `'use server'` directive. Return structured objects, not throwing errors:

```typescript
return { ...prevState, errors: { field: ['Error message'] } };
```

### Client State

Jotai providers wrap page-level features (see [PageContext.tsx](../app/%28external%29/ficons/_components/PageContext.tsx)). Use `'use client'` only when needed.

### Shared Components

**In [components/](../components/) directory:**

- **ColorAdjuster.tsx**: Color adjustment control
- **SizeAdjuster.tsx**: Icon size adjustment control
- **Box.tsx**: Generic container component with optional header
- **Footer.tsx**: Site footer component
- **TextToSvg.tsx**: Renders compact text format using `textFormatToSvg()` converter and `dangerouslySetInnerHTML`

### Utilities

Server and shared helpers:

- **utils/string-helpers.ts**: SVG text manipulation
  - `applyAdjustmentColor()`: Replace color placeholders in compact text (cc → actual color)
  - `applyAdjustment2SvgText()`: Apply both color and size adjustments to compact text
  - `mergeAttributes()`: Merge variant and adjustment attributes
- **utils/svg-to-tsx.ts**: Generates React component code from SVG string
- **utils/svg-helpers.ts**: SVG parsing and attribute extraction helpers for client-side tools
- **utils/common-helpers.ts**: 
  - `cx()`: Classname merging utility
  - `nameToId()`: Converts names to URL-safe IDs
- **utils/assert-helpers.ts**: Type guards and assertion functions
- **utils/log.helpers.ts**: Logging utility with severity levels
- **utils/validation.helpers.ts**: Form validation with Valibot

## Component Architecture

### State Management with Jotai

Uses **Jotai** for client-side state management (not React Context). See [app/(external)/ficons/_components/PageContext.tsx](../app/%28external%29/ficons/_components/PageContext.tsx).

**Global Atoms**:

```typescript
export const adjustmentsByRepoIdAtom = atom<Record<number, { color: string; size: number }>>({});
export const iconAtom = atom<IconWithRelativeData | null>(null);
export const favoritesAtom = atom<IconWithRelativeData[]>([]);
export const drawerOpenAtom = atom<boolean>(false);
export const repositoryAtom = atom<Repository | null>(null);
export const searchCountsAtom = atom<Record<number, number | undefined | null>>({});
export const searchKeywordAtom = atom<string>('');
```

**Custom Hooks** (defined in PageContext.tsx):

- `useIconAction()`: Returns `[setIcon, clearIcon]` functions
- `useIconValue()`: Returns current selected icon
- `useFavoritesAction()`: Returns `[addFavorite, removeFavorite, clearFavorites]` functions
- `useFavoritesValue()`: Returns `{ ids: Set<number>, byIds: Record<number, Icon> }` object
- `useAdjustmentValue(repositoryId)`: Returns color/size adjustments for a repository
- `useDrawerValue()`: Returns drawer open state
- `useDrawerAction()`: Returns `[openDrawer, closeDrawer]` functions
- `useSearchCountAction(variantId)`: Returns search count for a variant
- `useSetSearchCountAction()`: Returns function to set search count
- `useSearchKeywordAction()`: Returns function to set search keyword
- `useSearchKeywordValue()`: Returns current search keyword

## Converters

Custom SVG format converters in [converters/](../converters/) directory:

- **svg-to-text-converter.ts**: Converts SVG to compact text format
  - `svgToTextFormat(svgString, config?)`: Main conversion function
  - `DEFAULT_ATTRIBUTE_MAP`: Attribute abbreviations (viewBox → vb, fill → f, etc.)
  - `DEFAULT_VALUE_MAP`: Value abbreviations (currentColor → cc, none → n)
  - `DEFAULT_ELEMENT_MAP`: Element abbreviations (svg → s, path → p, etc.)
  - Configurable via `SvgToTextConfig` interface

- **text-to-svg-converter.ts**: Converts compact text format back to SVG
  - `textFormatToSvg(textFormat, config?)`: Main conversion function
  - Uses reverse maps from svg-to-text-converter
  - Supports hierarchical notation (`:parentId` syntax)

- **svg-to-text-converter.test.ts**: Comprehensive test suite with multiple sample files

### External Hooks

Hooks in [hooks/](../hooks/) directory:

- **useGithubStarCount.ts**: Fetches GitHub star count for repositories

External hooks from `@uidotdev/usehooks`:

- `useIsClient()`: Used in [PageContext.tsx](../app/%28external%29/ficons/_components/PageContext.tsx) for client-side logic
- `useClickAway()`: Used in navbar components for dropdown management

### Page Setup Pattern

Wrap pages with Jotai `<Provider>` and `<PageContextProvider>` to initialize state:

```tsx
import { Provider } from 'jotai';
import { PageContextProvider } from './_components/PageContext';

export default async function Page() {
    const repositories = await getRepositoriesAction();
    
    return (
        <Provider>
            <PageContextProvider repositories={repositories}>
                {/* page content */}
            </PageContextProvider>
        </Provider>
    );
}
```
