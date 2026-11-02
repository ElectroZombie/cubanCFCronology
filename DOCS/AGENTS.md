# AGENTS.md — Guide for AI agents

> This file describes **how to work in this repository**. If you are an agent (Claude, GPT,
> Gemini, Copilot, Cursor, OpenCode…), read it fully before touching code.
> Companion docs live in `DOCS/`: `ARCHITECTURE.md` (technical decisions), `TODO.md`
> (roadmap), `CONTRIBUTING.md` (human contribution flow).

---

## 1. What this project is

**CubanCFCronology** is a Spanish-language website about **Cuban science fiction and
fantasy**: a genre chronology, author profiles, bibliography, awards, historical milestones
and a news feed.

- Audience: readers, researchers, authors and editors in Cuba and its diaspora.
- Product language: **Spanish (Cuba)**. User-facing copy is never written in English.
  (Internal docs, code, comments and commit messages are in English.)
- Repository state: frontend and initial Supabase data layer scaffolded. `src/lib/` contains
  public/SSR clients, Zod response schemas and validated author/work readers; `scripts/seed.mjs`
  imports the Korad snapshot using an offline-only service-role key. Public author, work, and
  chronology routes are scaffolded. Supabase project creation is deferred; generated database
  types and CLI setup remain pending. npm dependencies are installed, but Astro check/build are
  blocked by an incomplete nested Wrangler package; project package-manager guidance still says
  pnpm while the local npm install generated `package-lock.json`.
- **All editorial content lives in Supabase** (authors, works) — not in Git files. The
  database is the single source of truth; the Astro frontend reads it at build time and
  prerenders content pages.

## 2. Decided stack

| Layer | Technology | Reference version |
| --- | --- | --- |
| Framework | Astro (hybrid SSG + SSR, islands) | 7.x (`7.4.2`) |
| Language | TypeScript, strict | 5.x |
| Styling | Tailwind CSS via `@tailwindcss/vite` | 4.x |
| Content source | Supabase (PostgreSQL) — **single source of truth** | — |
| Data access | `@supabase/supabase-js` + Zod response validation (**no ORM**) | 2.x |
| Schema | Plain SQL migrations via Supabase CLI | — |
| Auth | Supabase Auth + Row Level Security | — |
| Hosting | Cloudflare Workers (`@astrojs/cloudflare`) | 14.x |
| Package manager | **pnpm** | 10.x |
| Local runtime | Node.js ≥ 22 (verified: 26.x) | — |

Do not introduce React/Vue/Svelte without an explicit ADR. Most of this site is static HTML;
reach for an **island** only when genuine interactivity is required.

## 3. Ground rules (non-negotiable)

1. **Never invent bibliographic data.** Every work row requires a `link` to its source.
   No source → do not write the datum; record it in `TODO.md` as "pending verification".
2. **Never copy copyrighted text.** Biographies and synopses are originally written and
   paraphrased. At most, quote 2–3 lines with attribution.
3. **Never commit secrets.** `.env` is gitignored. Supabase keys and news API keys come from
   environment variables. The **service role key must never reach the client**.
4. **All data access goes through RLS.** Never trust the client to decide permissions, and
   never query Postgres with a privileged connection inside a user request.
5. **Do not break the build.** Before declaring a task done: `pnpm check` and `pnpm build`
   must pass with no new errors or warnings.
6. **Spanish UI, ASCII slugs.** `Ángel Arango` → `angel-arango`. Slugs are lowercase
   `kebab-case` ASCII.
7. **Database schema changes are migrations.** Never edit Supabase through the Studio UI —
   the change would be untracked and lost. New tables ship with RLS + policies in the same
   migration.
8. **No ORM** (`@supabase/supabase-js` only — see ADR-009 in `ARCHITECTURE.md`).
9. **Small, reviewable changes.** One PR = one topic. Never reformat unrelated files.
10. **No destructive commands** without explicit user confirmation.
11. **Keep documentation current.** Update the relevant Markdown files when completing
  each roadmap item, including `TODO.md` status and any affected project guidance.
12. **Use relevant skills.** When a task reaches a project area covered by an available
  skill, read and follow that skill's instructions at the point they are needed.
