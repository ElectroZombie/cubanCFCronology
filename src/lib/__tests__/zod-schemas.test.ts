import { describe, it, expect } from 'vitest';
import { AuthorSchema, WorkSchema, EditorialSchema } from '../zod-schemas';

describe('AuthorSchema', () => {
  it('validates a complete author record', () => {
    const author = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      owner_user_id: null,
      fullname: 'Ángel Arango',
      pseudonyme: 'Ángel',
      age: 75,
      birthdate: '1951-03-15',
      biography: 'Escritor cubano de ciencia ficción.',
      slug: 'angel-arango',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    const result = AuthorSchema.safeParse(author);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullname).toBe('Ángel Arango');
      expect(result.data.slug).toBe('angel-arango');
    }
  });

  it('rejects invalid slug format', () => {
    const author = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      owner_user_id: null,
      fullname: 'Test Author',
      pseudonyme: null,
      age: null,
      birthdate: null,
      biography: 'Test bio.',
      slug: 'Invalid Slug',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    const result = AuthorSchema.safeParse(author);
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = AuthorSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('WorkSchema', () => {
  it('validates a complete work record', () => {
    const work = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      slug: 'holocausto-2084',
      type: 'novel',
      title: 'Holocausto 2084',
      genres: [1, 2],
      year: 1999,
      edition_number: 1,
      cant_pages: 215,
      link: 'https://revistakorad.wordpress.com/',
      created_by: null,
      is_published: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    const result = WorkSchema.safeParse(work);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('novel');
      expect(result.data.is_published).toBe(true);
    }
  });

  it('validates a comic work', () => {
    const work = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      slug: 'la-historia-de-zoe',
      type: 'comic',
      title: 'La historia de Zoe',
      genres: [1],
      year: 2016,
      edition_number: null,
      cant_pages: null,
      link: 'https://example.com/comic',
      created_by: null,
      is_published: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    const result = WorkSchema.safeParse(work);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('comic');
      expect(result.data.edition_number).toBeNull();
    }
  });

  it('rejects invalid type', () => {
    const work = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      slug: 'test-work',
      type: 'invalid_type',
      title: 'Test',
      genres: [1],
      year: 2000,
      edition_number: null,
      cant_pages: null,
      link: 'https://example.com/',
      created_by: null,
      is_published: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    const result = WorkSchema.safeParse(work);
    expect(result.success).toBe(false);
  });

  it('rejects link without https', () => {
    const work = {
      id: '550e8400-e29b-41d4-a716-446655440004',
      slug: 'test-work',
      type: 'novel',
      title: 'Test',
      genres: [1],
      year: 2000,
      edition_number: null,
      cant_pages: null,
      link: 'http://example.com/',
      created_by: null,
      is_published: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    const result = WorkSchema.safeParse(work);
    expect(result.success).toBe(false);
  });
});

describe('EditorialSchema', () => {
  it('validates a complete editorial record', () => {
    const editorial = {
      id: 1,
      name: 'Editorial Gente Nueva',
      country: 'Cuba',
      website: 'https://www.gentenueva.cu',
      created_at: '2026-01-01T00:00:00Z',
    };

    const result = EditorialSchema.safeParse(editorial);
    expect(result.success).toBe(true);
  });

  it('rejects invalid website URL', () => {
    const editorial = {
      id: 2,
      name: 'Test Editorial',
      country: 'Cuba',
      website: 'ftp://example.com',
      created_at: '2026-01-01T00:00:00Z',
    };

    const result = EditorialSchema.safeParse(editorial);
    expect(result.success).toBe(false);
  });
});
