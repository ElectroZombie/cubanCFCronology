import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = new URL('../', import.meta.url);
const envPath = fileURLToPath(new URL('.env', root));

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const seedPath = fileURLToPath(
  new URL('../supabase/seed/korad-chronology.json', import.meta.url),
);
const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

assert(
  supabaseUrl,
  'PUBLIC_SUPABASE_URL must be set in the environment or .env file.',
);
assert(
  serviceRoleKey,
  'SUPABASE_SERVICE_ROLE_KEY must be set in the environment or .env file.',
);
assert(
  seed.meta.source.startsWith('https://'),
  'The seed source must use HTTPS.',
);

const seedAuthorIds = new Set(seed.authors.map(({ id }) => id));
const seedWorkIds = new Set(seed.works.map(({ id }) => id));
const seedEditorialIds = new Set(seed.editorials.map(({ id }) => id));
const seedGenreIds = new Set(seed.genres.map(({ id }) => id));

assert(
  seed.author_works.every(
    ({ author_id, work_id }) =>
      seedAuthorIds.has(author_id) && seedWorkIds.has(work_id),
  ),
  'The seed contains an author_works row with a missing author or work.',
);
assert(
  seed.editorial_work.every(
    ({ editorial_id, work_id }) =>
      seedEditorialIds.has(editorial_id) && seedWorkIds.has(work_id),
  ),
  'The seed contains an editorial_work row with a missing publisher or work.',
);
assert(
  seed.works.every(({ genres }) =>
    genres.every((genreId) => seedGenreIds.has(genreId)),
  ),
  'The seed contains a work with an unknown genre.',
);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

async function insertMissing(table, records, conflictTarget, returningColumns) {
  if (records.length > 0) {
    const { error } = await supabase.from(table).upsert(records, {
      onConflict: conflictTarget,
      ignoreDuplicates: true,
    });

    if (error) {
      throw new Error(`Could not seed ${table}: ${error.message}`);
    }
  }

  const { data, error } = await supabase.from(table).select(returningColumns);

  if (error) {
    throw new Error(`Could not read ${table} after seeding: ${error.message}`);
  }

  return data;
}

const savedGenres = await insertMissing(
  'genres',
  seed.genres.map(({ name }) => ({ name })),
  'name',
  'id, name',
);
const genreIds = new Map(savedGenres.map(({ id, name }) => [name, id]));
const genreIdMap = new Map(
  seed.genres.map(({ id, name }) => [id, genreIds.get(name)]),
);

const savedEditorials = await insertMissing(
  'editorials',
  seed.editorials.map(({ name, country }) => ({ name, country })),
  'name',
  'id, name',
);
const editorialIds = new Map(savedEditorials.map(({ id, name }) => [name, id]));
const editorialIdMap = new Map(
  seed.editorials.map(({ id, name }) => [id, editorialIds.get(name)]),
);

for (const [seedId, databaseId] of genreIdMap) {
  assert(databaseId !== undefined, `Could not resolve seeded genre ${seedId}.`);
}

for (const [seedId, databaseId] of editorialIdMap) {
  assert(
    databaseId !== undefined,
    `Could not resolve seeded editorial ${seedId}.`,
  );
}

const authors = seed.authors.map(
  ({ id, slug, fullname, pseudonyme, age, birthdate, biography }) => ({
    id,
    slug,
    fullname,
    pseudonyme,
    age,
    birthdate,
    biography,
  }),
);

const works = seed.works.map(
  ({
    id,
    slug,
    type,
    title,
    genres: seedGenreIds,
    year,
    edition_number,
    cant_pages,
    link,
    is_published,
  }) => ({
    id,
    slug,
    type,
    title,
    genres: seedGenreIds.map((genreId) => {
      const databaseId = genreIdMap.get(genreId);
      assert(
        databaseId !== undefined,
        `Could not resolve genre ${genreId} used by ${slug}.`,
      );
      return databaseId;
    }),
    year,
    edition_number,
    cant_pages,
    link: link ?? seed.meta.source,
    is_published,
  }),
);

await insertMissing('authors', authors, 'id', 'id');
await insertMissing('works', works, 'id', 'id');

const authorWorks = seed.author_works.map(({ author_id, work_id }) => ({
  author_id,
  work_id,
}));
const editorialWorks = seed.editorial_work.map(({ work_id, editorial_id }) => {
  const databaseEditorialId = editorialIdMap.get(editorial_id);
  assert(
    databaseEditorialId !== undefined,
    `Could not resolve editorial ${editorial_id}.`,
  );

  return { work_id, editorial_id: databaseEditorialId };
});

await insertMissing(
  'author_works',
  authorWorks,
  'author_id,work_id',
  'author_id',
);
await insertMissing(
  'editorial_work',
  editorialWorks,
  'work_id,editorial_id',
  'work_id',
);

console.log(
  `Seed complete: ${authors.length} authors, ${works.length} works, ${seed.editorials.length} publishers.`,
);
