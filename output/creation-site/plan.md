# Plan: Creation Site

## Project Title
Build the Creation design into the portfolio site and restyle every page to match.

## Objective
Replace the altarpiece home page with the design agent's final Creation prototype (Night Sky look, Atlas type), fed by the Astro content collection. Remove the altarpiece design from the site. Restyle the project pages, the projects index, About and 404 in the same colours and type with a simple reading layout.

## Requirements
1. `/` behaves like `output/creation-redesign/final/prototype/`: starfield arrival with name, nav, ring and caption; cursor-driven assembly; the touch and spark; reveal; 7 snap-scrolling project stops with a spark on each.
2. The 7 stops are rendered at build time from `src/content/projects/` (featured first, then `order`), not from `projects.json`.
3. "View project" links to `/projects/<slug>/`; "Live demo" and "Code" use the collection's URLs.
4. The skip link and the nav's "Projects" link reveal quickly and focus the first project's "View project".
5. Reduced motion: revealed at load, no animation.
6. No WebGL2: the still image with the revealed layout.
7. Touch devices (`hover: none` or `pointer: coarse`): the "This site needs a computer." notice on the home page; the scene does not start.
8. At <= 900 px wide or <= 560 px tall: the reading layout from the prototype.
9. Fonts are Gloock, Newsreader and IBM Plex Mono; no Garamond remains.
10. Project pages, projects index, About and 404 use the Night Sky tokens (ink ground, gesso text, stone-200 muted, gold accent, ochre focus) and the Atlas type, and work on any screen size, phones included.
11. No altarpiece component, style, script, font or art asset is still referenced or left in `src/`.
12. Every page has 0 axe violations (WCAG 2.2 AA rules); every text colour pair is in the contrast test and passes.
13. `npm test` passes.

## Scope
**In:** `src/`, `public/`, `tests/`, `scripts/`, `package.json`, `README.md`, `output/creation-site/`.
**Out:** the other agents' `output/` folders; project content text; new design for the home page; phone support for the home scene; a lower-particle mode for slow GPUs (noted as a follow-up); real name / tagline / About text (placeholders stay until you supply them); push, merge, deploy.

## Technical Approach
- **Engine:** copy `final/prototype/shared/creation.js` to `src/scripts/creation.js` unchanged except the default data path (`/creation/`).
- **Page layer:** `src/scripts/home.js` = the prototype's `page.js` without the JSON fetch and HTML building (Astro renders the stops). It keeps the ring / caption updates, the unlock at reveal > 0.75, skip / Projects handling, the spark per stop and the computer-only guard.
- **Home page:** `src/pages/index.astro` holds the prototype's markup (skip link, notice, canvas, still image, header, hint, `main` with the stops from `getProjects()`). It uses its own small layout (`src/layouts/Base.astro` gets a `home` flag that leaves out the shared header, footer and `main` wrapper) so `<head>`, fonts and tokens stay in one place.
- **Styles:** `src/styles/tokens.css` becomes the Night Sky / Atlas tokens (`--bg --text --muted --accent --focus --font-*`, pigment hex values kept). `src/styles/creation.css` = the prototype's `base.css` plus its inline overrides, loaded on the home page only. `src/styles/global.css` is rewritten for the other pages (roughly half its current size).
- **Data:** `whole-group-aa.webp` (601 KiB) and `particles.json` copied to `public/creation/`. The still image for no-WebGL uses the same file (one download, not two).
- **Other pages:** same content and URLs as now.
  - Shared header: name left; Projects, About, CV, Email right (mono, muted), as on the home page.
  - Project page: count-style label, Gloock title, one-line, metric, role, stack, pill "Live demo" + "Code" link, hero image, then the three further sections with plain headings ("Key features and results", "Architecture", "Origins"); prev / next links at the bottom.
  - Projects index: the existing table, restyled.
  - About: text column; credits changed to the Creation of Adam photo and the three fonts.
  - 404: plain wording ("Page not found").
- **Images:** `SfumatoPicture` is replaced by Astro's `<Picture>` directly (no blur-up script).

