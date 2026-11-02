import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { parseCookie } from 'cookie';
import type { AstroCookies } from 'astro';
import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from 'astro:env/client';

function getSupabaseConfig() {
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be configured.',
    );
  }

  return {
    url: PUBLIC_SUPABASE_URL,
    anonKey: PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function createPublicSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
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
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(url, anonKey, {
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
