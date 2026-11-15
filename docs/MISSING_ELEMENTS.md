# CubanCFCronology — Missing Elements

Missing elements by priority, reviewed together with docs/TODO.md when finishing
work. Each item links to its owning doc instead of duplicating information.

## Critical (block production launch)

| Item | Owner doc | Status | Notes |
|------|-----------|--------|-------|
| supabase link to remote project | docs/TODO.md | Done | Linked via Management API |
| Database types generated | docs/TODO.md | Done | docs/lib/database.types.ts committed |
| Seed data executed | docs/TODO.md | Done | 143 works, 52 authors, 34 editorials |
| RLS re-audit | docs/TODO.md | Done | Anon sees only published works |
| Keep-alive ping | docs/TODO.md | Done | scripts/ping-supabase.mjs, 30-min interval |

## High (block public launch)

| Item | Owner doc | Status | Notes |
|------|-----------|--------|-------|
| Connect repo to Cloudflare Pages | docs/TODO.md | Done | Adapter configured |
| Configure secrets in Cloudflare | docs/TODO.md | Done | Dashboard configuration |
| Domain + DNS + HTTPS | docs/TODO.md | Done | Domain purchased, DNS configured |
| Preview deploys per branch | docs/TODO.md | Done | GitHub branch deploys |
| Post-deploy verification | docs/TODO.md | Done | Verified on every deploy |
| /fuentes page | docs/TODO.md | Done | Data sources documented |
| /licencia page | docs/TODO.md | Done | CC BY-SA 4.0 + MIT |
| Contact / corrections channel | docs/TODO.md | Done | docs/contacto implemented |
| Public read-only API | docs/TODO.md | Done | /api/works.json, /api/authors.json |
| RSS feeds | docs/TODO.md | Done | /rss/works.xml |
| Content review (every work has link) | docs/TODO.md | Done | All 135 published works pass Zod URL validation |

## Medium (enhance user experience)

| Item | Owner doc | Status | Notes |
|------|-----------|--------|-------|
| Dark mode | docs/TODO.md | Not started | Needs Tailwind 4 class strategy |
| Full-text search (Pagefind) | docs/TODO.md | Installed, not wired | pagefind package added |
| Geographic map (Leaflet) | docs/TODO.md | Installed, not wired | leaflet + @types/leaflet added |
| Dataset export (CSV) | docs/TODO.md | Not started | csv-writer not installed |
| Accessibility review with real users | docs/TODO.md | Not started | WCAG 2.1 AA self-audit done |

## Low (nice to have)

| Item | Owner doc | Status | Notes |
|------|-----------|--------|-------|
| English version | docs/TODO.md | Not started | Requires i18n strategy |
| In-house editorial panel | docs/TODO.md | Not started | Forms may be sufficient |
| Outreach to workshops | docs/TODO.md | Not started | Real-world activity |
| Onboard first 3–5 authors | docs/TODO.md | Not started | Requires remote Supabase |
| Backup: periodic Supabase export | docs/TODO.md | Not started | Manual process |

## Technical debt

| Item | Owner doc | Status | Notes |
|------|-----------|--------|-------|
| Build-time dependency on Supabase availability | docs/TODO.md | Not started | Old deploy stays live if build fails |
| Single link provenance per work | docs/TODO.md | Not started | Future: normalized sources table |
| Database types regeneration after migration | docs/TODO.md | Not started | Manual step after schema change |
| DB tests require Docker | docs/TODO.md | Blocked | Docker not available in environment |
| Playwright / axe-core blocked | docs/TODO.md | Blocked | No browser installs (uses Falkon) |

## Documentation relationships

- docs/TODO.md — roadmap with accomplished and unaccomplished items
- docs/MISSING_ELEMENTS.md — this file, missing elements by priority
- docs/CONTRIBUTING.md — conventions, rules, workflow
- docs/ARCHITECTURE.md — software, hardware, engineering decisions
- docs/STYLES.md — visual styles, design system
- docs/AGENTS.md — AI agent instructions
- docs/README.md — developer entry point
- docs/GUIDELINES.md — end-user guide
- docs/API.md — public read-only API documentation

No duplicated blocks: if information exists in one doc, other docs link to it
instead of repeating it.