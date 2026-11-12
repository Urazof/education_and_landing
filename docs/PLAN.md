# Build plan (adapted to the existing project)

The kit assumed a from-scratch build; this project already exists (Astro 5, Tailwind v4, en/ru, 6 cases).
Work one phase at a time. Start each phase in plan mode if desired, tick the boxes when acceptance criteria hold,
then `npm run check`, `npm run build`, update `CONTEXT_LANDING.md` + `ASTRO-EDUCATION.md`, commit (branch `redesign` only).

## Phase 0: audit and decisions
Decisions (agreed with the user):
- Collections: keep `cases` (URLs `/cases/[slug]`, no redirects); add `press`. The kit's `work` / `/work/` is NOT used.
- i18n: keep en + ru. Every new string goes through `src/i18n/ui.ts`.
- Tailwind v4 stays (`@tailwindcss/vite`); no `astro add tailwind`.
- Case pages: keep `CaseArticle` and its layouts (`aside-*`, `media-row`, `spotlight`, `ImageRow`, `MediaRow`, `VideoGroup`); restyle with the new tokens only.
- Accent: `#2E6A4F` (DESIGN.md default) until Maria picks another.
- Keep: `Base.astro` SEO props, sitemap config, case content/assets, `Works` logic (archive filter, odd-card centring), social links, real publication URLs.
- Rewrite: global.css tokens + fonts, Hero (canvas + new H1/portrait), About, Nav/Footer, Works cards, Publications (list rows + `press` collection), Contact, new Recognition band, case-page colours.
- Remove at the end: the unused `About.astro` split if it stays unused; legacy `icon-*.png` assets (unused since SVG icons).
- Git: commits/pushes only on `redesign` via `.claude/hooks/guard-branch.sh`. Context files are committed by the user later.
- [x] Kit docs, agent and skills copied into the repo root (`docs/`, `.claude/agents`, `.claude/skills`).
- [x] `CLAUDE.md` merged (kit rules + project rules). `docs/CONTENT.md` filled from the project.
- [x] `.claude/settings.local.json`: drop `deny` for `git commit` / `git push`, register the branch-guard hook (needs user approval to edit).
- [x] Delete the now-duplicated `maria-site-claude-kit/` folder (ask the user first).

## Phase 1: foundation
- [x] `npm i @fontsource-variable/fraunces @fontsource-variable/inter`.
- [x] `src/styles/global.css`: tokens from DESIGN.md (`--paper`, `--ink`, `--accent`, …) exposed through `@theme`; replace the old `--color-ink`/`--color-paper` values; keep brand tokens only if still used.
- [x] `Base.astro`: font preloads (2 woff2), keep meta/OG/Twitter/canonical, add a JSON-LD slot, `og:image` already works via the `ogImage` prop (the file itself comes in Phase 5); added a `jsonLd` prop.
- [x] Sticky header + footer shells.
Acceptance: `npm run build` passes; a page renders with the right fonts and colours; no font layout shift.

## Phase 2: content model + home sections
- [ ] `src/content.config.ts`: add `press` (`outlet`, `title`/`label`, `kind`, `url`, `order`) — no utm/fbclid in URLs; `cases` schema untouched.
- [ ] Components (en + ru): Nav, Hero (no canvas yet; H1 with italic word and accent full stop, roles, CTAs, portrait 4:5), About, Works grid on `--paper-2`, Publications as list rows, Recognition band, Contact, Footer.
- [ ] Responsive at 375, 768, 1280, 1440.
Acceptance: matches DESIGN.md and `docs/mockup/`; zero client JS in `dist/`.

## Phase 3: hero network canvas
- [ ] `src/components/NetworkCanvas.astro` + `NetworkCanvas.ts` per DESIGN.md.
Acceptance: one small JS file in `dist/` (< 8 KB gzip); reduced-motion respected; no CLS; LCP unaffected.

## Phase 4: case pages
- [ ] Restyle `CaseArticle`, `CaseCard`, `ImageRow`, `MediaRow`, `VideoGroup` with the new tokens; check all 6 cases en + ru.
- [ ] `CreativeWork` JSON-LD, next-case link, unique title/description per case (replace the generic template description).
Acceptance: every case has a unique title/description; layouts did not regress (screenshots).

## Phase 5: SEO and machine-readable files
- [ ] `Person` JSON-LD on home; sitemap check; `robots.txt` with sitemap line; `src/pages/llms.txt.ts`; OG image 1200×630; real meta description.
- [ ] Run `/seo-audit`, fix findings.
Acceptance: audit clean.

## Phase 6: review and deploy
- [ ] `site-reviewer` subagent full pass; fix all "Must fix" items.
- [ ] Deploy target: Cloudflare (domain already there). Ask before deploying; deploy branch/flow to be confirmed (see `CONTEXT_LANDING.md` deploy notes).
