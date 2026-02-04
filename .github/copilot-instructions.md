# Copilot Instructions for Icons Management App

## Project Architecture

This is a **Next.js 16 App Router** application for managing and browsing SVG icons from GitHub repositories. Built with Bun runtime, using **Bun's native SQL driver** for PostgreSQL.

### Route Structure

- **(external)/ficons**: Public icon browsing interface with search, filtering, and favorites
  - `/ficons/download/route.ts`: POST endpoint for batch icon downloads as zip
  - `/ficons/icons/route.ts`: GET endpoint for fetching icons by variant ID
- **(external)/about**: About page
- **(external)/tou**: Terms of Use page
- **(internal)/dashboard**: Protected admin area with subroutes:
  - `/dashboard/icon-repositories`: Repository management and icon imports
  - `/dashboard/icon-variants`: Variant configuration and editing

Routes prefixed with `(external)` and `(internal)` are **route groups** - the parentheses are excluded from the URL path.

### Data Flow Pattern

The app uses **server actions as the data layer** for pages, with **API routes** for specific endpoints like icon downloads and dynamic icon fetching. Example pattern from [app/(external)/ficons/page.tsx](app/(external)/ficons/page.tsx):

```tsx
const repositoriesVariants = await getRepositoriesAction();
```

API Routes:
- `POST /ficons/download`: Batch download icons as zip with adjustments
- `GET /ficons/icons?variantId=X`: Fetch icons by variant ID with caching (revalidate: 86400)

## Database Layer

### postgres.js Client

Uses **postgres.js** ([github.com/porsager/postgres](https://github.com/porsager/postgres)) as the PostgreSQL client (see [db/db.client.ts](db/db.client.ts)). Query syntax uses **tagged templates**:

```typescript
await sql`SELECT * FROM icons WHERE variant_id = ${variantId}`;
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
The client is configured with debug mode support:

```typescript
import postgres from 'postgres';
const sql = postgres(DATABASE_URL, {
    debug: DEBUG_QUERIES,
    onnotice: DEBUG_QUERIES ? (notice) => console.log('[SQL Notice]', notice) : undefined,
});
```

### Migration System

Custom migration system in [utils/migration.service.ts](utils/migration.service.ts):

- `bun run migrate:create` - Generate new timestamped migration
- `bun run migrate` - Run pending migrations
- Migrations are TypeScript files with `up()` and `down()` functions using any compatible SQL executor (see [migrations/20251228_171007_init_db.ts](migrations/20251228_171007_init_db.ts))
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
compact text format using `svgToTextFormat()` from `converters/svg-to-text-converter.ts`
5. Batch inserts icons using `PROCESSING_BATCH_SIZE` env var
6. Cleans up temporary files

SVG parsing utilities in [converters/svg-to-text-converter.ts](converters/svg-to-text-converter.ts) use `fast-xml-parser` to convert SVG to compact text notation

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
2. Extracts to `/var/tmp` directory using Bun's `$` shell helper
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
```with stroke/fill/strokeWidth settings:
  - `id`, `repositoryId`, `path`, `name`, `regex`
  - `stroke`, `strokeOn` (both/parent/children)
  - `fill`, `fillOn` (both/parent/children)
  - `strokeWidth`, `strokeWidthOn` (both/parent/children)
  - `iconCount`, `createdAt`, `updatedAt`
- `VariantWithRepository`: Variant with denormalized repository owner/name
- `SvgNode`: Compact AST node structure (i: id, t: type, a: attrs, c: children) - **deprecated, kept for backward compatibility**
- `Icon`: Parsed icon (id, name, svgText) - uses compact text format
- `IconWithRelativeData`: Icon with repositoryId and variantId
- `User`: Admin user (id, name, email, hashedPassword, profilePictureUrl, deletedAt, createdAt, updatedAt)
- `Session`: Session data (userId, userName, userProfilePictureUrl)
- `Adjustment`: Adjustment settings (size, color)
- `SvgAdjustableAttributes`: SVG attributes (fill, stroke, strokeWidth, height, width)
- `Favorite`: Favorite icon reference (iconId, svgAst) - **deprecated field**on)
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
ficons/page.tsx](app/(external)/ficons/page.tsx)

