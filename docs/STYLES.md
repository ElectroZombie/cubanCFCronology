# CubanCFCronology — Style Guide

All visual styles for CubanCFCronology: color palette, typography, layout
principles, component styling, and accessibility standards.

## Color palette

### Primary colors (screen green + bone)

| Name | Hex | Usage |
|------|-----|-------|
| --color-bone-50 | #fdfbf7 | Light backgrounds, text on dark |
| --color-bone-100 | #f7f3e8 | Secondary backgrounds |
| --color-bone-200 | #efe9d2 | Tertiary backgrounds |
| --color-bone-300 | #e7dfc4 | Muted text, borders |
| --color-bone-400 | #d6cd9c | Low-contrast text |
| --color-green-400 | #86efac | Highlights, accents |
| --color-green-500 | #4ade80 | Primary actions, links |
| --color-green-600 | #16a34a | Darker green actions |
| --color-green-700 | #15803d | Darkest green, hover states |

### Deep space (backgrounds)

| Name | Hex | Usage |
|------|-----|-------|
| --color-space-900 | #050504 | Primary background |
| --color-space-800 | #0a0a08 | Secondary background |
| --color-space-700 | #111110 | Panels, cards |
| --color-space-600 | #1a1a17 | Elevated surfaces |

### Panel borders

| Name | Hex | Usage |
|------|-----|-------|
| --color-panel-border | #16a34a | Panel borders |

### Shadows

| Name | Value | Usage |
|------|-------|-------|
| --shadow-glow | 0 0 12px | Green glow shadow |

### Border radius

| Name | Value | Usage |
|------|-------|-------|
| --radius-sm | 0 | No rounding |
| --radius-md | 0 | No rounding |
| --radius-lg | 0 | No rounding |

All borders are straight (no rounded corners) per design decision.

## Typography

### Font stack

| Name | Stack | Usage |
|------|-------|-------|
| --font-sans | 'KORAD', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif | Primary typeface |
| --font-mono | ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace | Code, UI elements |

KORAD.ttf is the official project font, loaded via @font-face from FONT/KORAD.ttf. System fallbacks ensure readability if the font fails to load.

### Font usage

- Body: var(--font-sans) — KORAD with system fallbacks
- UI components: var(--font-mono) — monospace for buttons, badges, timestamps
- Headings: var(--font-sans) — KORAD, large sizes, tracking-tight
- Small text: var(--font-mono) — text-xs, uppercase, tracking-widest

## Layout

### Grid and spacing

- Max content width: max-w-7xl (1440px)
- Horizontal padding: px-6 (mobile), px-6 (desktop)
- Vertical padding: py-8 (sections)
- Component gap: gap-4 to gap-8 depending on context

### Panels

Panels use border-green-600/30 or border-green-600/50 with bg-space-800/50 background, p-4 to p-8 padding.

### Buttons

btn-ship class: px-6 py-3 text-green-500 bg-transparent border border-green-500 font-mono text-sm uppercase tracking-widest transition-all duration-200

### Navigation

- Primary nav: flex-row gap-8 font-mono text-sm md:flex
- Nav links: nav-link class with hover state hover:text-green-500
- Breadcrumbs: flex flex-wrap gap-2 text-sm text-bone-300

## Accessibility standards

| Standard | Requirement | Implementation |
|----------|-------------|----------------|
| WCAG 2.1 AA | Contrast 4.5:1 normal text | --color-bone-50 on --color-space-900 |
| WCAG 2.1 AA | Contrast 3:1 large text | --color-bone-300 on --color-space-800 |
| Keyboard nav | Visible focus indicators | focus:outline-none focus:border-green-500 |
| Semantic HTML | One <h1> per page | Enforced in all pages |
| Skip link | Saltar al contenido | First focusable element |
| Focus management | focus:not-sr-only focus:fixed focus:left-4 focus:top-4 | Skip link styling |

## Component naming

- Components: PascalCase with Spanish domain nouns (TarjetaAutor, TarjetaObra, LineaTiempo)
- Utilities: camelCase
- UI copy and CSS class intent: Spanish
- Identifiers, file names, code comments: English

## Colors in Spanish naming intent

- bone = hueso (off-white/cream)
- space = espacio (deep backgrounds)
- panel-border = borde de panel (green accent)
- shadow-glow = sombra de brillo verde (green glow)
