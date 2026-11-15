# Supabase Project Characteristics

> This document describes the required characteristics of the Supabase project for CubanCFCronology.

---

## Overview

The Supabase project must meet specific requirements to support the CubanCFCronology website:

1. **Free-tier plan** (to keep costs minimal)
2. **PostgreSQL 18** (for migration compatibility)
3. **Row Level Security (RLS)** enabled on all tables
4. **Public access** for read-only queries (anonymous users)
5. **Auth service** for user registration and login
6. **Webhook support** for deploy triggers

---

## Plan Requirements

### Tier: Free Plan

**Cost:** $0/month

**Limitations:**
- 500MB database storage
- 2GB bandwidth per month
- 2 concurrent connections
- 50,000 API requests per month

**Why free tier?**
- This is a small, static content site
- 143 works, 52 authors, 34 editorials (small dataset)
- No real-time features required
- No high-traffic needs

---

## Database Requirements

### Storage Estimate

| Table | Rows | Estimated Size |
|-------|------|----------------|
| `authors` | 52 | ~5 KB |
| `works` | 143 | ~15 KB |
| `author_works` | ~500 | ~10 KB |
| `editorials` | 34 | ~5 KB |
| `editorial_work` | ~200 | ~5 KB |
| `genres` | ~20 | <1 KB |
| `users` | ~10 | ~1 KB |
| `roles` | ~3 | <1 KB |

**Total:** ~41 KB (well under 500MB limit)

---

## RLS Requirements

### Public Tables (read-only for anonymous)

| Table | RLS Policy | Purpose |
|-------|------------|---------|
| `authors` | `anon` can `SELECT` where `is_published = true` | Public author profiles |
| `works` | `anon` can `SELECT` where `is_published = true` | Public work catalog |
| `works` | `anon` can `SELECT` where `type = 'chronicle'` | Chronology timeline |
| `editorials` | `anon` can `SELECT` | Editorial information |

### Authenticated Tables (read/write for owners)

| Table | RLS Policy | Purpose |
|-------|------------|---------|
| `works` | `authenticated` can `SELECT`/`UPDATE` own works | Authors manage their works |
| `works` | `authenticated` can `INSERT`/`DELETE` own works | Authors create/delete works |
| `authors` | `authenticated` can `UPDATE` own profile | Authors edit their profile |
| `author_works` | `authenticated` can `INSERT`/`DELETE` own works | Authors link/unlink works |

### Admin Tables (full access)

| Table | RLS Policy | Purpose |
|-------|------------|---------|
| `authors` | `admin` can `SELECT`/`UPDATE`/`DELETE` | Admin manages all authors |
| `works` | `admin` can `SELECT`/`UPDATE`/`DELETE`/`INSERT` | Admin manages all works |
| `author_works` | `admin` can `SELECT`/`UPDATE`/`DELETE`/`INSERT` | Admin manages all links |
| `editorials` | `admin` can `SELECT`/`UPDATE`/`DELETE`/`INSERT` | Admin manages editorials |
| `editorial_work` | `admin` can `SELECT`/`UPDATE`/`DELETE`/`INSERT` | Admin manages editorial links |

---

## Auth Requirements

### User Roles

| Role | Description | Access |
|------|-------------|--------|
| `admin` | Site administrator | Full access to all tables |
| `author` | Cuban SF/F author | Manage own works and profile |
| `authenticated` | Any logged-in user | Manage own data |

### Auth Flow

1. User registers via `/entrar`
2. Supabase Auth creates `users` row with `role = 'author'`
3. Admin links auth user to `authors` record via `/admin` page
4. User can now manage their works

---

## Webhook Requirements

### Deploy Hook Trigger

**Purpose:** Rebuild site when content changes in Supabase

**Implementation:**
- pg_net extension or webhook trigger
- POST to Cloudflare Deploy Hook URL
- Debounce 5-minute window (prevent spam)

**Tables to monitor:**
- `authors` (INSERT/UPDATE/DELETE)
- `works` (INSERT/UPDATE/DELETE)
- `author_works` (INSERT/DELETE)
- `editorials` (INSERT/UPDATE/DELETE)
- `editorial_work` (INSERT/DELETE)

---

## Database Features

### Extensions Required

| Extension | Purpose |
|-----------|---------|
| `pg_net` | Webhook triggers for deploy hooks |
| `uuid-ossp` | UUID generation (already in migration) |

### Functions Required

| Function | Purpose |
|----------|---------|
| `set_is_published()` | Trigger to set `created_by` when `is_published` changes |
| `set_owner_user_id()` | Trigger to prevent non-admins from changing `owner_user_id` |
| `update_author_works()` | Trigger to sync `author_works` when `works` changes |
| `update_editorial_works()` | Trigger to sync `editorial_work` when `editorials` changes |

---

## API Requirements

### Public API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/works` | GET | List all published works |
| `/api/works/[id]` | GET | Get single work by ID |
| `/api/authors` | GET | List all authors |
| `/api/authors/[id]` | GET | Get single author by ID |

**Rate limiting:** 100 requests per minute per IP

---

## Performance Requirements

### Query Performance

- `authors` table: <100ms for `SELECT * FROM authors WHERE is_published = true`
- `works` table: <100ms for `SELECT * FROM works WHERE is_published = true`
- `author_works` join: <200ms for full author/work list

