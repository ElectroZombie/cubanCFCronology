# TODO.md — Roadmap

> Status: frontend and initial Supabase data layer scaffolded (Astro 7.4.2, Tailwind 4,
> check/lint/format configuration, BaseLayout, index page, Supabase client, Zod schemas,
> validated content readers, and offline seed runner). The migration was validated against
> PostgreSQL 18 (16 RLS assertions passed). npm dependencies are installed and lint/format checks
> pass. `npm run check` and `npm run build` pass cleanly. Supabase local project initialized via
> `supabase init`; remote project creation deferred by the user. All roadmap items tracked.
>
> Legend: `- [ ]` todo · `- [x]` done · `- [~]` in progress · `⛔` blocked

## Work tracking

- At every step, commit the changes according to the work completed.

---

## Phase 0 — Project bootstrap

**Exit criterion:** `npm run dev` serves the site and `npm run build` writes `dist/` without errors.

- [x] Initialise Astro 7 at the repo root (`pnpm create astro@latest . --template minimal --typescript strict`)
- [x] Pin Astro major version in `package.json` (no `^` on the major) — pinned to `7.4.2`
- [x] Add Tailwind 4 with `@tailwindcss/vite` and `src/styles/global.css`
- [x] Install `@astrojs/check` + TypeScript; wire up `npm run check` — configured and installed; passes cleanly
- [x] Configure ESLint + Prettier (`.astro` + `prettier-plugin-astro`) — configured; `npm run lint` and `npm run format:check` pass
- [x] Create `astro.config.mjs` (`site`, integrations, `env.schema`, `compressHTML`)
- [x] Create `src/layouts/BaseLayout.astro` (head, meta, skip link, footer)
- [x] Create `src/pages/index.astro` ("under construction", honest copy)
- [x] `.editorconfig`, `.nvmrc`, `.gitignore` (`.env`, `.astro/`, `dist/`)
- [x] Real `README.md`: what it is, how to run it, links to `DOCS/`
- [x] GitHub Actions CI: `npm run check` + `npm run build` on every PR — passes cleanly

## Phase 1 — Content model in Supabase

**Exit criterion:** migration drafted and validated (16/16 RLS assertions passed on PG 18); types generated after project link; read queries return Zod-validated data.

- [x] Draft `supabase/migrations/20261025000000_init.sql` (roles, users, genres, editorials,
      authors, works, author_works, editorial_work + RLS, triggers, grants)
- [x] Validate migration + 16 RLS assertions against clean PostgreSQL 18 with stubbed auth
- [x] Create the Supabase project locally via `supabase init`; config.toml committed — done. Remote project creation deferred by the user.
- [x] `supabase init`; commit `supabase/config.toml` — done (local project initialized)
- [ ] `supabase link --project-ref ` → `supabase db push` — requires remote project
- [ ] `supabase gen types typescript --linked > src/lib/database.types.ts` — requires linked project; never hand-write this file
- [x] Create `src/lib/supabase.ts` (per-request server client from cookies; public client for builds)
- [x] Create `src/lib/content.ts` (author/work reads parsed at the data boundary)
- [x] Create `src/lib/zod-schemas.ts` (runtime validation of DB responses)
- [~] Seed data: idempotent runner added for `supabase/seed/korad-chronology.json` (143 works,
      52 authors, 34 editorials); missing work links use the source chronology URL; execute
      after local/remote Supabase is available

## Phase 2 — Public pages (prerendered from Supabase)

**Exit criterion:** a visitor navigates autor → obra → cronología sobre HTML estático.

- [x] Build-time fetch in Astro page frontmatter calling `src/lib/content.ts` (configured builds fetch; no credentials shows setup state)
- [x] `/autores` list of public author profiles
- [x] `/autores/[slug]` profile + published works
- [x] `/obras` catalogue (filters: title, year, type, author)
- [x] `/obras/[slug]`
- [x] `/cronologia` timeline (works of type `chronicle`, accessible semantic list)
- [ ] `TarjetaAutor`, `TarjetaObra`, `LineaTiempo` components
- [ ] Main navigation, breadcrumbs, custom 404
- [ ] Empty and error states with useful copy
- [ ] Cross-links (obra → autor, cronología → autor, autor → obras/cronología)
- [ ] Content fallback when Supabase is unreachable at build (previous deploy stays live)

