# Public read-only API

CubanCFCronology exposes read-only JSON endpoints over its published catalogue.
They read the same Supabase tables the site does, so row-level security applies:
unpublished works are never exposed.

- Base URL: `https://cubancfcronology.com/api`
- Format: JSON
- Auth: none (public reads only)

The site builds with `output: 'static'`, so these endpoints are **generated at
build time**, not served dynamically. A content change in Supabase triggers a
rebuild through the Cloudflare deploy hook, which refreshes the JSON files.

Every response uses this envelope:

```json
{ "data": [ ... ] }
```

When the build-time query fails, the endpoint still returns a valid document:

```json
{ "data": [], "error": { "message": "Feed unavailable at build time." } }
```

---

## `GET /api/works.json`

The full published works catalogue, ordered by year then title.

```bash
curl https://cubancfcronology.com/api/works.json
```

### Work shape

```json
{
  "id": "0f3c…",
  "slug": "el-rugir-de-los-dragones",
  "type": "novel",
  "title": "El rugir de los dragones",
  "genres": [1, 4],
  "year": 2013,
  "edition_number": 1,
  "cant_pages": 240,
  "link": "https://revistakorad.wordpress.com/…",
  "created_by": null,
  "is_published": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

**Work types:** `short_story`, `novel`, `poetry`, `play`, `essay`, `chronicle`,
`anthology`, `comic`.

---

## `GET /api/authors.json`

The full author list, ordered by full name.

```bash
curl https://cubancfcronology.com/api/authors.json
```

### Author shape

```json
{
  "id": "7a11…",
  "owner_user_id": null,
  "fullname": "Anna Kordán",
  "pseudonyme": null,
  "age": 41,
  "birthdate": "1984-03-12",
  "biography": "Autora cubana de ciencia ficción…",
  "slug": "anna-kordan",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

`owner_user_id` is the auth account linked to the author, used only for
authorisation. It is null for every author with no linked account.

---

## RSS

`GET /rss/works.xml` serves an RSS 2.0 feed of the 50 most recent published
works. It is also prerendered at build time.

---

## Notes

- **Caching:** JSON endpoints send `Cache-Control: public, max-age=3600`; the
  RSS feed uses one day.
- **No write endpoints.** Publishing is done through the site UI, which enforces
  RLS. The API is read-only by design.
- **No query filters yet.** Because the build is static, `?year=` and `?type=`
  are not supported. Filtering happens client-side on the downloaded JSON, or
  via the site's own pages. If dynamic filtering is needed later, the endpoint
  moves to SSR behind the Cloudflare adapter.
- **Not versioned.** Breaking changes will be announced on `/acerca`.

The filtering and pagination helpers live in `src/lib/api.ts` and are used by the
site's own pages; they are ready for a future SSR endpoint.