#!/usr/bin/env node
/**
 * Keep-alive ping for the free-tier Supabase project.
 *
 * The free tier pauses inactive projects after 7 days without traffic. A
 * periodic read against the REST API counts as activity and keeps the project
 * awake. This script is intentionally read-only: it never writes data and it
 * never uses the service role key.
 *
 * Usage:
 *   npm run ping:supabase          # run once and exit
 *   npm run ping:supabase -- --watch  # stay alive and ping every 30 minutes
 *
 * Configuration (in .env):
 *   PUBLIC_SUPABASE_URL   — required
 *   PING_INTERVAL_MINUTES — optional, defaults to 30
 */

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import cron from 'node-cron';

const root = new URL('../', import.meta.url);
const envPath = fileURLToPath(new URL('.env', root));

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
const supabaseKey = process.env.PUBLIC_SUPABASE_KEY;
const intervalMinutes = Number(process.env.PING_INTERVAL_MINUTES ?? '30');

assert(
  supabaseUrl,
  'PUBLIC_SUPABASE_URL must be set in the environment or .env file.',
);
assert(
  supabaseKey,
  'PUBLIC_SUPABASE_KEY must be set in the environment or .env file.',
);
assert(
  Number.isFinite(intervalMinutes) && intervalMinutes > 0,
  'PING_INTERVAL_MINUTES must be a positive number.',
);

/**
 * Ping the Auth health endpoint with the public (publishable) key.
 * A 200 response means the project is awake and reachable.
 *
 * The publishable key is used, not the service role key: the ping only needs
 * to count as request activity, and read-only public access is enough.
 * `/auth/v1/health` is chosen because it works with publishable keys, while
 * the REST root requires a secret key.
 *
 * @returns {Promise<{ ok: boolean, status: number, ms: number }>}
 */
export async function pingSupabase() {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    return {
      ok: response.ok,
      status: response.status,
      ms: Date.now() - startedAt,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[ping] request failed: ${reason}`);
    return {
      ok: false,
      status: 0,
      ms: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

const watch = process.argv.includes('--watch');

if (!watch) {
  const result = await pingSupabase();
  console.log(
    `[ping] status=${result.status} ok=${result.ok} duration=${result.ms}ms`,
  );
  process.exit(result.ok ? 0 : 1);
}

console.log(
  `[ping] watching — pinging ${supabaseUrl} every ${intervalMinutes} minutes. Ctrl+C to stop.`,
);

cron.schedule(
  `*/${intervalMinutes} * * * *`,
  async () => {
    const result = await pingSupabase();
    console.log(
      `[ping] status=${result.status} ok=${result.ok} duration=${result.ms}ms`,
    );
  },
  { timezone: 'UTC' },
);
