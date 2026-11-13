# Dependencies Explained

> This document explains why certain dependencies are blocked or needed, and what they do.

---

## 1. Playwright + Falkon Browser

### Why Playwright doesn't work with Falkon

**Playwright** is a testing library that requires browser binaries to be installed:

- **Chromium** (Playwright's default browser)
- **Firefox**
- **WebKit** (Safari)

**Falkon** is a Qt-based web browser (based on QtWebEngine, which itself is based on Chromium). While Falkon uses the same rendering engine as Chromium, Playwright **cannot control Falkon directly** because:

1. **Different control interface:** Playwright uses Puppeteer/Chromium's DevTools Protocol, which Falkon doesn't expose
2. **No official Falkon support:** Playwright doesn't have built-in support for Falkon
3. **Browser binaries required:** Playwright needs to install browser executables, which you don't want to do

### Alternatives for testing with Falkon

If you want to test with Falkon, you have these options:

| Option | Description | Effort |
|--------|-------------|--------|
| **Manual testing** | Open Falkon, navigate to pages, verify functionality | Low |
| **Browser automation with Selenium** | Use Selenium + Falkon's WebDriver (if available) | Medium |
| **Browser automation with QtTest** | Use Qt's built-in testing framework with Falkon | Medium |
| **Headless browser with QtWebEngine** | Use QtWebEngine's built-in headless mode | Low |

**Recommendation:** For this project, manual testing in Falkon is sufficient. E2E tests are not critical for a content-focused site.

---

## 2. Leaflet — Geographic Map

### What is Leaflet?

**Leaflet** is an open-source JavaScript library for interactive maps. It's free, lightweight, and works in all modern browsers.

### Purpose in CubanCFCronology

Leaflet would add a **geographic visualization** of the Cuban science fiction and fantasy genre:

#### Use Cases

1. **Author locations:** Show where authors are from (cities, provinces in Cuba)
2. **Event locations:** Mark where chronology events occurred (conferences, awards ceremonies)
3. **Cultural map:** Visualize the geographic distribution of Cuban SF/F

#### Example Features

```javascript
// Example: Map showing author locations
const map = L.map('map').setView([21.5218, -77.7812], 6); // Cuba center

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add author markers
authors.forEach(author => {
  if (author.latitude && author.longitude) {
    L.marker([author.latitude, author.longitude])
      .bindPopup(`<b>${author.fullname}</b><br>${author.city}`)
      .addTo(map);
  }
});
```

### Why include it?

- **Visual appeal:** Makes the site more engaging
- **Educational:** Shows geographic spread of Cuban SF/F
- **Interactive:** Users can zoom, pan, and explore
- **Free:** Uses OpenStreetMap tiles (no API key needed)

### Alternatives to Leaflet

| Library | Pros | Cons |
|---------|------|------|
| **Leaflet** | Simple, free, no API key needed | No built-in maps (uses tiles) |
| **Google Maps** | Rich features, easy to use | Requires API key, billing setup |
| **Mapbox** | Beautiful maps, easy API | Requires API key, paid tiers |
| **MapLibre GL** | Open-source fork of Mapbox | Similar to Mapbox (API key) |

**Recommendation:** Leaflet + OpenStreetMap is the best choice for this project because:
- Free (no API key required)
- No billing setup
- Simple to implement
- Good enough for a geographic map

---

## 3. Other Dependencies Explained

### csv-writer
**Purpose:** Generate CSV files from data

**Use case:** Allow users to download the complete dataset (143 works, 52 authors, 34 editorials) as a CSV file.

**Example:**
```javascript
const { createObjectCsvWriter } = require('csv-writer');
const csvWriter = createObjectCsvWriter({
  path: 'works.csv',
  header: [
    { id: 'title', title: 'Title' },
    { id: 'author', title: 'Author' },
    { id: 'year', title: 'Year' }
  ]
});
await csvWriter.writeRecords(works);
```

### pagefind
**Purpose:** Full-text search for the website

**Use case:** Enable users to search works by title, author, year, or content.

**How it works:**
1. Pagefind indexes your HTML content
2. Users search via a search bar
3. Pagefind returns matching results instantly

**Example:**
```javascript
// After building, run: pagefind --source dist
// Add search UI component with input field
// Pagefind handles the search automatically
```

### rss
**Purpose:** Generate RSS feeds

**Use case:** Allow users to subscribe to new works and news.

**Example:**
```javascript
const { RSS } = require('rss');
const feed = new RSS({
  title: 'CubanCFCronology',
  description: 'Cuban science fiction and fantasy chronology'
});
feed.item({
  title: 'New work added',
  date: new Date()
});
console.log(feed.xml({ indent: true }));
```

### node-cron
**Purpose:** Schedule recurring tasks (cron jobs in Node.js)

**Use case:** Keep Supabase free-tier project from pausing by pinging it every 30 minutes.

**Example:**
```javascript
const cron = require('node-cron');

// Run every 30 minutes
cron.schedule('*/30 * * * *', () => {
  // Ping Supabase API
  fetch('https://your-project.supabase.co/api/ping');
});
```

### @types/leaflet
**Purpose:** TypeScript type definitions for Leaflet

**Use case:** Provide IntelliSense and type checking when using Leaflet in TypeScript.

**Example:**
```typescript
import L from 'leaflet';

const map: L.Map = L.map('map'); // TypeScript knows this is a Map
const marker: L.Marker = L.marker([lat, lng]); // TypeScript knows this is a Marker
```

---

## 4. Why Not pg-dump?

**pg-dump** is a PostgreSQL database backup utility. It's typically used to:

- Create SQL dumps of database schemas and data
- Backup databases before migrations
- Export data for analysis

**Why not include it:**

1. **Manual backup is sufficient:** You can manually export from Supabase Studio
2. **GitHub Releases can store backups:** You can automate backups and store them in GitHub
3. **Requires additional setup:** More complex than needed for this project
4. **Supabase has built-in backups:** Free-tier Supabase includes automated backups

**Alternative:** Use Supabase Studio → Database → Backups to manually download backups.

---

## 5. Why Not @playwright/test + @axe-core/playwright?

### @playwright/test
**Purpose:** E2E testing (end-to-end) of web applications

**Why not include it:**

1. **Falkon incompatibility:** Playwright cannot control Falkon directly
2. **Browser binaries required:** Playwright needs to install Chromium/Firefox/WebKit
3. **Overkill for this project:** Manual testing in Falkon is sufficient for a content site
4. **Maintenance overhead:** E2E tests require frequent updates as the site changes

**When to use E2E tests:**
- Complex user flows (multi-step forms, payments)
- Browser-specific bugs
- Critical user journeys

**For this project:** Not critical. Manual testing in Falkon is adequate.

### @axe-core/playwright
**Purpose:** Automated accessibility testing

**Why not include it:**

1. **Requires Playwright:** Cannot run without Playwright
2. **Manual testing is better:** Real users with disabilities provide better feedback than automated tools
3. **False positives:** Automated tools sometimes report false accessibility violations

**When to use automated accessibility testing:**
- Large projects with many pages
- Teams with limited accessibility expertise
- CI/CD pipelines

**For this project:** Manual accessibility review with real users (Phase 8, item 25) is more valuable.

---

## 6. Summary

| Dependency | Purpose | Included? | Reason |
|------------|---------|-----------|--------|
| `csv-writer` | CSV export | ✅ Yes | Useful feature |
| `pagefind` | Full-text search | ✅ Yes | Great UX improvement |
| `rss` | RSS feeds | ✅ Yes | Allows subscriptions |
| `leaflet` | Geographic map | ✅ Yes | Visual appeal, educational |
| `@types/leaflet` | TypeScript types for Leaflet | ✅ Yes | Better DX |
| `node-cron` | Keep-alive ping | ✅ Yes | Prevents Supabase pause |
| `pg-dump` | Database backup | ❌ No | Manual backup sufficient |
| `@playwright/test` | E2E testing | ❌ No | Falkon incompatibility |
| `@axe-core/playwright` | Accessibility testing | ❌ No | Manual review better |

---

## 7. Next Steps

1. **Install the included dependencies:**
   ```bash
   npm install --save-dev node-cron csv-writer pagefind rss leaflet @types/leaflet
   ```

2. **Configure Pagefind** (after installation):
   ```bash
   npm install -g pagefind
   pagefind --source dist
   ```

3. **Use Leaflet** (after installation):
   - Add `leaflet/dist/leaflet.css` to `public/`
   - Add `leaflet/dist/leaflet.js` to `src/scripts/`
   - Create `src/components/MapaGeo.astro` component

4. **Use RSS** (after installation):
   - Create `/rss/works.xml` and `/rss/noticias.xml` routes
   - Use `rss` package to generate XML

5. **Use csv-writer** (after installation):
   - Create `src/lib/export.ts` with export functions
   - Add `/export` route with format selection

6. **Use node-cron** (after installation):
   - Create `src/lib/ping-supabase.ts` with periodic ping

---

## 8. FAQ

**Q: Can I use Falkon for testing?**
A: Yes, you can manually test in Falkon. E2E tests are not critical for this project.

**Q: Why not Google Maps instead of Leaflet?**
A: Google Maps requires an API key and billing setup. Leaflet + OpenStreetMap is free and requires no setup.

**Q: Do I need to pay for OpenStreetMap tiles?**
A: No, OpenStreetMap tiles are free for this use case.

**Q: Can I use Playwright with Falkon?**
A: No, Playwright doesn't support Falkon directly. You would need to use a different browser automation tool.

**Q: Is Leaflet heavy?**
A: No, Leaflet is very lightweight (~46 KB gzipped) and loads quickly.

**Q: Do I need an API key for Pagefind?**
A: No, Pagefind is free and open-source.

**Q: Do I need an API key for RSS?**
A: No, RSS is a simple XML format that doesn't require any services.

---

## 9. References

- [Playwright Documentation](https://playwright.dev/)
- [Leaflet Documentation](https://leafletjs.com/)
- [Pagefind Documentation](https://pagefind.app/)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [csv-writer Documentation](https://www.npmjs.com/package/csv-writer)
- [node-cron Documentation](https://www.npmjs.com/package/node-cron)
- [OpenStreetMap](https://www.openstreetmap.org/)
