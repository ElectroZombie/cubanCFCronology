import type { APIRoute } from 'astro';
import { createPublicSupabaseClient } from '../../lib/supabase';
import { getApiAuthors } from '../../lib/api';

/**
 * Static JSON feed of authors, generated at build time.
 *
 * The site is built with `output: 'static'`, so endpoints are prerendered.
 * Freshness comes from the Cloudflare deploy hook: a content change in Supabase
 * triggers a rebuild, which regenerates this file.
 */
export const GET: APIRoute = async () => {
  try {
    const client = createPublicSupabaseClient();
    const authors = await getApiAuthors(client, 10_000, 0);

    return new Response(JSON.stringify({ data: authors }, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[api/authors.json] query failed:', message);

    return new Response(
      JSON.stringify({
        data: [],
        error: { message: 'Feed unavailable at build time.' },
      }),
      { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }
};
