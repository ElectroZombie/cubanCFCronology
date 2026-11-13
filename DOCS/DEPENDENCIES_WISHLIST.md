# Dependencies Wishlist

> Status: Comprehensive wishlist covering entire project roadmap (Phase 0-8 + Backlog). Generated after Phase 0-6 completion.
> All items are categorized by phase, with dependencies, implementation approach, and estimated effort.

---

## Current Dependencies

### Production dependencies (11 packages)
```json
{
  "@astrojs/cloudflare": "^14.0.0",
  "@astrojs/sitemap": "^3.0.0",
  "@supabase/ssr": "^0.12.7",
  "@supabase/supabase-js": "^2.118.0",
  "@tailwindcss/vite": "^4.0.0",
  "astro": "7.4.2",
  "cookie": "^2.0.1",
  "tailwindcss": "^4.0.0"
}
```

### Development dependencies (10 packages)
```json
{
  "@astrojs/check": "^0.9.12",
  "@vitest/coverage-v8": "^5.1.0",
  "eslint": "^10.0.0",
  "eslint-plugin-astro": "^3.2.1",
  "jsdom": "^31.0.0",
  "prettier": "^3.9.10",
  "prettier-plugin-astro": "^1.1.2",
  "typescript": "^6.0.3",
  "typescript-eslint": "^8.72.1",
  "vitest": "^5.1.0"
}
```

---

## Phase 0 — Project bootstrap (already complete)

**Status:** ✅ All items complete

**Dependencies:** None (all core packages already installed)

---

## Phase 1 — Content model in Supabase

**Status:** 🔄 7/9 items complete (blocked by remote project)

### Item 1: `supabase link` — Link local project to remote Supabase
**Purpose:** Connect local Supabase CLI to remote project for deployment

**Current state:** Local project initialized, remote project creation deferred by user

**Dependencies needed:** None (Supabase CLI already installed)

**Implementation approach:**
- Run `supabase link --project-ref <project-ref>`
- Verify connection with `supabase status`

**Estimated effort:** 5 minutes

**Risk:** None (requires user to create remote project first)

---

### Item 2: `supabase gen types typescript --linked` — Generate database types
**Purpose:** Generate TypeScript types from remote database schema

**Current state:** None (types must be regenerated after linking)

**Dependencies needed:** None (Supabase CLI already installed)

**Implementation approach:**
- Run `supabase gen types typescript --linked > src/lib/database.types.ts`
- Commit generated types
- Update TODO.md status

**Estimated effort:** 2 minutes

**Risk:** None (types are generated from schema)

---

### Item 3: Seed data execution
**Purpose:** Load 143 works, 52 authors, 34 editorials into Supabase

**Current state:** Seed runner stub exists (`scripts/seed.mjs`)

**Dependencies needed:** None (seed runner uses offline service-role key)

**Implementation approach:**
- Set `SUPABASE_SERVICE_ROLE_KEY` environment variable
- Run `npm run db:seed` (or `supabase db seed`)
- Verify count in Supabase Studio
- Document seed process in `DOCS/SEEDING.md`

**Estimated effort:** 10 minutes

**Risk:** Low (seed is idempotent)

---

## Phase 2 — Public pages (already complete)

**Status:** ✅ All items complete

**Dependencies:** None (all core packages already installed)

---

## Phase 3 — Deploy hook (rebuild on content change)

**Status:** 🔄 0/4 items complete

### Item 4: Cloudflare Deploy Hook URL
**Purpose:** Create webhook URL that Cloudflare can POST to trigger rebuilds

**Current state:** None

**Dependencies needed:** None (Cloudflare dashboard)

**Implementation approach:**
- Go to Cloudflare Pages → Project → Deployments → Settings
- Generate Deploy Hook URL
- Copy URL to `.env.example` and `DOCS/DEPLOYMENT.md`

**Estimated effort:** 5 minutes

**Risk:** None (webhook URL is public)

---

### Item 5: Supabase webhook / pg_net trigger
**Purpose:** Trigger Cloudflare deploy hook on `authors`/`works` writes

**Current state:** None

**Dependencies needed:** None (pg_net is built into Supabase)

**Implementation approach:**
- Create pg_net extension in Supabase
- Create trigger function that POSTs to Deploy Hook URL
- Add debounce (5-minute window) to prevent spam
- Test with manual INSERT in Supabase Studio