### Cache Strategy

- Static pages (SSG): Cache for 1 hour (60 minutes)
- News page (SSR): Cache for 10 minutes
- Auth pages (SSR): No cache (must be fresh)

---

## Backup Requirements

### Backup Strategy

**Manual backup:**
- Weekly backup via Supabase Studio
- Export to SQL file
- Store in version control (`.gitignore`)

**Automated backup:**
- Supabase free tier includes automated backups (retention: 7 days)
- No additional setup needed

---

## Monitoring Requirements

### Metrics to Monitor

- Database storage usage
- API request count
- Connection count
- Query performance

### Alerts

- Storage > 80% of limit
- API request > 40,000/month
- Connection count > 1.5 concurrent

---

## Security Requirements

### Secrets

**Never commit to repo:**
- `SUPABASE_URL` (public)
- `SUPABASE_ANON_KEY` (public)
- `SUPABASE_SERVICE_ROLE_KEY` (never public)

**Store in Cloudflare:**
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `NEWS_API_KEY` (if using external news API)

### RLS Best Practices

1. **Default deny:** All tables start with `CREATE POLICY "No access" ON ... FOR ALL USING (false);`
2. **Public reads:** Add `anon` policy for SELECT on published content
3. **Owner access:** Add `authenticated` policy for SELECT/UPDATE on own rows
4. **Admin access:** Add `admin` policy for full access on all tables
5. **Triggers:** Prevent non-admins from changing sensitive columns

---

## Migration Requirements

### Migration Files

**Location:** `supabase/migrations/`

**File naming:** `YYYYMMDDHHMMSS_description.sql`

**Required migration:**
- `20261025000000_init.sql` — Initial schema with RLS, triggers, grants

### Database Types

**Generation:**
```bash
supabase gen types typescript --linked > src/lib/database.types.ts
```

**Regeneration:** After every migration

---

## Testing Requirements

### Local Testing

**Setup:**
```bash
supabase start
npm run db:seed
npm run test
```

**Tests:**
- Zod schema validation (14 tests)
- Content query filtering
- Date formatting

### Remote Testing

**Setup:**
```bash
supabase link --project-ref <ref>
supabase db push
npm run test
```

**Tests:**
- RLS policies (16 assertions)
- Public read access
- Owner write access
- Admin full access

---

## Deployment Requirements

### Build Process

1. Run `npm run build`
2. Build outputs to `dist/` (static HTML)
3. Deploy to Cloudflare Pages

### Deploy Hook

**URL format:**
```
https://api.cloudflare.com/client/v4/accounts/<account-id>/pages/webhooks/deploy/<hook-id>
```

**Trigger:** Supabase webhook on content changes

### Webhook Configuration

**Method:** POST
**Headers:**
```
Content-Type: application/json
```

**Payload (example):**
```json
{
  "table": "works",
  "action": "INSERT",
  "record": { "id": "123", "title": "New Work", "is_published": true }
}
```

---

## Integration Requirements

### Site Integration

**Supabase Client:**
- `src/lib/supabase.ts` — Per-request server client (with JWT)
- `src/lib/database.types.ts` — Generated TypeScript types

**Environment Variables:**
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Node-cron Ping

**Purpose:** Keep free-tier project from pausing

**Frequency:** Every 30 minutes

**Implementation:**
```javascript
const cron = require('node-cron');

cron.schedule('*/30 * * * *', () => {
  fetch('https://your-project.supabase.co/rest/v1/');
});
```

---

## Requirements Checklist

- [ ] Free-tier plan (500MB storage, 2GB bandwidth)
- [ ] PostgreSQL 18 compatible
- [ ] RLS enabled on all tables
- [ ] Public read access for anonymous users
- [ ] Auth service for user registration
- [ ] pg_net extension for webhooks
- [ ] UUID generation extension
- [ ] Triggers for automatic data integrity
- [ ] Admin role for full access
- [ ] Author role for managing own works
- [ ] Deploy hook webhook support
- [ ] API endpoints for public read access
- [ ] Rate limiting (100 req/min per IP)
- [ ] Automated backups (7-day retention)
- [ ] Storage monitoring (>80% alert)
- [ ] API request monitoring (>40,000/month alert)
- [ ] Connection monitoring (>1.5 concurrent alert)

---

## Troubleshooting

### Common Issues

**Issue:** Build fails if Supabase is down
**Solution:** Use fallback data in seed file

**Issue:** RLS policies not working
**Solution:** Verify JWT is being passed to Supabase client

**Issue:** Webhook not triggering
**Solution:** Check pg_net extension is enabled

**Issue:** Free-tier project paused
**Solution:** Use node-cron ping every 30 minutes

**Issue:** Database types out of sync
**Solution:** Regenerate after every migration: `supabase gen types typescript --linked > src/lib/database.types.ts`

---

## References

- [Supabase Free Plan](https://supabase.com/pricing)
- [PostgreSQL 18 Documentation](https://www.postgresql.org/docs/18/)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase pg_net Documentation](https://supabase.com/docs/guides/api/pg-net)
- [Supabase Webhooks Documentation](https://supabase.com/docs/guides/api/webhooks)