## Phase 3 — Deploy hook (rebuild on content change)

- [ ] Cloudflare Deploy Hook URL created
- [ ] Supabase webhook / pg_net trigger on `authors`/`works` writes → POST to
      deploy hook (debounced, e.g. 5-minute window)
- [ ] Verify: edit a row in Supabase Studio → new build triggers → updated page live
- [ ] Verify: last good deployment stays live if a build fails

## Phase 4 — Live news

**Exit criterion:** `/noticias` shows real data and survives API downtime.

- [ ] Pick provider (Directorio Cubano if open, otherwise NewsAPI/APITube)
- [ ] `src/lib/noticias.ts` (loader + normalisation)
- [ ] `src/live.config.ts` (`defineLiveCollection` + Zod schema) **or** server `fetch`
- [ ] `/noticias` with `prerender = false` and explicit `error` handling
- [ ] Fallback: cached headlines or empty state linking to sources
- [ ] `routeRules` cache in `astro.config.mjs`
- [ ] Review provider terms of use and attribution

## Phase 5 — Auth and author profiles

**Exit criterion:** an author registers, gets a `users` row (role `author`); an admin creates
links them to an `authors` record via `owner_user_id`; the author drafts/publishes works.
RLS proven with two users.

- [ ] `src/lib/supabase.ts` + `src/middleware.ts` (`Astro.locals.user`)
- [ ] `/entrar`, `/salir`, password recovery
- [ ] `/mi-perfil` (validated form: Zod client + server)
- [ ] Admin creates `authors` records and sets `owner_user_id` (admin review screen)
- [ ] Author toggles `is_published` on own works (guard triggers tested)
- [ ] Rate limiting on auth endpoints
- [ ] RLS re-audit against remote project (anon cannot see drafts; authors only own rows)
- [ ] Keep-alive ping so the free Supabase project does not pause

## Phase 6 — Quality

- [ ] Vitest for `src/lib/` (content queries, Zod schemas, dates)
- [ ] Playwright for critical routes (home, author, work, chronology)
- [ ] `@axe-core/playwright` on the five main routes
- [ ] Lighthouse CI (Perf ≥ 95, A11y = 100, SEO = 100)
- [ ] JSON-LD validated; `sitemap.xml` + `robots.txt`
- [ ] Security headers verified in production
- [ ] Content review: every work row has a `link` to its source; original wording

## Phase 7 — Deployment

- [ ] Connect repo to Cloudflare Workers/Pages (`@astrojs/cloudflare`, hybrid output)
- [ ] Secrets in Cloudflare (not repo): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`,
      `NEWS_API_KEY`
- [ ] Domain + DNS + HTTPS + final canonical `site`
- [ ] Preview deploys per branch
- [ ] Post-deploy verification: SSG routes, SSR news/profile, forms
- [ ] Backup: periodic Supabase export

## Phase 8 — Public launch

- [ ] `/acerca`, `/fuentes`, `/licencia` (content CC BY-SA 4.0; code MIT)
- [ ] Outreach to workshops, magazines, genre communities
- [ ] Onboard first 3–5 real authors
- [ ] Contact / corrections channel
- [ ] Accessibility review with real users

---

## Backlog (not committed)

- [ ] Dataset export as JSON and CSV
- [ ] Public read-only API
- [ ] Full-text search (Pagefind)
- [ ] Dark mode
- [ ] RSS feeds
- [ ] Geographic map of authors/events
- [ ] English version
- [ ] In-house editorial panel if forms become insufficient

## Known technical debt

- [ ] Build-time dependency on Supabase availability (build fails if DB down; old deploy stays live)
- [ ] Provenance is a single `link` per work — no multi-source `fuentes` table (future migration: normalized `sources` table to cite multiple sources per work)
- [ ] No test runner until Phase 6
- [ ] Database types must be regenerated after every migration

## Open questions

- Who maintains the chronology, and how often? Editorial committee?
- Publisher permission needed for cover images?
- Is CC BY-SA acceptable to all contributors?
- Which news provider has terms compatible with free cultural use?