**Estimated effort:** 30 minutes

**Risk:** Medium (webhook could be abused; add rate limiting)

---

### Item 6: Verify rebuild triggers
**Purpose:** Confirm that editing Supabase rows triggers new builds

**Current state:** None

**Dependencies needed:** None

**Implementation approach:**
- Edit a work row in Supabase Studio
- Wait 5 minutes (debounce window)
- Check Cloudflare Pages deployment history
- Verify new HTML is served

**Estimated effort:** 10 minutes

**Risk:** None (verification only)

---

### Item 7: Verify last-good deployment stays live on failure
**Purpose:** Ensure site remains accessible if build fails

**Current state:** None

**Dependencies needed:** None

**Implementation approach:**
- Intentionally break build (e.g., invalid HTML)
- Trigger rebuild via Deploy Hook
- Verify previous deployment stays live
- Fix build issue, trigger rebuild again
- Verify new deployment becomes active

**Estimated effort:** 15 minutes

**Risk:** Low (can be reverted)

---

## Phase 4 — Live news (already complete)

**Status:** 🔄 6/7 items complete (provider selection pending)

### Item 8: Pick news provider
**Purpose:** Choose API for `/noticias` page

**Current state:** Stub exists, provider not chosen

**Dependencies needed:** Depends on provider choice

**Options:**

| Provider | Pros | Cons | License | Effort |
|----------|------|------|---------|--------|
| **Directorio Cubano** | Free, local, CC0 | Limited API, no docs | CC0 | 1 hour |
| **NewsAPI** | Well-documented, free tier | Rate limits (100 req/day), requires key | API key | 2 hours |
| **APITube** | Free, no key | Limited, unverified | API key | 1.5 hours |

**Implementation approach (if Directorio Cubano):**
- Document API endpoints in `src/lib/noticias.ts`
- Add attribution to footer
- Test with `npm run dev`

**Estimated effort:** 1-2 hours (depends on provider)

**Risk:** Medium (API may be unavailable or rate-limited)

---

## Phase 5 — Auth and author profiles

**Status:** 🔄 5/8 items complete

### Item 9: Author toggles `is_published` on own works
**Purpose:** Allow authors to publish/unpublish their works

**Current state:** RLS policies exist, but no UI to toggle `is_published`

**Dependencies needed:** None (can use existing Supabase client + Zod schema)

**Implementation approach:**
- Create `/autores/[slug]/obras/[slug]/edit` page with toggle form
- Toggle button uses `@astrojs/cloudflare` SSR + Supabase update
- Zod validation for the toggle action
- Rate limiting middleware already handles auth endpoints
- Add rate limiting (10 toggles per minute per user)

**Estimated effort:** 1-2 hours

**Risk:** Low (UI only, backend RLS handles permissions)

---

### Item 10: RLS re-audit against remote project
**Purpose:** Verify RLS policies work correctly with remote database

**Current state:** Policies validated locally against clean PG 18

**Dependencies needed:** None (Supabase Studio)

**Implementation approach:**
- Connect to remote Supabase project
- Test as `anon` user: cannot see unpublished works
- Test as `authenticated` user: can only see own works
- Test as `admin` user: can see everything
- Document findings in `DOCS/RLS_AUDIT.md`

**Estimated effort:** 1 hour

**Risk:** Low (verification only)

---

### Item 11: Keep-alive ping for free Supabase project
**Purpose:** Prevent free-tier Supabase project from pausing

**Current state:** None (project not yet linked to remote)

**Dependencies needed:** `node-cron` (devDependency)

**Implementation approach:**
- Add `node-cron` to devDependencies
- Create `src/lib/ping-supabase.ts` with periodic GET to `/api/ping` endpoint
- Cron job runs every 30 minutes (Supabase free tier: 5 minutes)
- Runs in background (not blocking build)
- Add `PING_INTERVAL_MS` to `.env.example`

**Estimated effort:** 30 minutes

**Risk:** Low (purely additive, no DB writes)

---

## Phase 6 — Quality

**Status:** 🔄 3/6 items complete

### Item 12: Playwright for critical routes
**Purpose:** E2E testing of critical user flows

**Current state:** Blocked (no browser installations available)

**Dependencies needed:** `@playwright/test` (devDependency)

