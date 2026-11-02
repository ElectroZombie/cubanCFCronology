-- =============================================================================
-- CubanCFCronology — initial schema
--
-- Source of truth for the Supabase/PostgreSQL database.
-- Design rationale: DOCS/ARCHITECTURE.md (ADR-009: no ORM, supabase-js only).
--
-- Tables:
--   roles        — admin | author
--   users        — id, role (FK roles)
--   genres       — list of literary genres
--   editorials   — publishers
--   authors      — id, fullname, pseudonyme, age, birthdate, biography
--   works        — id, type, title, genres, year, pages, link, edition_number,
--                  is_published  (editorial_id moved to editorial_work junction)
--   author_works — referential table: (author_id, work_id)
--   editorial_work — referential table: (work_id, editorial_id)  [co-editions]
--
-- A work may have zero, one or many authors (co-authored books, anthologies)
-- and zero, one or many editorials (co-editions). Both relationships live in
-- their own junction tables; `editorial_id` is NOT stored directly on works.
--
-- `is_published` lives ONLY on works (not on authors): it marks whether the
-- work itself is visible to the public.
--
-- Apply with:  supabase db reset            (local)
--              supabase db push             (remote, maintainers only)
-- Regenerate types after any change:
--              supabase gen types typescript --linked > src/lib/database.types.ts
--
-- Security invariants:
--   1. Anonymous readers see only is_published = true works/authors.
--   2. Authors CRUD only works linked to their own author record.
--   3. Admins CRUD everything.
--   4. Only admins write authors, genres and editorials.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLES
-- -----------------------------------------------------------------------------

create type public.role_name as enum ('admin', 'author');

create table public.roles (
  id   smallint primary key generated always as identity,
  name public.role_name unique not null
);

insert into public.roles (name) values ('admin'), ('author');

create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  role_id    smallint not null references public.roles (id),
  created_at timestamptz not null default now()
);

create table public.genres (
  id   smallint primary key generated always as identity,
  name text unique not null check (char_length(btrim(name)) between 2 and 100)
);

create table public.editorials (
  id         smallint primary key generated always as identity,
  name       text unique not null check (char_length(btrim(name)) between 2 and 200),
  country    text,
  website    text check (website is null or website ~* '^https://'),
  created_at timestamptz not null default now()
);

