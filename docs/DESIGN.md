# Design spec

Reference mockup (look at these before building any section):
- `docs/mockup/desktop-1440.png`, `docs/mockup/mobile-390.png`: full-page renders.
- `docs/mockup/index.html`: the same mockup as a working static page (open it, click the network).
  It is a visual and behavioural reference, NOT code to copy: rebuild it as Astro components with tokens.
  The canvas script at the bottom of it is a good starting point for `NetworkCanvas.ts`.

Direction: warm paper, editorial serif display, one deep accent, a lot of air.
Pattern source: tdespins.com (structure and rhythm only; no copying of assets, copy or colours).

## Tokens (`src/styles/global.css`)
```css
:root {
  --paper:      #F6F3EE;  /* page background */
  --paper-2:    #EFEBE4;  /* alternate section background */
  --line:       #E2DCD2;  /* hairlines, borders */
  --ink:        #17150F;  /* primary text, dark band */
  --ink-2:      #4F493F;  /* body copy */
  --muted:      #6B645A;  /* labels, captions (passes 4.5:1 on --paper) */
  --accent:     #2E6A4F;  /* links hover, CTA, labels, the full stop in headings */
  --accent-ink: #245640;  /* CTA hover */
  --accent-on-dark: #9CC8B2;
  --radius: 4px;
  --container: 1200px;
}
```
Alternative accents (decide with Maria): `#2B4C7E` ink blue, `#B0472A` brick, `#6A3E6E` plum.

## Typography
- Display / headings: Fraunces Variable, weight 400 (300 for italic words), tight leading.
  - H1: `clamp(52px, 8vw, 124px)`, line-height .98, letter-spacing -0.02em. One word in italic, the closing full stop in `--accent`.
  - H2: 48px / 1.05. Card titles: 26px. List rows: 24px.
- Body: Inter Variable 17–18px, line-height 1.6–1.7, colour `--ink-2`.
- Eyebrow labels: 12px, uppercase, letter-spacing .22em, colour `--accent` (or `--muted` in hero).

## Layout
- Container `max-width: var(--container)`, horizontal padding 32px (20px on phones).
- Section vertical padding 120px desktop / 72px mobile. Hairline borders between sections.
- Everything collapses to one column under ~760px; nav wraps under the logo.

## Sections (home page, in order)
1. Header: sticky, `rgba(246,243,238,.88)` + `backdrop-filter: blur(10px)`, hairline bottom. Logo = name in Fraunces 20px. Nav: About, Work, Publications, Contact.
2. Hero: interactive network canvas behind content. Eyebrow name, H1 "I build brands that *drive* growth.", role line (Marketing leader / Brand strategist / E+ Awards jury, 2024), one-paragraph intro, CTA "See selected work →" (filled accent) + "Get in touch" (underlined text link). Portrait right, 4:5, with caption.
3. About: eyebrow + H2 "Insight first. *Then* the brand." left; copy right. NO numeric stats row.
4. Selected work (`--paper-2` background): eyebrow, H2, "Archive →" link right. Cards in a wrap grid (min 340px): 4:3 cover, kind label, title. Hover: cover scales to 1.03, title turns accent.
5. Publications & podcasts: list rows separated by hairlines, top border in ink. Columns: outlet label / title (Fraunces 24px) / kind / ↗. Hover: row background `--paper-2`, arrow nudges 4px.
6. Recognition band: `--ink` background, "Jury member, *E+ Awards* (formerly Effie), 2024", large italic "E+" on the right in `--accent-on-dark`.
7. Contact: H2 "Let's keep *in touch*." at `clamp(48px, 7vw, 96px)`, short line, buttons LinkedIn (filled), Telegram, WhatsApp (outlined).
8. Footer: © year, small links: sitemap.xml · llms.txt.

## Case page `/work/[slug]`
Eyebrow (kind) · H1 (title) · meta row (brand, year, role) · cover · sections from MDX (Challenge, Approach, Result) · next-case link. Same tokens.

## Hero network canvas (the only JS)
- Canvas absolutely fills the hero; content above it with `pointer-events: none` except links.
- ~70 nodes per 1440×760 area (scale by area), slow drift, links drawn when distance < 120px; ink at 8% alpha, ~8% of nodes in accent.
- Click near a node: it lights up, a ring pulse expands, the light spreads to neighbours with 55% probability per link, max depth 6, 120–240ms delay per hop. Counter "INSIGHTS LINKED 0000" top-right (`aria-hidden`).
- `devicePixelRatio`-aware, re-init on resize (ResizeObserver), pause when off-screen (IntersectionObserver) and when the tab is hidden.
- `prefers-reduced-motion: reduce` → static network, no drift, clicks still light nodes.
- Canvas is decorative: `aria-hidden="true"`; must not affect LCP (start on idle).