**Implementation approach:**
- Add `@playwright/test` to devDependencies
- Create `playwright.config.ts` with 5 critical routes
- Create `tests/e2e/critical-routes.spec.ts`
- Test: home, autores, obras, cronologia, 404, noticias
- Run `npx playwright install chromium` (requires browser)

**Estimated effort:** 1 hour

**Risk:** Medium (requires browser installation; user uses Falkon)

---

### Item 13: `@axe-core/playwright` on the five main routes
**Purpose:** Automated accessibility testing

**Current state:** Blocked (requires Playwright)

**Dependencies needed:** `@axe-core/playwright` (devDependency)

**Implementation approach:**
- Add `@axe-core/playwright` to devDependencies
- Configure in `playwright.config.ts`
- Add test for each route
- Run `npx playwright test --project=chromium`
- Fix any A11y violations

**Estimated effort:** 1 hour

**Risk:** Medium (requires Playwright, blocked by user)

---

### Item 14: Content review: verify every work has a `link` to source
**Purpose:** Ensure data provenance for all 143 works

**Current state:** Seed data has source URLs, but not verified

**Dependencies needed:** None (manual review using Supabase Studio)

**Implementation approach:**
- Export works with missing `link` to CSV
- Review against original Korad chronology
- Update seed data and re-seed
- Document sources in `DOCS/SOURCES.md`
- Add `source_review` column to `works` table (if needed)

**Estimated effort:** 2-3 hours (manual review)

**Risk:** None

---

## Phase 7 — Deployment

**Status:** 🔄 0/6 items complete

### Item 15: Connect repo to Cloudflare Pages
**Purpose:** Deploy the site to Cloudflare

**Current state:** `@astrojs/cloudflare` installed, but not wired

**Dependencies needed:** None (already installed)

**Implementation approach:**
- Verify Cloudflare adapter is configured in `astro.config.mjs`
- Create `wrangler.toml` for local preview
- Test `npm run preview` with Cloudflare adapter
- Document deployment steps in `DOCS/DEPLOYMENT.md`
- Verify build output (`dist/`) is static HTML

**Estimated effort:** 1 hour

**Risk:** None (static build)

---

### Item 16: Configure secrets in Cloudflare
**Purpose:** Store Supabase and news API keys securely

**Current state:** `.env` file exists locally, not in Cloudflare

**Dependencies needed:** None (Cloudflare dashboard or Wrangler CLI)

**Implementation approach:**
- Create secrets via Cloudflare dashboard or Wrangler CLI:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `NEWS_API_KEY` (if news provider chosen)
- Document secret names in `DOCS/DEPLOYMENT.md`
- Verify secrets are loaded via `astro:env/client`
- Test `npm run preview` with secrets

**Estimated effort:** 30 minutes

**Risk:** None (secrets are environment variables)

---

### Item 17: Set up domain + DNS + HTTPS
**Purpose:** Make the site publicly accessible

**Current state:** Site builds to `dist/`, no domain configured

**Dependencies needed:** None (domain registrar + Cloudflare)

**Implementation approach:**
- Purchase domain (`cubancfcronology.com` or alternative)
- Add DNS A/CNAME records in Cloudflare
- Enable HTTPS (Cloudflare auto-renewal)
- Set canonical `site` in `astro.config.mjs`
- Update `robots.txt` with new URL
- Verify `sitemap-index.xml` references correct domain

**Estimated effort:** 1-2 hours (depends on domain availability)

**Risk:** None

---

### Item 18: Configure preview deploys per branch
**Purpose:** Test changes before merging to main

**Current state:** GitHub Actions runs `npm run check` + `npm run build`

**Dependencies needed:** None (GitHub Actions already configured)

**Implementation approach:**
- Verify GitHub Actions workflow exists
- Add preview URL badge to README
- Document branch deployment process
- Test preview deployment locally (`npm run preview`)
- Add preview deployment to Cloudflare Pages

**Estimated effort:** 30 minutes

**Risk:** None

---

### Item 19: Post-deploy verification
**Purpose:** Verify SSG routes, SSR news/profile, forms work in production

**Current state:** None

**Dependencies needed:** None

**Implementation approach:**
- Deploy to Cloudflare Pages
- Verify `/` loads correctly
- Verify `/autores`, `/obras`, `/cronologia` load correctly
- Verify `/noticias` loads with fallback
- Verify `/mi-perfil` redirects when not logged in
- Verify `/entrar`, `/salir` forms work
- Test `is_published` toggle (if implemented)