13. **Ask when a choice is needed.** If a task requires a product or technical decision
  that is not settled by these docs or existing patterns, ask the user before choosing.
14. **Delegate commands when possible.** Delegate all commands to the background execution
  system whenever it is available. Use foreground execution only when delegation is
  unavailable or the command needs immediate output or interactive input.

## 4. Expected project structure

```
/
├── DOCS/
│   ├── AGENTS.md            ← this file
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── TODO.md
├── public/
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 20261025000000_init.sql   ← source of truth for the DB schema
├── scripts/
│   └── seed.mjs           ← offline-only seed import; service-role key must not reach runtime
├── src/
│   ├── components/
│   │   ├── TarjetaAutor.astro
│   │   ├── TarjetaObra.astro
│   │   ├── LineaTiempo.astro
│   │   └── ListaNoticias.astro
│   ├── lib/
│   │   ├── database.types.ts   ← generated from Supabase schema; never hand-edited
│   │   ├── supabase.ts         ← per-request server client
│   │   ├── content.ts          ← typed read queries for authors/works
│   │   └── zod-schemas.ts      ← runtime validation of DB responses
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── autores/{index,[slug]}.astro
│   │   ├── obras/{index,[slug]}.astro
│   │   ├── cronologia.astro
│   │   ├── noticias.astro
│   │   └── mi-perfil.astro
│   └── styles/global.css
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

UI copy and CSS class intent are in Spanish; identifiers, file names and code comments are in
English. Component names are `PascalCase` but keep the Spanish domain nouns (`TarjetaAutor`).

## 5. Data access layer (replaces Content Collections)

There are **no Content Collections** in this project. Editorial content is read from Supabase
and validated at the app boundary:

```ts
// src/lib/database.types.ts  ← generated: supabase gen types typescript --linked
import { createClient } from '@supabase/supabase-js';

// Server-side only: builds a client per request carrying the user's JWT so RLS applies.
export function createServerSupabaseClient() { ... }
```

Read queries live in `src/lib/content.ts` and return Zod-validated data:

```ts
import { z } from 'astro/zod';

const AutorSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  fullname: z.string(),
  pseudonyme: z.string().nullable(),
  age: z.number().int().nullable(),
  birthdate: z.string().nullable(),
  biography: z.string(),
  is_published: z.boolean(),
  slug: z.string(),
  // …
});

export async function getAutorPublicado(slug: string) {
  const { data, error } = await sb
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return AutorSchema.parse(data);
}
```

Rules:
- **Zod at the boundary:** every Supabase response is parsed before reaching components.
  DB columns are trusted for structure; values are validated.
- Genres are `smallint[]` referencing `genres.id`; validate membership against the genres list.
- Slugs are `kebab-case` ASCII, unique per table.
- Server client is built per request (cookies → JWT → RLS). Never a singleton with the
  service role in page code.

## 6. Rendering model

- **Content pages** (`/`, `/autores`, `/autores/[slug]`, `/obras`, …): prerendered at build
  time by reading Supabase. Deployed to Cloudflare Pages as static HTML (zero runtime cost,
  SEO-friendly).
- **Rebuilds on content change:** a Supabase webhook (pg_net / webhook trigger) calls the
  Cloudflare Deploy Hook, debounced. The last good deployment stays live if a build fails.
- **`/noticias`**: SSR (`prerender = false`), Live Content Collections or server `fetch`,
  cached with `routeRules`. Mandatory fallback on API failure.
- **`/mi-perfil`, `/entrar`, `/salir`**: SSR, authenticated.

## 7. Database, auth and data access

**No ORM.** See ADR-009 in `ARCHITECTURE.md`. Concretely:

- Queries go through `@supabase/supabase-js` carrying the user's JWT; Postgres RLS applies.
- Schema changes are plain SQL in `supabase/migrations/`, applied with the Supabase CLI.
- `src/lib/database.types.ts` is generated (`supabase gen types typescript`) and committed.
  Regenerate after every migration. Never edit by hand.
- The service-role client is allowed only in offline scripts (seeding, data export), never in
  a route handler serving user input.
- `@astrojs/db` is not an option (removed in Astro 7).

Roles: `admin`, `author` (English domain values). `users` links a Supabase Auth user to a
`roles` row. `users`/`roles` has no write policies for app users.

RLS summary for content tables:

| Actor | `authors` / `works` |
| --- | --- |
| `anon` | read `is_published = true` only |
| `authenticated` (owner) | read own works via `author_works` / `created_by`; update own works |
| `admin` | read and update everything; publish/unpublish any work |

Column-level triggers prevent non-admins from changing `authors.owner_user_id` or
`works.created_by`. `author_works` inserts/deletes are allowed only for the owner of the
linked `authors` row (or an admin).

## 8. Accepted sources for biographical data

Only verifiable sources. Priority order:

1. **Korad** magazine (taller "Espacio Abierto"), especially issue 53 (2025) with
   "Cronología de la ciencia ficción cubana 1999–2026".
2. **Secretos del Futuro** anthology (2005) and its prologue (four stages of the genre).
3. **Tiempos Oscuros** magazine (`archive.org` archives).
4. Cuban publisher catalogues, institutional sites, national ISBN registry.
5. Reputable interviews or press coverage.

Every work row stores a `link` to its source. If a source disappears, note it in `TODO.md`.

## 9. Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm check                 # astro check: types + references
pnpm lint
pnpm format

pnpm db:start              # local Supabase stack (Docker)
pnpm db:reset              # replay migrations locally
pnpm db:push               # push migrations to the linked remote project
pnpm db:types              # regenerate src/lib/database.types.ts
```