**Main Components:**

- **Drawer.tsx**: Sidebar drawer for repository filtering and favorites management
- **DrawerToggler.tsx**: Toggle button for drawer
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
- **PageContext.tsx**: Jotai state provider and initialization
- **RepositoryInfo.tsx**: Repository metadata display with GitHub link
- **RepositoryModal.tsx**: Modal for repository details
- **SearchModal.tsx**: Modal for icon search functionality
- **AboutModal.tsx**: About page modal
- **FavoriteButton.tsx**: Button to add/remove favorites

Uses Jotai atoms for state management instead of React Context
- Fonts: Inclusive Sans (body), Geist Mono (code)

## Common Patterns

### Server Actions

Always mark with `'use server'` directive. Return structured objects, not throwing errors:

```typescript
return { ...prevState, errors: { field: ['Error message'] } };
```

### Client State

Context providers wrap page-level features (see [PageContext.tsx](app/(external)/icons/_components/PageContext.tsx)). Use `'use client'` only when needed.

### Page Components Structurecompact text format using `textFormatToSvg()` converter and `dangerouslySetInnerHTML`
- **ColorAdjuster.tsx**, **FillColorAdjuster.tsx**, **StrokeColorAdjuster.tsx**: Color adjustment controls
- **SizeAdjuster.tsx**, **StrokeWidthAdjuster.tsx**: Size and stroke width controls
- **Box.tsx**: Generic container component with optional header
- **ThemeSwitcher.tsx**: DaisyUI theme toggle component
- **Footer.tsx**: Site footer component

### Utilities

Server and shared helpers:

- **utils/string-helpers.ts**: SVG text manipulation
  - `applyAdjustmentColor()`: Replace color placeholders in compact text (cc → actual color)
  - `applyAdjustment2SvgText()`: Apply both color and size adjustments to compact text
  - `mergeAttributes()`: Merge variant and adjustment attributeb link
- **SearchModal.tsx**: Modal for icon search functionality
- **SkeletonIconsContainer.tsx**: Loading skeleton for icon grid

All comGithubStarCount.ts**: Fetches GitHub star count for repositories

External hooks from `@uidotdev/usehooks`:

- `useIsClient()`: Used in [PageContext.tsx](app/(external)/ficons/_components/PageContext.tsx) for client-side logic
- `useClickAway()`: Used in navbar components
```

## Component Architecture

### State Management with Jotai

Uses **Jotai** for client-side state management (not React Context). See [app/(external)/ficons/_components/PageContext.tsx](app/(external)/ficons/_components/PageContext.tsx).

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

**Custom Hooks**:

- `useIconAction()`: Returns `[setIcon, clearIcon]` functions
- `useIconValue()`: Returns current selected icon
- `useFavoritesAction()`: Returns `[addFavorite, removeFavorite]` functions
- `useFavoritesValue()`: Returns favorites array
- `useAdjustmentValue(repositoryId)`: Returns color/size adjustments for a repository
- `useDrawerAction()`: Returns drawer open/close functions
- `useRepositoryAction()`: Returns repository selection functions
- `useSearchCountsAction()`: Returns search count management functions

- **string-helpers.ts**: SVG text manipulation utilities for compact format
- **svg-to-tsx.ts**: Generates React component code from SVG string

## Converters

Custom SVG format converters in [converters/](converters/) directory:

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
Wrap page with `<Provider>` from `jotai` and `<PageContextProvider>` to initialize state
### Custom Hooks

Hooks in [hooks/](hooks/) directory:

- **useReportDefaultAttributeValues.ts**: Manages default variant settings and attributes
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