**Estimated effort:** 30 minutes

**Risk:** Low (verification only)

---

### Item 20: Backup: periodic Supabase export
**Purpose:** Protect against data loss

**Current state:** None

**Dependencies needed:** None (manual backup) or `pg_dump` (CLI)

**Implementation approach (manual):**
- Weekly backup in Supabase Studio
- Export to SQL file
- Store in version control (with `.gitignore`)
- Document backup process in `DOCS/BACKUP.md`

**Implementation approach (automated):**
- Add `pg_dump` to devDependencies
- Create `scripts/backup.js` with `pg_dump` command
- Add GitHub Actions workflow for weekly backup
- Store backups in GitHub Releases

**Estimated effort:** 15 minutes (manual) or 1 hour (automated)

**Risk:** Medium (data loss if backup fails)

---

## Phase 8 — Public launch

**Status:** 🔄 1/5 items complete

### Item 21: Create `/fuentes` page
**Purpose:** Document all data sources used in the project

**Current state:** None (only `/acerca` exists)

**Dependencies needed:** None (static page)

**Implementation approach:**
- Create `src/pages/fuentes.astro`
- List all sources (Korad, Secretos del Futuro, Tiempos Oscuros, etc.)
- Include source URLs and citation format
- Add to navigation
- Add to sitemap

**Estimated effort:** 30 minutes

**Risk:** None

---

### Item 22: Outreach to workshops, magazines, genre communities
**Purpose:** Promote the site and gather feedback

**Current state:** None

**Dependencies needed:** None

**Implementation approach:**
- Identify Cuban SF/F communities (workshops, magazines, Discord servers)
- Create outreach email/message template
- Send messages to 10-15 organizations
- Track responses in `DOCS/OUTREACH.md`

**Estimated effort:** 2-3 hours

**Risk:** None

---

### Item 23: Onboard first 3–5 real authors
**Purpose:** Get real content on the site

**Current state:** None

**Dependencies needed:** None

**Implementation approach:**
- Identify 3-5 Cuban SF/F authors with existing works
- Guide them through registration process
- Create `authors` records via `/admin` page
- Verify they can log in and toggle `is_published`
- Document onboarding process in `DOCS/ONBOARDING.md`

**Estimated effort:** 3-4 hours

**Risk:** Low

---

### Item 24: Contact / corrections channel
**Purpose:** Provide feedback mechanism for users

**Current state:** None

**Dependencies needed:** None

**Implementation approach:**
- Create `/contacto` page with email form
- Add form to `src/pages/contacto.astro`
- Use Supabase to store messages (or email via formspree)
- Add contact info to footer
- Test form submission

**Estimated effort:** 1 hour

**Risk:** Low

---

### Item 25: Accessibility review with real users
**Purpose:** Ensure site is accessible to all users

**Current state:** None

**Dependencies needed:** None

**Implementation approach:**
- Recruit 5-10 users with disabilities
- Guide them through site with screen readers, keyboard navigation
- Collect feedback in `DOCS/ACCESSIBILITY_REVIEW.md`
- Fix any issues found
- Update accessibility checklist

**Estimated effort:** 4-6 hours

**Risk:** None

---

## Backlog (not committed)

**Status:** 🔄 0/8 items complete

### Item 26: Dataset export as JSON and CSV
**Purpose:** Allow users to download the complete dataset

**Current state:** None (seed data exists in JSON)

**Dependencies needed:** `csv-writer` (devDependency)

**Implementation approach:**
- Add `csv-writer` to devDependencies
- Create `src/lib/export.ts` with export functions
- Add `/export` route with format selection (JSON/CSV)
- Rate limit exports (10 per minute)
- Add export buttons to `/autores`, `/obras`, `/cronologia`

**Estimated effort:** 1 hour

**Risk:** Low (no security concerns)

---

### Item 27: Public read-only API
**Purpose:** Allow programmatic access to works/authors

**Current state:** None (only static HTML)

**Dependencies needed:** `@supabase/supabase-js` (already installed)

**Implementation approach:**
- Create `src/pages/api/works.ts` (GET /api/works)
- Create `src/pages/api/authors.ts` (GET /api/authors)
- Create `src/pages/api/works/[id].ts` (GET /api/works/:id)
- Create `src/pages/api/works/[id]/chapters.ts` (GET /api/works/:id/chapters)
- Apply RLS policies for public read access
- Document API endpoints in `DOCS/API.md`
- Add rate limiting (100 req/min per IP)
- Add OpenAPI schema (`swagger.yaml`)