No test runner yet. When added: **Vitest** for logic, **Playwright** for critical routes.

## 10. Code conventions

- TypeScript `strict`. No `any`; use `unknown` + Zod for external input.
- Astro components `PascalCase`; utilities `camelCase`.
- `src/lib/` owns data access and domain logic. Page frontmatter stays thin.
- Accessibility is mandatory: semantic HTML, one `<h1>` per page, meaningful `alt`, visible
  focus, AA contrast, full keyboard navigation.
- Dates: ISO 8601 (`YYYY-MM-DD`) in data; format with `Intl.DateTimeFormat('es-CU')`.
- Env vars via `astro:env/server` (secrets) or `astro:env/client` (public). Declared in
  `astro.config.mjs` `env.schema`.
- No external images without explicit `width`/`height`; lazy-load below the fold.

## 11. Astro 7 gotchas

| Change | Consequence |
| --- | --- |
| **Rust** compiler is default | Unclosed tags are **errors**. Invalid HTML is no longer auto-corrected. |
| Markdown rendered by **Sätteri** | `remark`/`rehype` are not installed by default. For unified plugins, add `@astrojs/markdown-remark`. |
| `src/fetch.ts` is reserved | Do not create that file for anything else; rename it or set `fetchFile`. |
| `@astrojs/db` removed | Do not propose it. Supabase is the database. |
| `compressHTML` defaults to `'jsx'` | Served HTML whitespace may differ; do not write tests that depend on exact whitespace. |
| Vite 8 | Vite plugins must support Vite 8. |
| `cache` and `routeRules` stable | Configure at the root of `astro.config.mjs`, not under `experimental`. |

## 12. Git

- Default branch: `main` (protected). Work branches: `feat/…`, `fix/…`, `content/…`,
  `docs/…`, `chore/…`.
- **Conventional Commits** (see `CONTRIBUTING.md`). English commit messages.
- Before committing: `pnpm check && pnpm build`.
- Never rewrite published history on `main`.

## 13. Definition of done

- [ ] `pnpm check` passes.
- [ ] `pnpm build` passes.
- [ ] No secrets or `.env` in the diff.
- [ ] No new `any`, no `@ts-ignore` without a justifying comment.
- [ ] New routes have `<title>`, `description` and canonical.
- [ ] New work rows have a `link` to their source and original wording.
- [ ] New Supabase tables ship with RLS enabled **and** policies in the same migration.
- [ ] Database types regenerated after any schema change.
- [ ] Architecture decisions recorded in `ARCHITECTURE.md`.
- [ ] Follow-ups recorded in `TODO.md`.