## Files Affected
| File | Change | Why |
|---|---|---|
| `src/scripts/creation.js` | create | WebGL2 engine from the prototype |
| `src/scripts/home.js` | create | Page layer from the prototype's `page.js` |
| `src/styles/creation.css` | create | Home page layout from `base.css` |
| `public/creation/whole-group-aa.webp`, `particles.json` | create | Painting and crop metadata |
| `src/pages/index.astro` | rewrite | Creation home page |
| `src/layouts/Base.astro` | edit | New fonts, `home` flag, no arrival / image-load scripts |
| `src/styles/tokens.css`, `global.css`, `contrast-pairs.ts` | rewrite | Night Sky tokens, other-page styles, new pairs |
| `src/components/Header.astro`, `Footer.astro`, `ProjectLayers.astro`, `ProjectNav.astro` | edit | New nav, plain headings, simple prev / next |
| `src/pages/projects/[slug].astro`, `projects/index.astro`, `about.astro`, `404.astro` | edit | Restyle, plain wording, new credits |
| `src/site.ts` | edit | Add `cv: '/cv.pdf'` |
| `tests/e2e/site.spec.ts` | edit | Remove altarpiece checks; all-page axe stays |
| `tests/e2e/home.spec.ts` | create | Requirements 1-8 |
| `tests/unit/contrast.test.ts` | edit if needed | Reads the new tokens |
| `package.json`, `package-lock.json` | edit | Fonts swapped (see Dependencies) |
| `README.md` | edit | New structure and credits |
| **Deleted:** `src/components/Altarpiece.astro`, `MainPanel.astro`, `Predella.astro`, `PredellaScene.astro`, `Wing.astro`, `SfumatoPicture.astro`; `src/scripts/arrival.js`; `src/styles/arrival.css`; `src/assets/art/` (Met crops); `scripts/art.mjs`; `tests/e2e/arrival.spec.ts`; `tests/unit/arrival.test.ts` | delete | Altarpiece only (all stay in git history) |

Kept: `src/content/`, `src/assets/projects/` (placeholder images), `src/lib/`, `scripts/placeholders.mjs`, `public/cv.pdf`, `public/favicon.svg` (recoloured if it shows the altarpiece).

## Dependencies
- `npm install` in this worktree (it has no `node_modules`); needs network.
- Add `@fontsource/gloock`, `@fontsource-variable/newsreader`, `@fontsource/ibm-plex-mono` (OFL, self-hosted, same pattern as now). Remove `@fontsource/eb-garamond`, `@fontsource/cormorant-garamond`. See D1.
- Playwright's Chromium must be installed (`npx playwright install chromium`) if this machine's copy is missing.

## Testing Strategy
Command: `npm test` (`astro check`, `astro build`, `node --test`, Playwright against the built site).
- **Unit:** contrast pairs against `tokens.css`; `order.test.ts` unchanged.
- **Browser (`home.spec.ts`):** 7 stops in the right order with correct links; first Tab is the skip link and Enter reveals and focuses "View project" of the featured project; reduced motion is revealed at load; emulated touch device shows the notice and no `revealed` class; WebGL2 disabled shows the still image; 720 px wide has no horizontal scroll; axe before and after the reveal; no console errors.
- **Browser (`site.spec.ts`):** every page returns 200, has one `h1`, 0 axe violations, no horizontal scroll at 320 px (other pages), and no altarpiece class names.
- **Manual, reported with screenshots:** the real cursor journey on the GPU (Playwright with `--use-angle=d3d11`, as the design agent did), compared with `final/shots/`.

## Milestones
1. **M1, home page.** Install; swap fonts; tokens; engine, page layer, `creation.css`, data; new `index.astro`; `home.spec.ts`; remove the arrival script, CSS and tests. Other pages still work (old styles kept until M2). Tests pass; propose commit.
2. **M2, other pages and removal.** Rewrite `global.css`; header, footer, project pages, index, About, 404; delete the altarpiece components, art assets and `scripts/art.mjs`; update `site.spec.ts` and the contrast pairs. Tests pass; propose commit.
3. **M3, wrap-up.** README; GPU journey screenshots against the design shots; Lighthouse on `/` and one project page (reported, not gated); `summary.md`. Propose commit.

## Decision Points
- **D1 Fonts:** Fontsource packages (recommended: self-hosted, no third-party request, matches the current setup) or the Google Fonts `<link>` the prototype used (no install, but an outside request on every visit).
- **D2 Installs:** approve `npm install` and the font packages before M1.
- **D3 Repository:** which GitHub repository (or local only), asked before the first commit.
- **D4 Placeholders:** name, tagline, email and About text; they stay bracketed until you give them.
- **D5 Project page wording:** drop the "Layer 1 of 4 · Varnish" labels for plain headings (recommended, the metaphor belongs to the altarpiece) or keep them. The content files keep their `layers` data either way.
- **D6 Deletions:** the list above, approved with this plan.

## Risks & Limitations
- Playwright's default headless Chromium renders WebGL in software; ~690k particles may be slow there. Tests use the skip link and reduced motion, not the cursor journey; the journey is checked by hand on the real GPU.
- Only Chromium on this machine (RTX 4070) has been measured; Firefox, Safari and integrated GPUs are unknown.
- Home page weight will be about 0.7-0.8 MiB (painting 601 KiB); the old site's Lighthouse scores will drop on `/`.
- The other pages have no approved design; their layout is mine and may need a design pass later.
- Astro bundles `home.js`; the engine's `fetch` of `/creation/*` assumes the site is served from the domain root (true today: `astro.config.mjs` has no `base`).

## Open Questions
- D1, D3, D4, D5 above.

**Status:** Approved on 2026-11-14 (D1 Fontsource, D5 plain headings, D6 deletions approved; D3 a GitHub repository, URL to be given)
