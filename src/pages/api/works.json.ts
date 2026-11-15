import type { APIRoute } from 'astro';
import { createPublicSupabaseClient } from '../../lib/supabase';
import { getApiWorks } from '../../lib/api';

/**
 * Static JSON feed of published works, generated at build time.
 *
 * The site is built with `output: 'static'`, so endpoints are prerendered.
 * Freshness comes from the Cloudflare deploy hook: a content change in Supabase
 * triggers a rebuild, which regenerates this file.
 *
 * Query parameters are not available in static mode. Callers get the full
 * published catalogue; the `limit` in `meta` reflects what was emitted.
 */
export const GET: APIRoute = async () => {
  try {
    const client = createPublicSupabaseClient();
    const works = await getApiWorks(client, {
      limit: 10_000,
      offset: 0,
    });

    return new Response(JSON.stringify({ data: works }, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[api/works.json] query failed:', message);

    return new Response(
      JSON.stringify({
        data: [],
        error: { message: 'Feed unavailable at build time.' },
      }),
      { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
  }
};