**Estimated effort:** 2 hours

**Risk:** Medium (exposes DB structure)

---

### Item 28: Full-text search (Pagefind)
**Purpose:** Enable searching works by title, author, year

**Current state:** None (only filter on obras page)

**Dependencies needed:** `pagefind` (devDependency + CLI)

**Implementation approach:**
- Add `pagefind` to devDependencies
- Install Pagefind CLI: `npm install -g pagefind`
- Configure Pagefind in `astro.config.mjs` or `pagefind.config.json`
- Add search UI component (`src/components/Search.astro`)
- Wire search to Pagefind results
- Add search bar to all pages
- Test search across 143 works

**Estimated effort:** 3-4 hours

**Risk:** Low (static search index)

---

### Item 29: Dark mode
**Purpose:** Allow users to switch between light and dark themes

**Current state:** None

**Dependencies needed:** None (Tailwind 4 supports dark mode)

**Implementation approach:**
- Add dark mode toggle component (`src/components/DarkModeToggle.astro`)
- Configure Tailwind 4 dark mode: `class` strategy
- Add theme preference to localStorage
- Test dark mode on all pages
- Add to navigation

**Estimated effort:** 1 hour

**Risk:** Low

---

### Item 30: RSS feeds
**Purpose:** Subscribe to new works and news

**Current state:** None (no RSS endpoints)

**Dependencies needed:** `rss` (devDependency)

**Implementation approach:**
- Add `rss` to devDependencies
- Create `/rss/works.xml` feed for new works
- Create `/rss/noticias.xml` feed for news
- Add RSS badges to `/acerca` page
- Document feed URLs in `DOCS/FEEDS.md`
- Add feeds to sitemap

**Estimated effort:** 1 hour

**Risk:** Low (no security concerns)

---

### Item 31: Geographic map of authors/events
**Purpose:** Visual representation of Cuban SF/F geography

**Current state:** None

**Dependencies needed:** `leaflet` (prodDependency) + `@types/leaflet` (devDependency)

**Implementation approach:**
- Add `leaflet` to dependencies (for client-side map)
- Add `@types/leaflet` to devDependencies
- Create `src/components/MapaGeo.astro` with Leaflet integration
- Fetch author coordinates from Supabase (add `lat`/`lng` columns to `authors`)
- Add map to `/autores` and `/cronologia` pages
- Configure map tiles (OpenStreetMap)
- Add markers for authors and works
- Test map interactions

**Estimated effort:** 4-6 hours

**Risk:** Medium (requires geographic data)

---

### Item 32: English version
**Purpose:** Translate the site to English for international audience

**Current state:** None

**Dependencies needed:** None (can use i18n, but manual translation recommended)

**Implementation approach:**
- Decide on i18n strategy (subdomains `/en/` or `/es/`)
- Create `src/pages/en/` directory structure
- Translate all pages (manual translation, not machine translation)
- Add language switcher component
- Test English version
- Document translation process in `DOCS/I18N.md`

**Estimated effort:** 20-30 hours (full translation)

**Risk:** High (maintaining two versions)

---

### Item 33: In-house editorial panel if forms become insufficient
**Purpose:** Allow editors to manage content without Supabase Studio

**Current state:** None

**Dependencies needed:** None (can use existing `/admin` page)

**Implementation approach:**
- Extend `/admin` page with more features:
  - Edit works (title, year, type, link)
  - Add new works
  - Manage author profiles
  - View statistics
- Add role-based access (admin only)
- Test editor panel
- Document usage in `DOCS/EDITORIAL_PANEL.md`

**Estimated effort:** 3-4 hours

**Risk:** Low (can use existing admin page)

---

## Known Technical Debt

### Item 34: Build-time dependency on Supabase availability
**Purpose:** Ensure build doesn't fail if DB is down

**Current state:** Build fails if Supabase is unreachable

**Dependencies needed:** None

**Implementation approach:**
- Add fallback data to seed file (cached copy of works/authors)
- Use `try-catch` in page frontmatter
- Fall back to cached data if Supabase is unreachable
- Log warning if fallback is used
- Document fallback behavior in `DOCS/DEPLOYMENT.md`

**Estimated effort:** 2 hours

**Risk:** Medium (cached data may be outdated)

