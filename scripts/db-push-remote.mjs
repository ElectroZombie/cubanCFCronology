#!/usr/bin/env node
/**
 * Apply pending SQL migrations to the linked remote Supabase project.
 *
 * Why not `supabase db push`? That command connects to the database over
 * PostgreSQL (port 5432/6543), which is blocked in restricted networks. The
 * Supabase Management API exposes the same database over HTTPS, so this script
 * uses it instead. It requires a Personal Access Token in SUPABASE_ACCESS_TOKEN.
 *
 * Usage:
 *   npm run db:push:remote
 *
 * Environment (in .env):
 *   SUPABASE_ACCESS_TOKEN — Personal Access Token from the Supabase dashboard
 *   SUPABASE_PROJECT_REF  — optional, defaults to pliebkexemhnqplfmrbd
 *
 * Safety:
 *   - Reads migrations in filename order.
 *   - Skips migrations already recorded in supabase_migrations.schema_migrations.
 *   - Writes each migration inside a single transaction.
 *   - Exits non-zero on the first error; nothing partial is committed per file.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const envPath = fileURLToPath(new URL('.env', root));

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF ?? 'pliebkexemhnqplfmrbd';

assert(
  accessToken,
  'SUPABASE_ACCESS_TOKEN must be set in the environment or .env file.',
);
assert(
  /^[a-z0-9]{20}$/i.test(projectRef),
  'SUPABASE_PROJECT_REF must be a valid Supabase project reference.',
);

const migrationsDir = fileURLToPath(
  new URL('../supabase/migrations', import.meta.url),
);

assert(
  existsSync(migrationsDir),
  `Migrations directory not found: ${migrationsDir}`,
);

const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

/**
 * Run one SQL statement through the Management API.
 * @param query SQL to execute.
 * @returns Parsed rows, or an empty array for statements without a result set.
 */
async function runQuery(query) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 800)}`);
  }

  if (!text.trim()) return [];

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

/**
 * Ensure the migration bookkeeping table and the schema exist.
 * These are the same objects `supabase db push` maintains.
 */
async function ensureHistoryTable() {
  await runQuery(`
    create schema if not exists supabase_migrations;
    create table if not exists supabase_migrations.schema_migrations (
      version bigint primary key,
      statements text[],
      name text
    );
  `);
}

/**
 * Return the versions already applied to the remote database.
 * @returns Set of version strings.
 */
async function getAppliedVersions() {
  const rows = await runQuery(
    'select version from supabase_migrations.schema_migrations',
  );

  if (!Array.isArray(rows)) return new Set();

  return new Set(rows.map((row) => String(row.version)));
}

/**
 * Strip line comments and the UTF-8 BOM so a filename can be parsed.
 * @param filename Migration filename.
 * @returns Version string, or null if the filename is not a migration.
 */
function parseVersion(filename) {
  const match = /^(\d{14})_.*\.sql$/.exec(filename);

  return match ? match[1] : null;
}

/**
 * Run a migration file body inside a single transaction.
 * @param name Migration filename.
 * @param body SQL body.
 */
async function applyMigration(name, body) {
  const version = parseVersion(name);

  // Executed together so a failure rolls back every statement in the file.
  const wrapped = `
    begin;
    ${body}
    insert into supabase_migrations.schema_migrations (version, name)
    values (${version}, '${name.replace(/'/g, "''")}')
    on conflict (version) do nothing;
    commit;
  `;

  await runQuery(wrapped);
}

async function main() {
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql') && parseVersion(name) !== null)
    .sort();

  if (files.length === 0) {
    console.log('No migrations found.');
    return;
  }

  await ensureHistoryTable();
  const applied = await getAppliedVersions();

  console.log(
    `[db:push:remote] ${applied.size} migration(s) already applied; ${files.length} file(s) on disk.`,
  );

  let pushed = 0;

  for (const file of files) {
    const version = parseVersion(file);

    if (applied.has(version)) {
      console.log(`[db:push:remote] skip ${file} (already applied)`);
      continue;
    }

    console.log(`[db:push:remote] applying ${file}`);
    await applyMigration(file, readFileSync(`${migrationsDir}/${file}`, 'utf8'));
    pushed += 1;
  }

  console.log(
    `[db:push:remote] done — ${pushed} migration(s) applied, ${files.length - pushed} skipped.`,
  );
}

main().catch((error) => {
  console.error(`[db:push:remote] failed: ${error.message}`);
  process.exit(1);
});