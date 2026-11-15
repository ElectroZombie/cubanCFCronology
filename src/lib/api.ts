import type { createPublicSupabaseClient } from './supabase';
import {
  AuthorSchema,
  WorkSchema,
  type Author,
  type Work,
} from './zod-schemas';

type SupabaseClient = ReturnType<typeof createPublicSupabaseClient>;

/**
 * Maximum number of items a single API request may return.
 * Keeps the free-tier API budget predictable and responses fast.
 */
export const API_MAX_LIMIT = 100;

/** Default number of items returned when no `limit` is supplied. */
export const API_DEFAULT_LIMIT = 25;

/**
 * Parse a `limit` query parameter.
 * @param value Raw query parameter value.
 * @returns A safe integer between 1 and API_MAX_LIMIT.
 */
export function parseLimit(value: string | null): number {
  if (value === null) return API_DEFAULT_LIMIT;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return API_DEFAULT_LIMIT;

  return Math.min(parsed, API_MAX_LIMIT);
}

/**
 * Parse an `offset` query parameter.
 * @param value Raw query parameter value.
 * @returns A non-negative integer.
 */
export function parseOffset(value: string | null): number {
  if (value === null) return 0;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;

  return parsed;
}

/**
 * Build a standard JSON response with CORS and cache headers.
 * @param body Payload to serialise.
 * @param status HTTP status code.
 * @param cacheSeconds Cache lifetime in seconds.
 * @returns A Response ready to return from an endpoint.
 */
export function jsonResponse(
  body: unknown,
  status = 200,
  cacheSeconds = 300,
): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${cacheSeconds}`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * Build an error response following the same envelope as the data responses.
 * @param message Human-readable error message.
 * @param status HTTP status code.
 * @returns A Response ready to return from an endpoint.
 */
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: { message, status } }, status, 0);
}

/**
 * Read published works for the API, optionally filtered by year and type.
 * @param client Supabase client carrying the caller's JWT.
 * @param filters Optional filters.
 * @returns Validated works matching the filters.
 */
export async function getApiWorks(
  client: SupabaseClient,
  filters: { year?: number; type?: string; limit: number; offset: number },
): Promise<Work[]> {
  let query = client
    .from('works')
    .select('*')
    .eq('is_published', true)
    .order('year')
    .order('title')
    .range(filters.offset, filters.offset + filters.limit - 1);

  if (filters.year !== undefined) {
    query = query.eq('year', filters.year);
  }

  if (filters.type !== undefined) {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return WorkSchema.array().parse(data ?? []);
}

/**
 * Read published authors for the API.
 * @param client Supabase client carrying the caller's JWT.
 * @param limit Maximum number of authors to return.
 * @param offset Number of authors to skip.
 * @returns Validated authors.
 */
export async function getApiAuthors(
  client: SupabaseClient,
  limit: number,
  offset: number,
): Promise<Author[]> {
  const { data, error } = await client
    .from('authors')
    .select('*')
    .order('fullname')
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return AuthorSchema.array().parse(data ?? []);
}