---

### Item 35: Provenance is a single `link` per work — no multi-source `fuentes` table
**Purpose:** Allow citing multiple sources per work

**Current state:** Single `link` column in `works` table

**Dependencies needed:** None (requires migration)

**Implementation approach:**
- Create migration to add `sources` table
- Add foreign key from `works` to `sources`
- Update seed data with multiple sources per work
- Update UI to display multiple sources
- Document schema change in `DOCS/MIGRATION_GUIDE.md`

**Estimated effort:** 2 hours

**Risk:** Medium (requires migration)

---

### Item 36: Database types must be regenerated after every migration
**Purpose:** Keep TypeScript types in sync with database schema

**Current state:** Types not yet generated (remote project not linked)

**Dependencies needed:** None (Supabase CLI)

**Implementation approach:**
- Add `db:types` script to `package.json`
- Document in `DOCS/TYPES.md`
- Add to migration checklist
- Test regeneration process

**Estimated effort:** 5 minutes

**Risk:** None

---

### Item 37: DB tests run against a local Supabase instance (`supabase start`)
**Purpose:** Test database interactions locally

**Current state:** Tests run against local Supabase, but Docker not available

**Dependencies needed:** Docker (for local Supabase)

**Implementation approach:**
- Install Docker
- Run `supabase start` in CI
- Update CI workflow to include `npm run db:start`
- Add database tests to CI pipeline
- Document testing process in `DOCS/TESTING.md`

**Estimated effort:** 1 hour

**Risk:** Medium (Docker required)

---

## Summary

### Dependencies to add (11 packages)

| Package | Type | Purpose | Phase | Priority |
|---------|------|---------|-------|----------|
| `csv-writer` | dev | CSV export functionality | Backlog (item 26) | High |
| `pagefind` | dev | Full-text search | Backlog (item 28) | High |
| `rss` | dev | RSS feed generation | Backlog (item 30) | Medium |
| `leaflet` | prod | Geographic map UI | Backlog (item 31) | Low |
| `@types/leaflet` | dev | TypeScript types for Leaflet | Backlog (item 31) | Low |
| `node-cron` | dev | Supabase keep-alive ping | Phase 5 (item 11) | Medium |
| `@playwright/test` | dev | E2E testing | Phase 6 (item 12) | Blocked |
| `@axe-core/playwright` | dev | Accessibility testing | Phase 6 (item 13) | Blocked |
| `pg_dump` | dev | Database backup (optional) | Phase 7 (item 20) | Low |

### Dependencies already installed (no action needed)

| Package | Type | Purpose | Status |
|---------|------|---------|--------|
| `@astrojs/cloudflare` | prod | Cloudflare adapter | ✅ Installed |
| `@astrojs/sitemap` | prod | Sitemap generation | ✅ Installed |
| `@supabase/ssr` | prod | Server-side Supabase client | ✅ Installed |
| `@supabase/supabase-js` | prod | Supabase client | ✅ Installed |
| `@tailwindcss/vite` | prod | Tailwind 4 integration | ✅ Installed |
| `astro` | prod | Framework | ✅ Installed |
| `cookie` | prod | Cookie parsing | ✅ Installed |
| `tailwindcss` | prod | Tailwind CSS | ✅ Installed |
| `@astrojs/check` | dev | TypeScript + Astro check | ✅ Installed |
| `@vitest/coverage-v8` | dev | Vitest coverage | ✅ Installed |
| `eslint` | dev | Linting | ✅ Installed |
| `eslint-plugin-astro` | dev | Astro ESLint rules | ✅ Installed |
| `jsdom` | dev | DOM simulation for tests | ✅ Installed |
| `prettier` | dev | Code formatting | ✅ Installed |
| `prettier-plugin-astro` | dev | Prettier for Astro | ✅ Installed |
| `typescript` | dev | TypeScript compiler | ✅ Installed |
| `typescript-eslint` | dev | ESLint + TypeScript | ✅ Installed |
| `vitest` | dev | Unit testing | ✅ Installed |

### Estimated effort by phase

