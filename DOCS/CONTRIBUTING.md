# CONTRIBUTING.md — How to contribute

Thanks for wanting to help. This project documents **Cuban science fiction and fantasy**, and
that only works if the content is rigorous and the code is easy to maintain.

There are two ways to contribute, and **both are equally valuable**:

- **With content** (authors, works, dates, sources) → you register, an admin links you to an
  author record, you draft content through forms; you publish your own works. No programming required.
- **With code** (Astro, TypeScript, CSS, accessibility, database) → you need Node.js and pnpm.

---

## 0. Before you start

- Read `DOCS/ARCHITECTURE.md` if you will touch code or the database.
- Read `DOCS/TODO.md` to avoid duplicating work in progress.
- Open an issue before starting anything large (new section, schema change, data migration).
  No surprise 800-line PRs.
- Be respectful. This is a cultural workspace: we discuss data and code, not people.
  Harassment and personal attacks are not tolerated.

## 1. Repository state

> The frontend is scaffolded (`package.json`, `astro.config.mjs`, `src/`, `README.md`),
> with `pnpm check`, ESLint and Prettier configured.
> The database migration exists at `supabase/migrations/20261025000000_init.sql` and is
> validated against PostgreSQL 18 (16 RLS assertions). The Supabase project is not created
> yet. Dependency installation and lockfile generation are currently blocked by npm registry
> resolution/network errors. Commands in §3 work once dependency installation succeeds.

## 2. Requirements

| Tool | Minimum version | Notes |
| --- | --- | --- |
| Node.js | 22 LTS | Pin with `.nvmrc` |
| pnpm | 10 | `corepack enable && corepack prepare pnpm@latest --activate` |
| Git | 2.40+ | — |
| Docker | recent | Only for the local Supabase stack |
| Supabase CLI | latest | `pnpm dlx supabase --version` |

PRs adding `package-lock.json` or `yarn.lock` will be rejected. The package manager is
**pnpm**.

## 3. Getting started

```bash
git clone https://github.com/ElectroZombie/cubanCFCronology.git
cd cubanCFCronology
pnpm install
cp .env.example .env      # ask a maintainer for the keys
pnpm dev                  # http://localhost:4321
```

Verification before opening a PR:

```bash
pnpm check    # astro check: TypeScript, references
pnpm build    # production build
pnpm lint
pnpm format:check
```

### Local database stack

```bash
pnpm dlx supabase init          # first time only; commit supabase/config.toml
pnpm dlx supabase start         # Docker: Postgres, Auth, Studio on :54323
pnpm dlx supabase db reset      # replay migrations on a clean local DB
```

The local stack prints the API URL and anon key. Put them in `.env`:

```
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
```

## 4. Database changes (code contributors)

The database is Supabase (PostgreSQL). **There is no ORM** — see ADR-009 in
`ARCHITECTURE.md`. Schema changes are plain SQL in `supabase/migrations/`; types are
generated from the live schema.

1. Never edit the database through the Studio UI — changes would be untracked and lost.
2. Create a migration:
   ```bash
   pnpm dlx supabase migration new add_my_table
   ```
3. Write plain SQL including `enable row level security` and **all policies/triggers** for
   the change.
4. Apply locally (`pnpm dlx supabase db reset`) and test policies with two users.
5. Regenerate types:
   ```bash
   pnpm dlx supabase gen types typescript --local > src/lib/database.types.ts
   ```
6. Commit migration **and** regenerated types together.

