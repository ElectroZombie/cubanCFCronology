# CubanCFCronology — SAAS Configurations

Third-party service configurations for CubanCFCronology: Supabase, Cloudflare Pages,
and any external API providers. Each section documents what the service is used for,
which environment variables it requires, and how it is configured.

## Supabase

### Purpose
Primary data source and authentication provider. All editorial content (authors,
works, editorials, genres) lives in Supabase PostgreSQL. The Astro frontend reads
it at build time and prerenders content pages as static HTML.

### Configuration
- **Project ref:** `pliebkexemhnqplfmrbd`
- **Project URL:** `https://pliebkexemhnqplfmrbd.supabase.co`
- **Database:** PostgreSQL 17 (managed by Supabase)

### Environment variables

| Variable | Scope | Purpose | Source |
|----------|-------|---------|--------|
| `PUBLIC_SUPABASE_URL` | Client (`astro:env/client`) | Supabase project URL for client initialization | `.env` (gitignored) |
| `PUBLIC_SUPABASE_KEY` | Client (`astro:env/client`) | Anonymous public key for client-side reads | `.env` (gitignored) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (`astro:env/server`) | Full database access for offline scripts only | `.env` (gitignored) |
| `SUPABASE_ACCESS_TOKEN` | CLI only | Supabase CLI authentication (login, link, db push) | `.env` (gitignored) |

### Security rules
- Service role key **never** reaches the client — only used in offline scripts (`scripts/seed.mjs`)
- All data access goes through RLS (Row Level Security)
- Anonymous users can only read `is_published = true` works
- Authors can only CRUD their own works
- Admins have full access

### CLI commands
```bash
supabase login                          # authenticate with SUPABASE_ACCESS_TOKEN
supabase link --project-ref pliebkexemhnqplfmrbd  # link to remote project
supabase db push                        # push migrations to remote
supabase gen types typescript --linked > src/lib/database.types.ts  # regenerate types
```

## Cloudflare Pages

### Purpose
Static site hosting and edge functions. The site builds with `output: 'static'` and
is deployed to Cloudflare Pages via GitHub integration.

### Configuration
- **Build command:** `npm run build`
- **Publish directory:** `dist/`
- **Adapter:** `@astrojs/cloudflare` v14.x
- **Preview deploys:** Per branch (GitHub branch deploys)
- **Custom domain:** `cubancfcronology.com` (DNS + HTTPS via Cloudflare)

### Environment variables (Cloudflare dashboard, not repo)
| Variable | Purpose |
|----------|---------|
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_KEY` | Supabase anonymous public key |
| `NEWS_API_KEY` | News API key (if a news provider is chosen) |

### Deploy hook
A Supabase webhook (pg_net trigger) calls the Cloudflare Deploy Hook on content
changes (`authors`/`works` writes), debounced with a 5-minute window. The last
good deployment stays live if a build fails.

## News API Provider

### Purpose
Fetch live news for the `/noticias` page.

### Status
Not yet chosen. Options:
- **Directorio Cubano** — free, local, no API key required (preferred)
- **NewsAPI** — requires API key, rate limits (100 req/day free tier)
- **APITube** — free, no key, limited and unverified

When a provider is chosen, its API key (if required) goes in Cloudflare secrets
as `NEWS_API_KEY`, never in the repository.

## Documentation relationships

- `docs/SAAS.md` — this file, third-party service configurations
- `docs/API.md` — public read-only API documentation
- `docs/TODO.md` — roadmap with accomplished and unaccomplished items
- `docs/ARCHITECTURE.md` — technical decisions

No duplicated blocks: if information exists in one doc, other docs link to it
instead of repeating it.