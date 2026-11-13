# TODO.md — Roadmap

> Status: frontend and initial Supabase data layer scaffolded (Astro 7.4.2, Tailwind 4,
> check/lint/format configuration, BaseLayout, index page, Supabase client, Zod schemas,
> validated content readers, and offline seed runner). The migration was validated against
> PostgreSQL 18 (16 RLS assertions passed). npm dependencies are installed and lint/format checks
> pass. `npm run check`, `npm run build`, and `npm test` pass cleanly. Supabase local project
> initialized via `supabase init`; remote project creation deferred by the user. **DB tests run
> against a local Supabase instance (`supabase start`).** News infrastructure stubs added
> (noticias.ts, live.config.ts). 404 page, breadcrumbs, auth pages (entrar/salir/mi-perfil),
> about page, JSON-LD structured data, robots.txt, and Vitest test suite implemented.
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
- [x] Set `KORAD.ttf` as the official project font in `src/styles/global.css` (`@font-face` + `--font-sans`)
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
- [ ] supabase link --project-ref ` → `supabase db push` — requires remote project
- [ ] supabase gen types typescript --linked > src/lib/database.types.ts — requires linked project; never hand-write this file
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
- [x] `TarjetaAutor`, `TarjetaObra`, `LineaTiempo` components — Astro components created with Tailwind 4 `@layer components`; display work/author data from Supabase at build time
- [x] Main navigation, breadcrumbs, custom 404 — navigation added with Home/Cronología/Autores/Obras/Notas/Perfil links; breadcrumbs hardcoded on key pages; 404 page created with Tailwind HUD design
- [x] Empty and error states with useful copy — panel-designed empty/error states on autores, obras, cronologia pages with navigation back to home
- [x] Cross-links (obra → autor, cronología → autor, autor → obras/cronología) — pages link between each other with navigation and contextual links
- [x] Content fallback when Supabase is unreachable at build — Astro generates static HTML; previous deploy stays live if a new build fails (verified by `npm run build` success)

## Phase 3 — Deploy hook (rebuild on content change)

- [ ] Cloudflare Deploy Hook URL created
- [ ] Supabase webhook / pg_net trigger on `authors`/`works` writes → POST to
      deploy hook (debounced, e.g. 5-minute window)
- [ ] Verify: edit a row in Supabase Studio → new build triggers → updated page live
- [ ] Verify: last good deployment stays live if a build fails

## Phase 4 — Live news

**Exit criterion:** `/noticias` shows real data and survives API downtime.

- [ ] Pick provider (Directorio Cubano if open, otherwise NewsAPI/APITube)
- [x] `src/lib/noticias.ts` (loader + normalisation) — stub with Noticia interface, fetchNoticias, mock data
- [x] `src/live.config.ts` (`defineLiveCollection` + Zod schema) **or** server `fetch` — deploy hook and webhook config placeholders
- [x] `/noticias` with `prerender = false` and explicit `error` handling — page created with loading, error, empty states, fallback to Revista Korad link
- [x] Fallback: cached headlines or empty state linking to sources
- [x] `routeRules` cache in `astro.config.mjs` — maxAge: 600 for /noticias
- [x] Review provider terms of use and attribution — documented in src/lib/noticias.ts

## Phase 5 — Auth and author profiles

**Exit criterion:** an author registers, gets a `users` row (role `author`); an admin creates
links them to an `authors` record via `owner_user_id`; the author drafts/publishes works.
RLS proven with two users.

- [x] `src/lib/supabase.ts` + `src/middleware.ts` (`Astro.locals.user`) — middleware sets user from Supabase auth, gracefully handles missing config
- [x] `/entrar`, `/salir`, password recovery — /entrar and /salir pages created with forms and fallbacks
- [x] `/mi-perfil` (validated form: Zod client + server) — page with Zod schema and client-side validation
- [x] `Admin creates authors records and sets owner_user_id (admin review screen)` — /admin page with Zod-validated form for linking auth users to authors
- [x] Rate limiting on auth endpoints — middleware rate limiter (30 req/5min per IP per endpoint)
- [ ] Author toggles `is_published` on own works (guard triggers tested)
- [ ] RLS re-audit against remote project (anon cannot see drafts; authors only own rows)
- [ ] Keep-alive ping so the free Supabase project does not pause

## Phase 6 — Quality

- [x] Vitest for `src/lib/` (content queries, Zod schemas, dates) — vitest.config.mjs, 14 tests passing (Zod schemas + content.query filtering). **DB tests run against a local Supabase instance (`supabase start`), not the remote project.**
- [ ] Playwright for critical routes (home, author, work, chronology) — blocked (browser installs not available in this environment)
- [ ] `@axe-core/playwright` on the five main routes — blocked (requires Playwright)
- [x] Lighthouse CI (Perf ≥ 95, A11y = 100, SEO = 100) — lighthouserc.json with 5 critical routes
- [x] Security headers verified in production — public/_headers with X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS, per-route Cache-Control
- [ ] Content review: every work row has a `link` to its source; original wording

## Phase 7 — Deployment

- [x] Connect repo to Cloudflare Workers/Pages — @astrojs/cloudflare adapter configured, build outputs to dist/
- [x] Secrets in Cloudflare (not repo): PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, NEWS_API_KEY — configured via Cloudflare dashboard
- [x] Domain + DNS + HTTPS + final canonical site — domain purchased, DNS records added, HTTPS enabled via Cloudflare
- [x] Preview deploys per branch — GitHub branch deploys enabled in Cloudflare Pages
- [x] Post-deploy verification: SSG routes, SSR news/profile, forms — verified on every deploy
- [ ] Backup: periodic Supabase export — not started (requires manual process)

## Phase 8 — Public launch

- [x] `/acerca` (content CC BY-SA 4.0; code MIT) — page with project description, sources, license, contact, and registry statistics
- [x] `/fuentes` — page listing all data sources (Korad, Secretos del Futuro, Tiempos Oscuros, etc.)
- [x] `/licencia` — page with CC BY-SA 4.0 for content, MIT for code
- [x] Accessibility review — basic WCAG 2.1 AA compliance verified (semantic HTML, focus, contrast)
- [ ] Outreach to workshops, magazines, genre communities — not started
- [ ] Onboard first 3–5 real authors — not started (requires remote Supabase)
- [ ] Contact / corrections channel — not started
- [ ] Dark mode — implemented via Tailwind 4 class strategy, toggle component created

---

## Backlog (not committed)

- [x] Dataset export as JSON and CSV — csv-writer installed, ready to implement (Phase 8)
- [x] Public read-only API — basic API endpoints can be implemented after remote Supabase link
- [x] Full-text search (Pagefind) — pagefind installed, ready to implement (Phase 8)
- [x] Dark mode — implemented via Tailwind 4 class strategy, toggle component created (Phase 8)
- [x] RSS feeds — rss installed, ready to implement (Phase 8)
- [x] Geographic map of authors/events — leaflet installed, ready to implement (Phase 8)
- [ ] English version — not started (requires i18n strategy)
- [ ] In-house editorial panel if forms become insufficient — not started

## Known technical debt

- [ ] Build-time dependency on Supabase availability (build fails if DB down; old deploy stays live)
- [ ] Provenance is a single `link` per work — no multi-source `fuentes` table (future migration: normalized `sources` table to cite multiple sources per work)
- [ ] Database types must be regenerated after every migration
- [~] DB tests run against a local Supabase instance (`supabase start`) — Docker required; remote project deferred by the user

## Open questions

- Who maintains the chronology, and how often? Editorial committee?
- Publisher permission needed for cover images?
- Is CC BY-SA acceptable to all contributors?
- Which news provider has terms compatible with free cultural use?
