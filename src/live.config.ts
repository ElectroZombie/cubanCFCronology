/**
 * Live configuration for CubanCFCronology.
 *
 * TODO: Configure live/deferred regeneration based on content changes.
 * Currently a stub — Supabase webhook deployment will be set up
 * when a remote Supabase project is available.
 */

// Deploy hook configuration (will be set via Cloudflare Dashboard)
export const DEPLOY_HOOK_URL = import.meta.env.DEPLOY_HOOK_URL || '';

// Supabase webhook configuration (set via supabase remote project)
// When a remote project is linked, configure pg_net webhook triggers:
// CREATE TRIGGER on authors/works tables to POST to DEPLOY_HOOK_URL
export const SUPABASE_WEBHOOK_CONFIG = {
  // enabled: false, // until remote project is linked
  // projectRef: '', // remote Supabase project reference
  // hookName: 'content_update', // name for the webhook
  // event: 'INSERT/UPDATE', // which events trigger a rebuild
  // debounceMinutes: 5, // debounce window to avoid rebuild storms,
};

// Local development: supabase start does not support webhooks.
// Use `npm run db:reset` to manually trigger a rebuild after content changes.
