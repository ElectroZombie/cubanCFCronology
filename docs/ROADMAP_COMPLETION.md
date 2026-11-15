# 10 Items to Complete the Roadmap

> These 10 items close the remaining gaps in the CubanCFCronology project roadmap. 
> They are ordered by priority and can be implemented without the remote Supabase project.

---

## Item 1: Connect Repo to Cloudflare Pages

**Phase:** 7 — Deployment  
**Status:** Not started  
**Dependencies:** `@astrojs/cloudflare` (already installed)  

**Purpose:** Deploy the site to Cloudflare Workers Pages

**Implementation approach:**
1. Push repo to GitHub (if not already done)
2. Create new project in Cloudflare Pages dashboard
3. Connect the GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Deploy and verify site is live

**Verification:**
- `npm run build` produces 10-11 pages in `dist/`
- Site is accessible at Cloudflare Pages URL
- Custom domain can be added later

**Estimated effort:** 30 minutes

**Risk:** Low (static build output)

---

## Item 2: Configure Cloudflare Secrets

**Phase:** 7 — Deployment  
**Status:** Not started  
**Dependencies:** None  

**Purpose:** Store Supabase and news API keys securely

**Implementation approach:**
1. Go to Cloudflare Pages → Project → Settings → Variables
2. Add these secrets (NOT in repo!):
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `NEWS_API_KEY` (if news provider chosen)
3. Reference in Astro config via `process.env.PUBLIC_SUPABASE_URL`

**Verification:**
- Run `npm run dev` with secrets loaded
- Verify `src/lib/supabase.ts` connects successfully

**Estimated effort:** 15 minutes

**Risk:** Low (secrets are environment variables, not in code)

---

## Item 3: Set Up Domain + DNS + HTTPS

**Phase:** 7 — Deployment  
**Status:** Not started  
**Dependencies:** Cloudflare account  

**Purpose:** Make the site publicly accessible with custom domain

**Implementation approach:**
1. Purchase domain (e.g., `cubancfcronology.com`)
2. Add DNS records in Cloudflare:
   - `A` record → Cloudflare Pages IPs
   - Or `CNAME` → `*.pages.dev` subdomain
3. Enable HTTPS (Cloudflare auto-renewal, "Full" or "Full (strict)" SSL)
4. Set canonical `site` in `astro.config.mjs`:
   ```javascript
   site: 'https://cubancfcronology.com',
   ```
5. Update `public/robots.txt` with new sitemap URL

**Verification:**
- Site loads at `https://cubancfcronology.com`
- HTTPS lock icon shows in browser
- All internal links use HTTPS

**Estimated effort:** 1-2 hours (depends on domain availability)

**Risk:** Medium (DNS propagation can take 24-48 hours)

---

## Item 4: Configure Preview Deploys Per Branch

**Phase:** 7 — Deployment  
**Status:** Not started  
**Dependencies:** GitHub + Cloudflare Pages  

**Purpose:** Test changes before merging to main branch

**Implementation approach:**
1. Go to Cloudflare Pages → Project → Branches
2. Enable "Preview Deployments" for each branch
3. Configure branch-specific settings:
   - Main branch: Production deploy
   - Feature branches: Preview deploy with unique URL
4. Add preview URL badge to README

**Verification:**
- Push a feature branch
- Verify preview URL is generated
- Test changes on preview URL
- Merge to main, verify production deploy

**Estimated effort:** 30 minutes

**Risk:** Low

---

## Item 5: Post-Deploy Verification

**Phase:** 7 — Deployment  
**Status:** Not started  
**Dependencies:** Cloudflare Pages deployed site  

**Purpose:** Verify all routes and features work in production

**Implementation approach:**
1. After each deploy, manually test:
   - `/` loads correctly
   - `/autores` loads correctly
   - `/autores/[slug]` loads correctly
   - `/obras` loads correctly
   - `/obras/[slug]` loads correctly
   - `/cronologia` loads correctly
   - `/noticias` loads with fallback
   - `/mi-perfil` redirects when not logged in
   - `/entrar`, `/salir` forms work
   - JSON-LD structured data renders correctly

2. Automate with a simple script:
   ```bash
   #!/bin/bash
   # post-deploy-verification.sh
   set -e
   BASE="https://cubancfcronology.com"
   
   check_page() {
     local url="$1/expected-path"
     local expected_title="$2"
     echo "Checking $url..."
     # Simple curl test
     curl -s "$url" | grep -q "$expected_title" && echo "OK" || echo "FAIL"
   }
   
   check_page "$BASE" "CubanCFCronology"
   check_page "$BASE/autores" "Autores"
   ```

**Verification:**
- All critical pages render in production
- No 404 errors on main routes
- JSON-LD is valid

**Estimated effort:** 15 minutes per deploy

**Risk:** Low

---

## Item 6: Create /Fuentes Page

**Phase:** 8 — Public launch  
**Status:** Not started  
**Dependencies:** None  

**Purpose:** Document all data sources used in the project

**Implementation approach:**
1. Create `src/pages/fuentes.astro`
2. List all sources:
   - Korad magazine (issue 53, 2025)
   - Secretos del Futuro anthology (2005)
   - Tiempos Oscuros magazine (archive.org)
   - Cuban publisher catalogues
   - National ISBN registry
   - Reputable interviews/press coverage
3. Include source URLs and citation format
4. Add to main navigation
5. Add to sitemap

**Verification:**
- Page loads at `/fuentes`
- All sources listed with proper attribution
- Navigation includes "Fuentes" link

**Estimated effort:** 30 minutes

**Risk:** None

---

## Item 7: Create /Licencia Page

**Phase:** 8 — Public launch  
**Status:** Not started  
**Dependencies:** None  

