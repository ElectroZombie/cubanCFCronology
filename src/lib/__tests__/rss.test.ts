import { describe, expect, it } from 'vitest';
import {
  buildRss,
  escapeXml,
  workTypeLabel,
  worksToFeedItems,
  type FeedItem,
  type WorkRow,
} from '../rss';

describe('escapeXml', () => {
  it('escapes the five XML entities', () => {
    expect(escapeXml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&apos;');
  });

  it('escapes ampersand before other entities', () => {
    expect(escapeXml('a & b < c')).toBe('a &amp; b &lt; c');
  });

  it('leaves plain text untouched', () => {
    expect(escapeXml('La escuadra negra')).toBe('La escuadra negra');
  });

  it('keeps Spanish accents and punctuation', () => {
    expect(escapeXml('«Espacio Abierto» — 2020')).toBe(
      '«Espacio Abierto» — 2020',
    );
  });
});

describe('workTypeLabel', () => {
  it('maps known work types to Spanish labels', () => {
    expect(workTypeLabel('novel')).toBe('Novela');
    expect(workTypeLabel('chronicle')).toBe('Crónica');
    expect(workTypeLabel('short_story')).toBe('Cuento');
  });

  it('falls back to the raw code for unknown types', () => {
    expect(workTypeLabel('unknown_type')).toBe('unknown_type');
  });
});

describe('worksToFeedItems', () => {
  const work: WorkRow = {
    id: '550e8400-e29b-41d4-a716-446655440010',
    title: 'La escuadra negra',
    slug: 'la-escuadra-negra-2025',
    year: 2025,
    type: 'novel',
  };

  it('builds an absolute canonical link from the slug', () => {
    const [item] = worksToFeedItems([work]);

    expect(item.link).toBe(
      'https://cubancfcronology.com/obras/la-escuadra-negra-2025',
    );
  });

  it('uses the id as the guid', () => {
    const [item] = worksToFeedItems([work]);

    expect(item.id).toBe(work.id);
  });

  it('converts the year into a pubDate at UTC', () => {
    const [item] = worksToFeedItems([work]);

    expect(item.pubDate?.toISOString()).toBe('2025-01-01T00:00:00.000Z');
  });

  it('omits pubDate when the year is null', () => {
    const [item] = worksToFeedItems([{ ...work, year: null }]);

    expect(item.pubDate).toBeUndefined();
  });

  it('labels the category from the work type', () => {
    const [item] = worksToFeedItems([work]);

    expect(item.categories).toEqual(['Novela']);
  });

  it('preserves the input order', () => {
    const items = worksToFeedItems([
      work,
      { ...work, id: 'b', slug: 'segunda', title: 'Segunda', year: 2010 },
    ]);

    expect(items.map((item) => item.title)).toEqual([
      'La escuadra negra',
      'Segunda',
    ]);
  });
});

describe('buildRss', () => {
  const options = {
    title: 'CubanCFCronology',
    description: 'Cronología de la ciencia ficción cubana',
    siteUrl: 'https://cubancfcronology.com',
    feedUrl: 'https://cubancfcronology.com/rss/works.xml',
    language: 'es-CU',
    copyright: 'CC BY-SA 4.0',
  };

  const item: FeedItem = {
    id: '550e8400-e29b-41d4-a716-446655440010',
    title: 'La escuadra negra',
    link: 'https://cubancfcronology.com/obras/la-escuadra-negra-2025',
    pubDate: new Date('2025-01-01T00:00:00Z'),
    categories: ['Novela'],
  };

  it('declares the RSS 2.0 version', () => {
    const xml = buildRss(options, [item]);

    expect(xml).toContain('<rss version="2.0"');
  });

  it('includes the channel metadata', () => {
    const xml = buildRss(options, [item]);

    expect(xml).toContain(`<title>${options.title}</title>`);
    expect(xml).toContain(`<language>es-CU</language>`);
    expect(xml).toContain(`<copyright>CC BY-SA 4.0</copyright>`);
    expect(xml).toContain(
      `<atom:link href="${options.feedUrl}" rel="self" type="application/rss+xml"/>`,
    );
  });

  it('emits one item per input', () => {
    const xml = buildRss(options, [item, { ...item, id: 'b' }]);

    expect(xml.match(/<item>/g)).toHaveLength(2);
  });

  it('escapes item text', () => {
    const xml = buildRss(options, [
      { ...item, title: 'Ruido & <ruido>', description: `a "b" 'c'` },
    ]);

    expect(xml).toContain('<title>Ruido &amp; &lt;ruido&gt;</title>');
    expect(xml).toContain(
      '<description>a &quot;b&quot; &apos;c&apos;</description>',
    );
  });

  it('escapes channel text', () => {
    const xml = buildRss({ ...options, title: 'A & B' }, []);

    expect(xml).toContain('<title>A &amp; B</title>');
  });

  it('omits the copyright element when not provided', () => {
    const xml = buildRss({ ...options, copyright: undefined }, []);

    expect(xml).not.toContain('<copyright>');
  });

  it('emits an empty but valid channel for no items', () => {
    const xml = buildRss(options, []);

    expect(xml).toContain('<channel>');
    expect(xml).toContain('</channel>');
    expect(xml).not.toContain('<item>');
  });

  it('always includes a lastBuildDate', () => {
    const xml = buildRss(options, []);

    expect(xml).toMatch(/<lastBuildDate>.+<\/lastBuildDate>/);
  });
});
