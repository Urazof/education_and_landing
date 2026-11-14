# Maria Tkachenko — personal site (Astro)

Personal site of Maria Tkachenko, marketing leader and brand strategist (en `/`, ru `/ru/`).
Branch `redesign` = rebuild in the new design (warm paper, Fraunces + Inter, hero network canvas)
and a stronger technical SEO. Keep the existing content and case pages, change the look.

## Session startup

At the start of every session, do the following automatically — no need for the user to ask:

1. Check if `CONTEXT_LANDING.md` exists in the project root.
   - If it exists: read it and restore the project context from it.
   - If it does not exist: create it with a skeleton (project name, stack, goals, current state).
2. Check if `ASTRO-EDUCATION.md` exists in the project root.
   - If it exists: read it to understand patterns, conventions, and examples used in this project.
   - If it does not exist: create it with a skeleton (headings for key topics: components, routing, layouts, data fetching, etc.).
3. For redesign work read `docs/PLAN.md` (phases, checkboxes), `docs/DESIGN.md` (single source of truth for the look),
   `docs/CONTENT.md` (copy and links), and look at `docs/mockup/`.

## Keeping context files up to date

After any change to the project (new feature, fix, refactor, architecture decision):

- Update `CONTEXT_LANDING.md` — goals, decisions made, what is done, what is next.
- Update `ASTRO-EDUCATION.md` — new patterns, code examples, conventions. Maximally detailed: real code snippets,
  the "why", edge cases and gotchas. A living learning document, not a changelog.
  Every new section also gets a row (section, topic, date YYYY-MM-DD) in the "Индекс тем (с датами)" table at the top of the file.
  Sections are not in numeric order inside the file — the index says where they are.
- Both files are listed in `.gitignore` but were already tracked; the user commits them separately into the shared branch.
  Do not `git rm --cached` them and do not stage them in redesign-phase commits unless asked.

## File purposes

- `CONTEXT_LANDING.md` — project context snapshot: what we are building, current state, key decisions, next steps.
- `ASTRO-EDUCATION.md` — deep technical reference for a developer new to the project.
- `docs/` is listed in `.gitignore` (working material: specs, screenshots, plans such as `docs/FORM-PLAN.md`). Files already tracked (`CONTENT.md`, `DESIGN.md`, `PLAN.md`, `mockup/`) stay in git; new files there are NOT committed unless added with `git add -f`.
- `docs/` — redesign spec (from the kit). Edit only: tick checkboxes in `PLAN.md`, record decisions in its Phase 0 section,
  and keep `CONTENT.md` in sync with the real content. Never change `DESIGN.md` without asking.

## Stack (do not change without asking)

- Astro 5, `output: 'static'`, TypeScript strict, i18n en (no prefix) / ru (`/ru/`).
- Tailwind CSS **v4** via `@tailwindcss/vite` (already installed; do NOT run `astro add tailwind`).
  Design tokens as CSS variables / `@theme` in `src/styles/global.css`.
- Fonts self-hosted: `@fontsource-variable/fraunces`, `@fontsource-variable/inter`. Preload the two woff2 files used above the fold.
- Content Collections (`src/content.config.ts`), Zod-validated. Collection names come from THIS project: `cases` (existing),
  `press` (new, publications). Case URLs stay `/cases/[slug]` — do not rename to `/work/`.
- Integrations: `@astrojs/sitemap` (already). `llms.txt` as endpoint `src/pages/llms.txt.ts`.
- Images: `astro:assets` (`<Image />` / `<Picture />`), explicit width/height.
- JavaScript budget: the ONLY client island is the hero network canvas (`src/components/NetworkCanvas.ts`,
  vanilla TS, `<script>` in the component, started on `requestIdleCallback`). No React, no UI library.

## Commands

- `npm run dev`, `npm run build` (must pass with zero warnings), `npm run preview`.
- `npm run check` (= `astro check`) must pass before any phase is called done.

## Rules

- Semantic HTML: exactly one `<h1>` per page; sections use `<h2>`; real `<a href>` and `<button>`.
- Every page sets `title`, `description`, canonical, Open Graph, Twitter card through `src/layouts/Base.astro` props. No empty descriptions.
- JSON-LD `Person` on the home page; `CreativeWork` on case pages.
- Contrast ≥ 4.5:1 for text (including small grey labels). Respect `prefers-reduced-motion`.
- Outbound links: strip tracking parameters (utm_*, fbclid) from URLs; `rel="noopener noreferrer"` on external links.
- Never invent copy; use existing copy from the project / `docs/CONTENT.md`, else a `[TODO: …]` placeholder.
- Ask before: adding a dependency not listed above, changing URLs that exist on the live site, deploying.

## Git

- Work on branch `redesign`. `git commit` and `git push` are allowed ONLY on `redesign`
  (enforced by the hook `.claude/hooks/guard-branch.sh`). Never force-push, never merge, never push to main/develop,
  no `gh pr create/merge` — the user does that.
- One commit per finished phase (or sub-step), conventional style: `feat: …`, `fix: …`, `refactor: …`.
- Normal project flow outside the redesign: `develop` → `main`, `main` is deployed (Cloudflare).

## Definition of done for any change

1. `npm run build` and `npm run check` pass.
2. No layout shift from fonts/images, no render-blocking third-party scripts.
3. For visual changes, delegate a review to the `site-reviewer` subagent and fix what it reports.
4. `CONTEXT_LANDING.md` and `ASTRO-EDUCATION.md` updated.
