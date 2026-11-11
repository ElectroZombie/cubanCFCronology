import type { MiddlewareHandler } from 'astro';
import { createServerSupabaseClient } from './lib/supabase';

// In-memory rate limiter store (resets on server restart).
// Key: `${ip}:${endpoint}` → { count, firstRequestAt }
const rateLimitStore = new Map<string, { count: number; firstRequestAt: number }>();

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_REQUESTS = 30; // max requests per window per IP per endpoint

function isRateLimited(ip: string, endpoint: string): boolean {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    rateLimitStore.set(key, { count: 1, firstRequestAt: now });
    return false;
  }

  // Reset window if expired
  if (now - entry.firstRequestAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, firstRequestAt: now });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  context.locals.user = null;

  const ip =
    context.request.headers.get('x-forwarded-for') ??
    context.request.headers.get('x-real-ip') ??
    'unknown';
  const url = new URL(context.request.url);
  const endpoint = url.pathname;

  // Rate limit auth endpoints
  const isAuthEndpoint =
    endpoint === '/entrar' || endpoint === '/salir' || endpoint === '/admin';

  if (isAuthEndpoint && isRateLimited(ip, endpoint)) {
    return new Response(
      JSON.stringify({
        error: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const supabase = createServerSupabaseClient(
      context.cookies,
      context.request as Request,
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    context.locals.user = user ?? null;
  } catch {
    // Supabase not configured yet; user remains null
  }

  return next();
};