/**
 * Live configuration for CubanCFCronology.
 *
 * Deploy hook configuration for automatic rebuilds on content change.
 * When authors/works rows change, Supabase pg_net trigger POSTs to this URL,
 * triggering a Cloudflare Pages rebuild (debounced).
 *
 * Deploy hook URL is set via Cloudflare Dashboard → Project → Deployments → Deploy Hooks
 * and stored in DEPLOY_HOOK_URL environment variable.
 *
 * Supabase webhook trigger is defined in:
 *   supabase/migrations/20261115000000_deploy_hook.sql
 *
 * Local development: supabase start does not support webhooks.
 * Use `npm run db:reset` to manually trigger a rebuild after content changes.
 */

// Deploy hook URL from environment (set in Cloudflare dashboard or .env)
export const DEPLOY_HOOK_URL = import.meta.env.DEPLOY_HOOK_URL || '';

// Supabase webhook configuration reference
// Configured via supabase/migrations/20261115000000_deploy_hook.sql
// When remote project is linked, pg_net triggers POST to DEPLOY_HOOK_URL on
// authors/works INSERT/UPDATE/DELETE with 5-minute debounce via pg_net.
export const SUPABASE_WEBHOOK_CONFIG = {
  hookUrl: DEPLOY_HOOK_URL,
  events: ['INSERT', 'UPDATE', 'DELETE'],
  tables: ['authors', 'works'],
  debounceMinutes: 5,
};
