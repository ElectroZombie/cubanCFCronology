// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://cubancfcronology.com',
  compressHTML: 'jsx',
  env: {
    schema: {
      PUBLIC_SUPABASE_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_SUPABASE_ANON_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },
  integrations: [cloudflare(), sitemap()],
  vite: {
    plugins: [tailwind()],
  },
});
