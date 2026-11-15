# CubanCFCronology

Developer entry point for the CubanCFCronology project — a Spanish-language
website about Cuban science fiction and fantasy: a genre chronology, author
profiles, bibliography, awards, historical milestones and a news feed.

## What this project is

CubanCFCronology is a static-first Astro site (v7.4.2) with Tailwind CSS v4
styling. All editorial content lives in Supabase (PostgreSQL) — the database is
the single source of truth. The Astro frontend reads it at build time and
prerenders content pages as static HTML.

- **Audience:** readers, researchers, authors and editors in Cuba and its diaspora
- **Product language:** Spanish (Cuba). User-facing copy is never written in English.
  (Internal docs, code, comments and commit messages are in English.)
- **Stack:** Astro 7.4.2, Tailwind CSS 4, Supabase (PostgreSQL, no ORM),
  @astrojs/cloudflare (v14.x), @astrojs/sitemap, Vitest, npm

## How to run it

```bash
npm install
npm run dev          # start dev server on http://localhost:4321
npm run build        # static build to dist/
npm run preview      # preview production build
npm run check        # TypeScript + Astro type check
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest (50 tests)
```

## Supabase database

```bash
npm run db:start     # local Supabase stack (Docker)
npm run db:reset     # replay migrations locally
npm run db:seed      # import Korad snapshot (offline service-role key)
npm run db:push      # push migrations to linked remote project
npm run db:types     # regenerate src/lib/database.types.ts
```

## Where to find everything

| Document | Purpose |
|----------|---------|
| `docs/AGENTS.md` | Instructions for AI agents working on this repository |
| `docs/ARCHITECTURE.md` | Technical decisions, software and hardware architecture |
| `docs/CONTRIBUTING.md` | Human contribution guide, conventions, workflow |
| `docs/GUIDELINES.md` | End-user guide: install, usage, features, FAQ, troubleshooting |
| `docs/STYLES.md` | Visual styles, design system, color palette, typography |
| `docs/TODO.md` | Roadmap: accomplished and unaccomplished items |
| `docs/MISSING_ELEMENTS.md` | Missing elements by priority |
| `docs/API.md` | Public read-only API documentation |
| `docs/SAAS.md` | Third-party service configurations (Supabase, Cloudflare Pages, news providers) |

## Key directories

| Directory | Purpose |
|-----------|---------|
| `src/pages/` | Astro page routes (astro pages) |
| `src/lib/` | Data access layer (Supabase client, Zod schemas, content readers, API) |
| `src/layouts/` | Astro layouts (BaseLayout) |
| `src/styles/` | Global CSS (Tailwind CSS v4) |
| `supabase/migrations/` | Plain SQL migrations (source of truth for DB schema) |
| `scripts/` | Offline seed runner and database utilities |
| `public/` | Static assets |

## Key scripts

| Script | Purpose |
|--------|---------|
| `npm run db:seed` | Import Korad snapshot (uses offline service-role key, never committed) |
| `npm run ping:supabase` | Keep-alive ping for free-tier Supabase (30-minute interval) |
| `npm run pagefind:build` | Build Pagefind full-text search index |

## Package manager

**npm** is used (not pnpm). `package-lock.json` is generated and committed.

## Git workflow

- Default branch: `main` (protected)
- Conventional Commits: `feat`, `fix`, `docs`, `chore`, etc.
- One commit per topic
- Before committing: `npm run check && npm run build && npm run test`
- Never rewrite published history on `main`

## Secret management

- `.env` is gitignored — never commit secrets
- `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_KEY` are public (client-side)
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only — never reaches the client
- `SUPABASE_ACCESS_TOKEN` enables Supabase CLI functions (login, link, db push)

## Documentation relationships

Each fact has exactly one owning doc:

- `README.md` → links to all other docs (this file)
- `TODO.md` ↔ `MISSING_ELEMENTS.md` — roadmap and missing elements
- `CONTRIBUTING.md` ↔ `ARCHITECTURE.md` / `STYLES.md` — conventions and styles
- `AGENTS.md` — AI agent instructions (this project's working guide)

No duplicated blocks: if information exists in one doc, other docs link to it
instead of repeating it.