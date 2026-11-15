import type { APIRoute } from 'astro';
import { createPublicSupabaseClient } from '../../lib/supabase';
import { buildRss, worksToFeedItems, type WorkRow } from '../../lib/rss';

const SITE_URL = 'https://cubancfcronology.com';
const FEED_URL = `${SITE_URL}/rss/works.xml`;
const MAX_ITEMS = 50;

/** Columns selected for the feed; mirrors `public.works`. */
const WORK_COLUMNS = 'id, title, slug, year, type';

export const GET: APIRoute = async () => {
  try {
    const supabase = createPublicSupabaseClient();

    const { data, error } = await supabase
      .from('works')
      .select(WORK_COLUMNS)
      .eq('is_published', true)
      .order('year', { ascending: false })
      .limit(MAX_ITEMS);

    if (error) throw error;

    const xml = buildRss(
      {
        title: 'CubanCFCronology',
        description:
          'Cronología de la ciencia ficción y fantasía cubana contemporánea (1999-2025)',
        siteUrl: SITE_URL,
        feedUrl: FEED_URL,
        language: 'es-CU',
        copyright: 'CC BY-SA 4.0',
      },
      worksToFeedItems((data ?? []) as WorkRow[]),
    );

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1440',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[rss/works] feed generation failed:', message);

    // Serve a valid, empty feed rather than a broken response.
    const xml = buildRss(
      {
        title: 'CubanCFCronology',
        description: 'El canal no está disponible temporalmente.',
        siteUrl: SITE_URL,
        feedUrl: FEED_URL,
        language: 'es-CU',
      },
      [],
    );

    return new Response(xml, {
      status: 503,
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
  }
};