Initial data can be loaded after starting a local Supabase stack or linking a project with
`pnpm db:seed`. The script reads `PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from
`.env`; the service-role key is used only by this offline script and must never be exposed to
Astro pages or client code. Missing work links use the source chronology URL. The import is
idempotent and preserves existing rows on conflicts.

Rules:

- Every new table ships with RLS enabled **and** its policies in the same migration.
- A user must never be able to write to `roles`.
- Never commit the service role key, passwords, or `supabase/.temp/`.
- No Drizzle, Prisma, Kysely or TypeORM in the request path. Open an ADR first.
- Do not use `@astrojs/db` (removed in Astro 7).

## 5. Contributing content (no programming)

Editorial content (authors, works) lives in Supabase and is edited through the site's own
forms — there are **no Markdown/JSON content files in the repo**.

### The flow

1. **Register** at `/entrar`. You become `author` with a `users` row.
2. **An admin creates an author record** (`authors`) and links your user account to it
   (`authors.owner_user_id`).
3. **Draft content** through `/mi-perfil`: works (`works`) linked to your author record via
   `author_works`. Drafts have `is_published = false`.
4. **Publish** — you (the author/owner) can toggle `is_published` on your own works. Admins
   can publish/unpublish any work and CRUD `authors`, `genres`, `editorials`.

### Editorial rules (mandatory)

These are enforced by database constraints and Zod validation, but know them before writing:

1. **Always a source.** Every work row requires a `link` to a verifiable source.
2. **Original wording.** No copying paragraphs from magazines, prologues or websites.
   Paraphrase; quotes limited to 2–3 lines with attribution.
3. **Cuban Spanish**, educated but clear register. Third person. No sensationalism.
4. **Full names with correct accents** (Ángel Arango). Slugs have no accents:
   `angel-arango`.
5. **ISO dates:** `1966-03-12`; year only `1966` when the day is unknown. Never `12/03/1966`.
6. **Work titles in italics** in prose (`*El mundo de la ciencia ficción*`).
7. **"ciencia ficción"** lowercase; capitals only inside proper names.
8. **Do not speculate.** Mark uncertain data and flag it in `DOCS/TODO.md`.

### Accepted sources (priority order)

1. **Korad** magazine, especially issue 53 (2025): "Cronología de la ciencia ficción cubana
   1999–2026".
2. **Secretos del Futuro** anthology (2005) prologue.
3. **Tiempos Oscuros** (`archive.org`).
4. Cuban publisher catalogues, institutional sites, national ISBN registry.
5. Reputable interviews or press coverage.

## 6. Branches

| Prefix | Use | Example |
| --- | --- | --- |
| `feat/` | New functionality | `feat/timeline-filters` |
| `fix/` | Bug fix | `fix/broken-author-links` |
| `content/` | Data seeded via Supabase (scripts) | `content/seed-80s-authors` |
| `docs/` | Documentation | `docs/sources-guide` |
| `chore/` | Tooling, dependencies | `chore/astro-7-5` |

- `main` is protected: Pull Request only, never direct push.
- Keep branches short and single-purpose. Rebase on `main` before review.

## 7. Commits

**Conventional Commits**, in English:

```
<type>(<optional scope>): <imperative description, lowercase, no trailing period>
```

Allowed types: `feat`, `fix`, `content`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
`ci`, `chore`, `revert`.

Examples:

```
feat(works): add work draft form
content(seed): add Korad chronology seed rows
fix(rls): block non-admin ownership changes
docs: explain the content claim flow
```

Use the body to explain **why**, not what. Close issues with `Closes #42`.

## 8. Code conventions

- Strict TypeScript. No `any`; `unknown` + Zod for external input.
- Astro components `PascalCase`; utilities `camelCase`.
- Reusable logic in `src/lib/`, not inside page frontmatter.
- No new dependency without justification in the PR.
- No React/Vue/Svelte unless an island genuinely requires it.

### Accessibility (non-negotiable)

- Semantic HTML: `nav`, `main`, `article`, `time`, `ul/li`.
- One `<h1>` per page; no skipped heading levels.
- Keyboard reachable controls with visible focus.
- Descriptive `alt` on meaningful images; `alt=""` on decorative ones.
- Minimum AA contrast (4.5:1 normal, 3:1 large).
- The timeline must be readable as an ordered list without CSS.

### Performance

- No UI libraries in the initial bundle.
- Islands: `client:visible` or `client:idle`.
- Images via `astro:assets` `<Image />` with explicit dimensions.
- No external Google Fonts.

### Security

- Never commit `.env`, keys or tokens.
- Never expose the Supabase service role key to client code.
- Sanitise user content before rendering as HTML.
- New Supabase tables ship with RLS policies in the same PR.

## 9. Pull Requests

Title in commit format. Description includes:

- What changes and **why**.
- How to test it (routes, commands, screenshots for UI).
- Related issues.

Reviewer checklist:

- [ ] One topic per PR.
- [ ] `pnpm check` and `pnpm build` pass.
- [ ] No secrets, no generated files (`dist/`, `.astro/`, `node_modules/`).
- [ ] New work rows have a `link` to their source and original wording.
- [ ] New routes have `title`, `description` and canonical.
- [ ] New tables have RLS enabled **and** policies.
- [ ] Accessibility reviewed (keyboard + contrast).
- [ ] Architecture docs updated if a decision changed.
- [ ] Follow-ups noted in `DOCS/TODO.md`.

We aim to respond within **7 days**. No response? Mention a maintainer; no duplicate PRs.

## 10. Licensing of contributions

By contributing you agree:

- **Code** under **MIT**.
- **Editorial content** under **CC BY-SA 4.0**, with attribution to the project and cited
  sources.

No third-party material without permission. Translations/adaptations: state the original work
and licence.

## 11. Reporting problems

Open an issue with: expected vs actual behaviour, affected route/file, browser/OS for visual
bugs. For data errors, include the correct source. Security issues: **email the maintainers**,
no public issue.

## 12. Questions?

Open an issue tagged `pregunta`. No question about the genre or the stack is too basic — this
project's documentation is also built from newcomers' questions.
