import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { parseCookie } from 'cookie';
import type { AstroCookies } from 'astro';
import { PUBLIC_SUPABASE_KEY, PUBLIC_SUPABASE_URL } from 'astro:env/client';

function getSupabaseConfig() {
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_KEY) {
    throw new Error(
      'PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_KEY must be configured.',
    );
  }

  return {
    url: PUBLIC_SUPABASE_URL,
    publishableKey: PUBLIC_SUPABASE_KEY,
  };
}

export function createPublicSupabaseClient() {
  const { url, publishableKey } = getSupabaseConfig();

  return createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export function createServerSupabaseClient(
  cookies: AstroCookies,
  request: Request,
) {
  const { url, publishableKey } = getSupabaseConfig();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return Object.entries(
          parseCookie(request.headers.get('cookie') ?? ''),
        ).flatMap(([name, value]) =>
          value === undefined ? [] : [{ name, value }],
        );
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, options);
        }
      },
    },
  });
}