**Purpose:** Document licenses for content and code

**Implementation approach:**
1. Create `src/pages/licencia.astro`
2. Document licenses:
   - CC BY-SA 4.0 for editorial content
   - MIT for code
3. Include license badges and full text
4. Add to main navigation
5. Add to footer

**Verification:**
- Page loads at `/licencia`
- Licenses clearly displayed
- Navigation includes "Licencia" link

**Estimated effort:** 30 minutes

**Risk:** None

---

## Item 8: Accessibility Review Implementation

**Phase:** 8 — Public launch  
**Status:** Not started  
**Dependencies:** None  

**Purpose:** Ensure site meets WCAG 2.1 AA accessibility standards

**Implementation approach:**
1. Audit all pages for:
   - Semantic HTML (one `<h1>` per page, proper heading hierarchy)
   - Meaningful `alt` text on images
   - Visible focus indicators
   - Color contrast (AA minimum: 4.5:1 for normal text)
   - Keyboard navigability (Tab order, Enter/Space activate)
   - ARIA labels where needed
2. Fix any issues found
3. Add accessibility statement to `/acerca` or `/licencia`

**Verification:**
- Manual testing with keyboard only (Tab, Shift+Tab, Enter, Space)
- Color contrast check with online tools
- Screen reader testing if available (NVDA, VoiceOver)

**Estimated effort:** 2-3 hours

**Risk:** Low (primarily UI/UX improvements)

---

## Item 9: Dark Mode Implementation

**Phase:** Backlog  
**Status:** Not started  
**Dependencies:** Tailwind 4 (already installed)  

**Purpose:** Allow users to switch between light and dark themes

**Implementation approach:**
1. Configure Tailwind 4 dark mode in `astro.config.mjs`:
   ```javascript
   export default {
     // ...
     cssSelector: '.dark', // or 'class'
   }
   ```
2. Create dark mode toggle component:
   ```astro
   <!-- src/components/DarkModeToggle.astro -->
   <button 
     id="dark-mode-toggle"
     aria-label="Alternar modo oscuro"
     on:click={toggleDarkMode}
   >
     {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
   </button>
   ```
3. Add theme preference to localStorage
4. Test dark mode on all pages
5. Add toggle to navigation

**Verification:**
- Light mode loads by default
- Dark mode activates when toggle clicked
- All pages render correctly in dark mode
- Prefers-color-scheme media query respected

**Estimated effort:** 1 hour

**Risk:** Low

---

## Item 10: Database Type Generation Workflow

**Phase:** Known technical debt  
**Status:** Not started  
**Dependencies:** Supabase CLI  

**Purpose:** Keep TypeScript types in sync with database schema

**Implementation approach:**
1. Add `db:types` script to `package.json`:
   ```json
   "scripts": {
     "db:types": "supabase gen types typescript --linked > src/lib/database.types.ts"
   }
   ```
2. Create `docs/TYPES.md` documenting:
   - When to regenerate types (after every migration)
   - How to regenerate: `npm run db:types`
   - Commit the generated file
   - Never hand-edit this file
3. Add type regeneration to migration checklist
4. Test the workflow:
   - Make a small schema change
   - Run `npm run db:types`
   - Verify types update correctly
   - Commit both migration and types

**Verification:**
- Types regenerate without errors
- Generated file committed to repo
- Types match database schema

**Estimated effort:** 30 minutes

**Risk:** Low

---

## Summary Table

| Item | Phase | Effort | Risk |
|------|-------|--------|------|
| 1. Connect Cloudflare Pages | 7 | 30 min | Low |
| 2. Configure Secrets | 7 | 15 min | Low |
| 3. Domain + DNS + HTTPS | 7 | 1-2 hours | Medium |
| 4. Preview Deploys | 7 | 30 min | Low |
| 5. Post-Deploy Verification | 7 | 15 min | Low |
| 6. /Fuentes Page | 8 | 30 min | None |
| 7. /Licencia Page | 8 | 30 min | None |
| 8. Accessibility Review | 8 | 2-3 hours | Low |
| 9. Dark Mode | Backlog | 1 hour | Low |
| 10. DB Type Generation | Tech debt | 30 min | Low |
| **Total** | | **~5-6 hours** | |

---

## Implementation Order (Recommended)

1. **Items 1-5:** Complete Cloudflare deployment setup (items can be done in parallel)
2. **Items 6-7:** Public launch pages (fuentes, licencia) — quick wins
3. **Item 8:** Accessibility review — important for users
4. **Item 9:** Dark mode — nice-to-have UX improvement
5. **Item 10:** Documentation — prevents future issues

---

## Next Steps

1. Start with **Item 1** (Connect Cloudflare Pages) — this is the foundation
2. Follow with **Item 2** (Configure secrets) — needed for Supabase connection
3. Then **Item 3** (Domain + DNS + HTTPS) — makes site public
4. Implement **Items 6-7** (fuentes, licencia) — content completeness
5. Do **Item 8** (accessibility) — user experience
6. Finish with **Items 9-10** (dark mode, type generation) — polish and documentation

---

## Dependencies Already Available

| Dependency | Status |
|------------|--------|
| `@astrojs/cloudflare` | ✅ Installed |
| `astro` | ✅ Installed |
| `tailwindcss` | ✅ Installed |
| `eslint` | ✅ Installed |
| `prettier` | ✅ Installed |
| `vitest` | ✅ Installed |
| `node-cron` | ✅ Installed |
| `rss` | ✅ Installed |

---

**These 10 items close the remaining roadmap gaps that don't require the remote Supabase project. Items 1-5 complete the deployment pipeline, items 6-8 complete the public launch, and items 9-10 add polish and maintainability.**