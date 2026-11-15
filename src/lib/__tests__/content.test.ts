import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPublishedChronicles, throwOnQueryError } from '../content';
import type { Work } from '../zod-schemas';

interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

/**
 * Minimal stand-in for a Supabase query builder.
 * Every method returns the chain so calls can be composed; awaiting the chain
 * resolves to the configured result.
 */
function createMockClient<T>(queryResult: QueryResult<T>) {
  const chain: Record<string, unknown> = {
    from: vi.fn(() => chain),
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    in: vi.fn(() => chain),
    maybeSingle: vi.fn(() => Promise.resolve(queryResult)),
    then: (resolve: (value: QueryResult<T>) => unknown) =>
      Promise.resolve(queryResult).then(resolve),
  };

  return chain;
}

describe('throwOnQueryError', () => {
  it('does not throw when error is null', () => {
    expect(() => throwOnQueryError(null)).not.toThrow();
  });

  it('throws when error has a message', () => {
    expect(() => throwOnQueryError({ message: 'query failed' })).toThrow(
      'Supabase content query failed: query failed',
    );
  });
});

describe('getPublishedChronicles', () => {
  const mockWorks: Work[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      slug: 'cronica-1999',
      type: 'chronicle',
      title: 'Crónica 1999',
      genres: [1],
      year: 1999,
      edition_number: null,
      cant_pages: null,
      link: 'https://example.com/cronica-1999',
      created_by: null,
      is_published: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      slug: 'novela-2000',
      type: 'novel',
      title: 'Novela 2000',
      genres: [1],
      year: 2000,
      edition_number: null,
      cant_pages: null,
      link: 'https://example.com/novela-2000',
      created_by: null,
      is_published: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      slug: 'cronica-2005',
      type: 'chronicle',
      title: 'Crónica 2005',
      genres: [1, 2],
      year: 2005,
      edition_number: null,
      cant_pages: null,
      link: 'https://example.com/cronica-2005',
      created_by: null,
      is_published: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters works to only chronicles', async () => {
    const client = createMockClient({ data: mockWorks, error: null });
    const chronicles = await getPublishedChronicles(
      client as unknown as Parameters<typeof getPublishedChronicles>[0],
    );
    expect(chronicles).toHaveLength(2);
    expect(chronicles.map((work) => work.title)).toEqual([
      'Crónica 1999',
      'Crónica 2005',
    ]);
  });

  it('returns empty array when no chronicles', async () => {
    const nonChronicles = mockWorks.filter((work) => work.type !== 'chronicle');
    const client = createMockClient({ data: nonChronicles, error: null });
    const result = await getPublishedChronicles(
      client as unknown as Parameters<typeof getPublishedChronicles>[0],
    );
    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty input', async () => {
    const client = createMockClient({ data: [], error: null });
    const result = await getPublishedChronicles(
      client as unknown as Parameters<typeof getPublishedChronicles>[0],
    );
    expect(result).toHaveLength(0);
  });
});
