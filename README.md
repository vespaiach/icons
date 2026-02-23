# Ficons – SVG Icon Browser & Admin

Ficons is a Next.js 16 App Router application for browsing and managing SVG icon collections sourced from GitHub repositories. It provides a public icon browser with search and on-the-fly adjustments, plus an authenticated dashboard for importing and configuring icon variants.

## Features

- Browse icons from multiple GitHub repositories at `/ficons` with search, filtering, favorites, and per-repository adjustments.
- Adjust icon color and size in the browser and download individual icons or a batch ZIP.
- Admin dashboard at `/dashboard` for managing icon repositories and their variants (paths, regex filters, color behavior, replacements).
- One-click import from GitHub: download ZIP, extract with 7-Zip, parse SVGs, and store a compact text representation in PostgreSQL.
- Compact SVG storage format (~70% smaller) with converters to and from SVG.

## Tech Stack

- Runtime: Bun
- Framework: Next.js 16 (App Router)
- Database: PostgreSQL via `postgres.js`
- Auth: `iron-session` (cookie-based)
- UI: React 19, DaisyUI, Tailwind CSS 4, Jotai for client state
- Tooling: TypeScript, Biome (lint/format), custom migration system

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed.
- PostgreSQL instance and connection string (`DATABASE_URL`).
- 7-Zip CLI (`7z`) available on the host (used to extract downloaded GitHub ZIP archives).

### Install dependencies

```bash
bun install
```

### Environment variables

Create a `.env` (or equivalent) with at least:

- `DATABASE_URL` – PostgreSQL connection string used by the app and migration service.
- `COOKIE_SECRET` – secret string used by `iron-session` for signing cookies.
- `COOKIE_MAX_AGE` – session lifetime in seconds (used when setting the auth cookie).
- `PROCESSING_BATCH_SIZE` – batch size for processing SVG files during imports (e.g. `50`).
- `DEBUG_QUERIES` – optional; set to `true` to log SQL queries and notices.

Check `env.d.ts` for the full list of expected environment variables and types.

### Database migrations

This project uses a custom migration runner in `utils/migration.service.ts` and TypeScript migration files in `migrations/`.

Run pending migrations:

```bash
bun run migrate
```

Create a new migration file:

```bash
bun run migrate:create
```

## Running the app

Development server (http://localhost:3000):

```bash
bun run dev
```

Production build and start:

```bash
bun run build
bun run start
```

Lint and format:

```bash
bun run lint
bun run format
```

Run tests:

```bash
bun run test
```

## Routes & Structure

The application follows the Next.js App Router structure under `app/`.

- Public site
	- `/` – Landing page.
	- `/ficons` – Main icon browser (under `app/(external)/ficons`).
		- `GET /ficons/icons?variantId=...` – API route to fetch icons for a variant.
		- `POST /ficons/download` – API route to download selected icons as a ZIP.
	- `/about` – About page.
	- `/tou` – Terms of Use page.
- Admin area (authenticated)
	- `/auth/sign-in` – Sign-in page.
	- `/dashboard` – Dashboard layout.
	- `/dashboard/icon-repositories` – Manage GitHub repositories and trigger imports.
	- `/dashboard/icon-variants` – Configure icon variants (paths, regex, color settings, replacements).

Auth is handled via `iron-session` helpers in `utils/session.ts`, which expect valid session cookies and redirect unauthenticated users to `/auth/sign-in`.

## Icon Storage & Converters

Icons are stored in PostgreSQL in a compact text format instead of raw SVG or JSON AST:

- Compact format lives in the `svg_text` column on the `icons` table.
- Conversion from SVG to compact text: `converters/svg-to-text-converter.ts` (`svgToTextFormat`).
- Conversion from compact text back to SVG markup: `converters/text-to-svg-converter.ts` (`textFormatToSvg`).
- The public UI renders this text format via the `TextToSvg` component.

This format uses short element/attribute/value codes (e.g. `s` for `svg`, `vb` for `viewBox`, `cc` for `currentColor`) for significantly smaller storage and fast adjustment of color and size.

## Import Workflow (Admin)

The import flow for a configured repository works as follows:

1. An admin configures a repository and its variants in the dashboard (owner/name/ref, path, regex, color behavior, replacements).
2. On import, the server:
	 - Downloads the GitHub repository ZIP from `codeload.github.com`.
	 - Extracts it to `/var/tmp` using 7-Zip.
	 - Scans each variant directory for SVG files matching the configured regex.
	 - Adds color attributes/replacements, converts each SVG to the compact text format, and inserts icons into PostgreSQL in batches (`PROCESSING_BATCH_SIZE`).
3. Variant `icon_count` caches are updated and temporary files under `/var/tmp` are cleaned up.

## Development Notes

- State management in the public icon browser uses Jotai atoms (see `app/(external)/ficons/_components/PageContext.tsx`).
- Biome is used for linting and formatting; see `biome.json` for project style rules.
- The custom migration system is in `utils/migration.service.ts` and is invoked via `bun run migrate` / `bun run migrate:create`.

For more implementation details, explore the `app/`, `db/`, `converters/`, and `utils/` directories.
