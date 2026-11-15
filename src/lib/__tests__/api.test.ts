import { describe, expect, it } from 'vitest';
import {
  API_DEFAULT_LIMIT,
  API_MAX_LIMIT,
  errorResponse,
  jsonResponse,
  parseLimit,
  parseOffset,
} from '../api';

describe('parseLimit', () => {
  it('returns the default when the parameter is absent', () => {
    expect(parseLimit(null)).toBe(API_DEFAULT_LIMIT);
  });

  it('parses a valid integer', () => {
    expect(parseLimit('50')).toBe(50);
  });

  it('clamps to the maximum', () => {
    expect(parseLimit('9999')).toBe(API_MAX_LIMIT);
  });

  it('falls back to the default for zero', () => {
    expect(parseLimit('0')).toBe(API_DEFAULT_LIMIT);
  });

  it('falls back to the default for negative values', () => {
    expect(parseLimit('-5')).toBe(API_DEFAULT_LIMIT);
  });

  it('falls back to the default for non-numeric input', () => {
    expect(parseLimit('abc')).toBe(API_DEFAULT_LIMIT);
  });
});

describe('parseOffset', () => {
  it('returns zero when the parameter is absent', () => {
    expect(parseOffset(null)).toBe(0);
  });

  it('parses a valid integer', () => {
    expect(parseOffset('25')).toBe(25);
  });

  it('falls back to zero for negative values', () => {
    expect(parseOffset('-10')).toBe(0);
  });

  it('falls back to zero for non-numeric input', () => {
    expect(parseOffset('abc')).toBe(0);
  });
});

describe('jsonResponse', () => {
  it('defaults to 200 with a one-hour cache', () => {
    const response = jsonResponse({ ok: true });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    );
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
  });

  it('honours a custom status and cache duration', () => {
    const response = jsonResponse({ ok: true }, 201, 60);

    expect(response.status).toBe(201);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
  });

  it('pretty-prints the body', async () => {
    const response = jsonResponse({ data: [1, 2] });
    const body = await response.json();

    expect(body).toEqual({ data: [1, 2] });
  });

  it('allows cross-origin reads', () => {
    const response = jsonResponse({});

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});

describe('errorResponse', () => {
  it('uses the documented error envelope', async () => {
    const response = errorResponse('Invalid year: 1800', 400);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: { message: 'Invalid year: 1800', status: 400 },
    });
  });

  it('does not cache error responses', () => {
    const response = errorResponse('boom', 502);

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=0');
  });
});
