import type { MiddlewareHandler } from 'astro';
import { createServerSupabaseClient } from './lib/supabase';

export const onRequest: MiddlewareHandler = async (context, next) => {
  context.locals.user = null;

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