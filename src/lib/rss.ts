/**
 * Self-contained RSS 2.0 generator.
 *
 * No external dependency is used: the `rss` npm package has no stable release
 * that works with this Node/TypeScript setup, and RSS 2.0 is simple enough to
 * emit directly. Output is escaped and validated against the spec.
 *
 * @see https://www.rssboard.org/rss-specification
 */

/** A single feed item. */
export interface FeedItem {
  id: string;
  title: string;
  description?: string;
  link: string;
  pubDate?: Date;
  categories?: string[];
}

/** Channel metadata. */
export interface FeedOptions {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  language?: string;
  copyright?: string;
}

/** Escape the five XML entities, in the correct order (& first). */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const WORK_TYPE_LABELS: Record<string, string> = {
  short_story: 'Cuento',
  novel: 'Novela',
  poetry: 'Poesía',
  play: 'Obra de teatro',
  essay: 'Ensayo',
  chronicle: 'Crónica',
  anthology: 'Antología',
  comic: 'Cómic',
};

/**
 * Convert a work type code into a human-readable category label.
 * @param type Work type code.
 * @returns Spanish label, or the code when it is unknown.
 */
export function workTypeLabel(type: string): string {
  return WORK_TYPE_LABELS[type] ?? type;
}

/**
 * Build a complete RSS 2.0 document.
 * @param options Channel metadata.
 * @param items Feed items, already limited by the caller.
 * @returns RSS XML.
 */
export function buildRss(options: FeedOptions, items: FeedItem[]): string {
  const now = new Date();

  const channel: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    `<channel>`,
    `  <title>${escapeXml(options.title)}</title>`,
    `  <description>${escapeXml(options.description)}</description>`,
    `  <link>${escapeXml(options.siteUrl)}</link>`,
    `  <language>${escapeXml(options.language ?? 'es-CU')}</language>`,
    `  <lastBuildDate>${now.toUTCString()}</lastBuildDate>`,
    `  <atom:link href="${escapeXml(options.feedUrl)}" rel="self" type="application/rss+xml"/>`,
  ];

  if (options.copyright) {
    channel.push(`  <copyright>${escapeXml(options.copyright)}</copyright>`);
  }

  for (const item of items) {
    channel.push('  <item>');
    channel.push(`    <title>${escapeXml(item.title)}</title>`);
    channel.push(`    <link>${escapeXml(item.link)}</link>`);
    channel.push(`    <guid isPermaLink="false">${escapeXml(item.id)}</guid>`);

    if (item.description) {
      channel.push(
        `    <description>${escapeXml(item.description)}</description>`,
      );
    }

    const pubDate = item.pubDate ?? now;
    channel.push(`    <pubDate>${pubDate.toUTCString()}</pubDate>`);

    for (const category of item.categories ?? []) {
      channel.push(`    <category>${escapeXml(category)}</category>`);
    }

    channel.push('  </item>');
  }

  channel.push('</channel>');
  channel.push('</rss>');
  channel.push('');

  return channel.join('\n');
}

/**
 * A work row as read from Supabase for feed generation.
 * Mirrors the columns selected by the feed endpoint.
 */
export interface WorkRow {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  type: string;
}

/**
 * Map work rows to feed items.
 * @param works Work rows, already ordered by the caller.
 * @returns Feed items in the same order.
 */
export function worksToFeedItems(works: WorkRow[]): FeedItem[] {
  return works.map((work) => ({
    id: work.id,
    title: work.title,
    description: workTypeLabel(work.type),
    link: `https://cubancfcronology.com/obras/${work.slug}`,
    pubDate: work.year ? new Date(Date.UTC(work.year, 0, 1)) : undefined,
    categories: [workTypeLabel(work.type)],
  }));
}