| Phase | Items | Dependencies | Time |
|-------|-------|--------------|------|
| Phase 1 | 3 | None | 20 min |
| Phase 3 | 4 | None | 1 hour |
| Phase 4 | 1 | Depends on choice | 1-2 hours |
| Phase 5 | 3 | `node-cron` | 3 hours |
| Phase 6 | 3 | `@playwright/test`, `@axe-core/playwright` (blocked) | 2-3 hours |
| Phase 7 | 6 | None | 3.5 hours |
| Phase 8 | 5 | None | 10-15 hours |
| Backlog | 8 | 5 packages | 16-24 hours |
| Technical Debt | 4 | None | 5 hours |

**Total:** 11 packages, ~65-80 hours

---

## Installation order (recommended)

### Phase 1 (blocked by user)
1. User creates remote Supabase project
2. `supabase link --project-ref <ref>`
3. `supabase gen types typescript --linked > src/lib/database.types.ts`
4. `npm run db:seed`

### Phase 3 (requires Cloudflare project)
1. Create Cloudflare Pages project
2. Generate Deploy Hook URL
3. Configure webhook trigger

### Phase 4
1. Choose news provider (recommend Directorio Cubano for free, no key)

### Phase 5
1. `npm install --save-dev node-cron`

### Phase 6
1. **BLOCKED:** User must install Playwright browsers

### Phase 7
1. No installs (adapter already installed)

### Phase 8
1. No installs (static pages)

### Backlog
1. `npm install --save-dev csv-writer pagefind rss leaflet @types/leaflet`

---

## Notes

### Blocked items
- **Playwright / @axe-core:** User does not have browser installations (uses Falkon). These items remain blocked until user can install browsers.
- **Supabase link:** Still blocked by user (remote project not created).
- **News provider:** Not chosen yet (item 84 in TODO.md). Recommend Directorio Cubano for free, no-key option.

### Dependencies to avoid
- **No ORM:** Already decided to use `@supabase/supabase-js` only (no `@supabase/postgrest-js` or `@supabase/deno`).
- **No `@astrojs/db`:** Removed in Astro 7; Supabase is the database.
- **No React/Vue/Svelte:** Astro islands are sufficient; no JS framework needed.
- **No `esbuild`:** Already allowed in `package.json` `allowScripts`.

### Database types
- Must be regenerated after every migration: `supabase gen types typescript --linked > src/lib/database.types.ts`
- Never hand-edit `src/lib/database.types.ts`

### Security considerations
- **Service role key:** Must never reach the client. Only in offline scripts (`scripts/seed.mjs`).
- **RLS policies:** All data access must go through RLS, never bypass it.
- **Secrets:** Never commit `.env` files. Store in Cloudflare dashboard, not repo.
- **Rate limiting:** Auth endpoints already rate-limited (30 req/5min per IP).

### Testing considerations
- **Vitest:** Tests run against local Supabase instance (requires Docker).
- **DB tests:** Cannot run in CI without Docker.
- **E2E tests:** Blocked by Playwright browser installation.

### Performance considerations
- **Static pages:** All content pages are SSG (zero runtime cost).
- **News:** SSR with 10-minute cache.
- **Search:** Pagefind (static search index, fast).
- **Map:** Leaflet (client-side, loads on demand).

### Accessibility considerations
- **WCAG 2.1 AA:** All pages must meet AA contrast and keyboard navigation.
- **Screen reader:** All interactive elements must have proper ARIA labels.
- **Focus:** Visible focus indicators on all interactive elements.

### SEO considerations
- **Sitemap:** Generated by `@astrojs/sitemap`.
- **Robots.txt:** Custom rules with sitemap reference.
- **JSON-LD:** Organization/WebSite/Person/Book structured data.
- **Canonical URLs:** Set in `astro.config.mjs`.

### Internationalization considerations
- **Language:** Spanish (Cuba) for UI; English for docs.
- **Slugs:** ASCII kebab-case (no Unicode).
- **Date formatting:** `Intl.DateTimeFormat('es-CU')`.

---

## Quick Start: Install dependencies in order

```bash
# Phase 5
npm install --save-dev node-cron

# Backlog
npm install --save-dev csv-writer pagefind rss leaflet @types/leaflet

# Optional (for database backup)
npm install --save-dev pg-dump

# Optional (for E2E tests - requires browser install)
npm install --save-dev @playwright/test @axe-core/playwright
```

---

## References

- [Astro 7 Documentation](https://docs.astro.build/en/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS 4](https://tailwindcss.com/docs/v4-beta)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Playwright](https://playwright.dev/)
- [Pagefind](https://pagefind.app/)
- [Leaflet](https://leafletjs.com/)