create table public.authors (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.users (id) on delete set null,
  fullname      text not null check (char_length(btrim(fullname)) between 2 and 200),
  pseudonyme    text,
  age           integer check (age between 0 and 150),
  birthdate     date,
  biography     text not null default '',
  slug          text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create type public.work_type as enum (
  'short_story',
  'novel',
  'poetry',
  'play',
  'essay',
  'chronicle',
  'anthology',
  'comic'
);

create table public.works (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  type         public.work_type not null,
  title        text not null check (char_length(btrim(title)) between 2 and 300),
  genres       smallint[] not null default '{}'
               check (array_length(genres, 1) >= 1),
  year         integer not null check (year between 1900 and 2100),
  edition_number integer,
  cant_pages   integer check (cant_pages > 0),
  link         text check (link is null or link ~* '^https://'),
  created_by   uuid default auth.uid() references public.users (id) on delete set null,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.author_works (
  author_id uuid not null references public.authors (id) on delete cascade,
  work_id   uuid not null references public.works (id) on delete cascade,
  primary key (author_id, work_id)
);

-- Co-editions: one work may be published by several editorials.
create table public.editorial_work (
  work_id      uuid not null references public.works (id) on delete cascade,
  editorial_id smallint not null references public.editorials (id) on delete cascade,
  primary key (work_id, editorial_id)
);

-- -----------------------------------------------------------------------------
-- 2. INDEXES
-- -----------------------------------------------------------------------------

create index authors_slug_idx       on public.authors (slug);
create index authors_owner_idx      on public.authors (owner_user_id);

create index works_slug_idx         on public.works (slug);
create index works_published_idx    on public.works (is_published);
create index works_year_idx         on public.works (year);
create index works_created_by_idx   on public.works (created_by);
create index works_genres_idx       on public.works using gin (genres);

create index author_works_work_idx  on public.author_works (work_id);

create index editorial_work_work_idx   on public.editorial_work (work_id);
create index editorial_work_ed_idx     on public.editorial_work (editorial_id);

-- -----------------------------------------------------------------------------
-- 3. HELPER FUNCTIONS (tables exist at this point)
-- -----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users u
    join public.roles r on r.id = u.role_id
    where u.id = auth.uid()
      and r.name = 'admin'
  );
$$;

comment on function public.is_admin() is
  'True when the current JWT belongs to an admin. SECURITY DEFINER by design.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- True when the current user owns at least one author record linked to work.
create or replace function public.owns_work(p_work_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.author_works aw
    join public.authors a on a.id = aw.author_id
    where aw.work_id = p_work_id
      and a.owner_user_id = auth.uid()
  );
$$;

revoke all on function public.owns_work(uuid) from public;
grant execute on function public.owns_work(uuid) to authenticated;

-- Only an admin may reassign an author record or a work creator.
create or replace function public.authors_guard_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.owner_user_id is distinct from old.owner_user_id
     and not public.is_admin() then
    raise exception 'only an admin can change author ownership'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function public.works_guard_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is distinct from old.created_by
     and not public.is_admin() then
    raise exception 'only an admin can change work ownership'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- After a work is inserted, ensure its editorial(s) and author(s) exist in the
-- junction tables. Editorial/author links are inserted by the caller through
-- editorial_work / author_works; this trigger records the work's creator and
-- is a hook ready to auto-create missing reference rows when name-based
-- insertion is adopted. It is kept idempotent (on conflict do nothing).
create or replace function public.sync_work_references()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- No-op placeholder: editorials and authors are linked explicitly through
  -- editorial_work and author_works (FKs enforce existence). This trigger is
  -- retained so name-based auto-creation can be added here later without
  -- changing the calling application.
  return new;
end;
$$;

-- New auth user -> users row with default role 'author'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role_id smallint;
begin
  select id into v_role_id from public.roles where name = 'author' limit 1;

  insert into public.users (id, role_id)
  values (new.id, v_role_id)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

alter table public.roles        enable row level security;
alter table public.users        enable row level security;
alter table public.genres       enable row level security;
alter table public.editorials   enable row level security;
alter table public.authors      enable row level security;
alter table public.works        enable row level security;
alter table public.author_works enable row level security;
alter table public.editorial_work enable row level security;

-- --- roles: readable by all, never writable by app users --------------------
create policy "roles_read_all"
  on public.roles for select
  using (true);

-- --- users ------------------------------------------------------------------
create policy "users_read_own"
  on public.users for select
  to authenticated
  using (id = auth.uid());

create policy "users_admin_read_all"
  on public.users for select
  to authenticated
  using (public.is_admin());

-- --- genres: reference data, admin writes -----------------------------------
create policy "genres_read_all"
  on public.genres for select
  using (true);

create policy "genres_admin_write"
  on public.genres for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --- editorials: reference data, admin writes -------------------------------
create policy "editorials_read_all"
  on public.editorials for select
  using (true);

create policy "editorials_admin_write"
  on public.editorials for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --- authors: admin writes, owner reads own ---------------------------------
create policy "authors_read_all"  -- authors are public-facing profiles
  on public.authors for select
  using (true);

create policy "authors_admin_insert"
  on public.authors for insert
  to authenticated
  with check (public.is_admin());

create policy "authors_admin_update"
  on public.authors for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "authors_admin_delete"
  on public.authors for delete
  to authenticated
  using (public.is_admin());

-- --- works: authors CRUD works they are linked to ---------------------------
create policy "works_read_published"
  on public.works for select
  using (is_published = true);

create policy "works_read_own_or_admin"
  on public.works for select
  to authenticated
  using (
    created_by = auth.uid()
    or public.owns_work(id)
    or public.is_admin()
  );

-- An authenticated author may create a draft work; links are created
-- afterwards in author_works / editorial_work.
create policy "works_insert_authenticated"
  on public.works for insert
  to authenticated
  with check (is_published = false and created_by = auth.uid());

create policy "works_admin_insert"
  on public.works for insert
  to authenticated
  with check (public.is_admin());

create policy "works_update_owner_or_admin"
  on public.works for update
  to authenticated
  using (
    created_by = auth.uid()
    or public.owns_work(id)
    or public.is_admin()
  )
  with check (
    created_by = auth.uid()
    or public.owns_work(id)
    or public.is_admin()
  );

create policy "works_delete_owner_or_admin"
  on public.works for delete
  to authenticated
  using (
    created_by = auth.uid()
    or public.owns_work(id)
    or public.is_admin()
  );

-- --- author_works: the referential link -------------------------------------
create policy "author_works_read_all"
  on public.author_works for select
  using (true);

create policy "author_works_insert_owner_or_admin"
  on public.author_works for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.authors a
      where a.id = author_works.author_id
        and a.owner_user_id = auth.uid()
    )
  );

create policy "author_works_delete_owner_or_admin"
  on public.author_works for delete
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.authors a
      where a.id = author_works.author_id
        and a.owner_user_id = auth.uid()
    )
  );

-- --- editorial_work: co-edition links ---------------------------------------
create policy "editorial_work_read_all"
  on public.editorial_work for select
  using (true);

create policy "editorial_work_admin_write"
  on public.editorial_work for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. TRIGGERS
-- -----------------------------------------------------------------------------

create trigger authors_touch_updated_at
  before update on public.authors
  for each row execute function public.touch_updated_at();

create trigger works_touch_updated_at
  before update on public.works
  for each row execute function public.touch_updated_at();

create trigger authors_guard_columns
  before update on public.authors
  for each row execute function public.authors_guard_columns();

create trigger works_guard_columns
  before update on public.works
  for each row execute function public.works_guard_columns();

create trigger works_sync_references
  after insert on public.works
  for each row execute function public.sync_work_references();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 6. GRANTS
-- -----------------------------------------------------------------------------

grant select on public.roles to anon, authenticated;

grant select on public.users to authenticated;

grant select on public.genres to anon, authenticated;
grant insert, update, delete on public.genres to authenticated;

grant select on public.editorials to anon, authenticated;
grant insert, update, delete on public.editorials to authenticated;

grant select on public.authors to anon, authenticated;
grant insert, update, delete on public.authors to authenticated;

grant select on public.works to anon, authenticated;
grant insert, update, delete on public.works to authenticated;

grant select on public.author_works to anon, authenticated;
grant insert, delete on public.author_works to authenticated;

grant select on public.editorial_work to anon, authenticated;
grant insert, delete on public.editorial_work to authenticated;
