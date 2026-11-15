# CubanCFCronology

Cronología de la ciencia ficción cubana contemporánea (1999-2025).

Sitio construido con **Astro** y todo el contenido almacenado en **Supabase** (PostgreSQL), sin ORM: `@supabase/supabase-js` + tipos generados + migraciones SQL planas.

## Estructura del repo

```
supabase/migrations/20261025000000.init.sql   # esquema fuente de verdad (RLS, funciones, triggers)
supabase/seed/korad-chronology.json            # 143 obras extraídas de Revista Korad
src/                                           # frontend Astro (SSR solo en /noticias y /mi-perfil)
docs/                                          # documentación (AGENTS.md, ARCHITECTURE.md, TODO.md, CONTRIBUTING.md)
```

## Stack

- Astro 7.4.2, TypeScript strict, Tailwind 4 (`@tailwindcss/vite`)
- `@astrojs/cloudflare` 14.x (SSR + prerender), `@astrojs/sitemap`
- pnpm (package-lock / yarn.lock rechazados)
- Hosting: Cloudflare Pages (free tier)

## Desarrollo

```bash
pnpm install
pnpm dev
pnpm check
pnpm lint
pnpm format:check
pnpm build
```

Astro y las herramientas de desarrollo están declarados en `package.json`. El lockfile se
genera con `pnpm install` y debe incluirse en los cambios de dependencias.

Para cargar el conjunto inicial en una instancia Supabase local o enlazada, configura
`PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `.env` y ejecuta `pnpm db:seed`. La
clave de servicio solo se usa en ese script local y nunca en la aplicación web.

## Base de datos

Validar la migración contra PostgreSQL local (con stub de `auth`):

```bash
# crea un cluster temporal en /tmp/opencode, aplica la migración y ejecuta el suite RLS
```

Véase `docs/ARCHITECTURE.md` para el modelo de datos, RLS y los ADR.

## Licencia

Privado — proyecto personal.
