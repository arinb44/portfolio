# Build the Creation design into the portfolio site: Implementation Summary

**Prepared by:** Creation Site Builder
**Date:** 2026-11-14
**Status:** Complete (content placeholders remain, see section 8)

## 1. Overview
The altarpiece site was replaced by the design agent's Creation design. The home page is now the approved prototype (Night Sky look, Atlas type), built into Astro and fed by the project content collection. The project pages, the projects table, About and 404 were restyled in the same colours and type with a plain reading layout, and every altarpiece component, style, script, font and art asset was removed.

## 2. Requirements Checklist
| # | Requirement | Status | Note |
|---|---|---|---|
| 1 | `/` behaves like the final prototype | Done | Same engine file; the revealed frame matches `final/shots/final-6-revealed.png`; cursor journey checked on the GPU |
| 2 | 7 stops rendered at build time from the collection | Done | Featured first, then `order` |
| 3 | "View project", "Live demo", "Code" links | Done | All 7 project links return 200 |
| 4 | Skip link and "Projects" reveal and focus the first project | Done | Also works when pressed before the scene has loaded |
| 5 | Reduced motion: revealed at load | Done | |
| 6 | No WebGL2: still image, revealed layout | Done | Also used when JavaScript is off |
| 7 | Touch devices: "needs a computer" notice | Done | Scene does not start |
| 8 | Reading layout at <= 900 px wide or <= 560 px tall | Done | Tested at 720 x 450 |
| 9 | Gloock, Newsreader, IBM Plex Mono; no Garamond | Done | Self-hosted through Fontsource |
| 10 | Other pages in Night Sky / Atlas, any screen size | Done | No sideways scroll at 320 px |
| 11 | No altarpiece code or assets left in `src/` | Partial | Nothing is used or shown; the content schema still names `predella` and the layers `varnish / paint / underpainting / underdrawing` (content files were out of scope) |
| 12 | 0 axe violations; contrast pairs pass | Done | 11 pages; home before and after the reveal; 5 colour pairs |
| 13 | `npm test` passes | Done | See section 5 |

## 3. Changes Made
**Created**
- `src/scripts/creation.js`: the WebGL2 scene, copied from the prototype (only the data path changed).
- `src/scripts/home.js`: ring, reveal, skip links, spark per project.
- `src/styles/creation.css`: home page layout from the prototype's `base.css`.
- `src/components/Head.astro`: shared `<head>` (title, fonts, tokens).
- `public/creation/whole-group-aa.webp`, `particles.json`: the painting and its crop data.
- `tests/e2e/home.spec.ts`: 9 home page tests.

**Modified**
- `src/pages/index.astro`: the Creation home page.
- `src/layouts/Base.astro`, `src/components/Header.astro`, `Footer.astro`, `ProjectLayers.astro`, `ProjectNav.astro`: new nav, plain headings, simple prev / next.
- `src/pages/projects/[slug].astro`, `projects/index.astro`, `about.astro`, `404.astro`: restyled; plain wording; new credits.
- `src/styles/tokens.css`, `global.css`, `contrast-pairs.ts`: Night Sky tokens, new page styles, new pairs.
- `src/site.ts` (`cv`), `src/lib/order.ts`, `src/lib/projects.ts` (comments), `public/favicon.svg` (gold ring).
- `tests/e2e/site.spec.ts`, `playwright.config.ts` (real GPU), `package.json`, `package-lock.json`, `README.md`.

**Deleted**
- Components: `Altarpiece`, `MainPanel`, `Predella`, `PredellaScene`, `Wing`, `SfumatoPicture`.
- `src/scripts/arrival.js`, `src/styles/arrival.css`, `src/assets/art/` (5 files), `scripts/art.mjs`.
- `tests/e2e/arrival.spec.ts`, `tests/unit/arrival.test.ts`.
- Packages: `@fontsource/eb-garamond`, `@fontsource/cormorant-garamond`.

## 4. How to Use / Run
- `npm install`, then `npm run dev` (dev server) or `npm run build` and `npm run preview`.
- `npm test` runs the type check, the build, the unit tests and the browser tests.
- Your name, tagline, email, GitHub and CV path: `src/site.ts`. About text: `src/pages/about.astro`.
- More detail: `README.md`.

## 5. Testing
Command: `npm test`. Final results:
- `astro check`: 0 errors, 0 warnings.
- Build: 11 pages.
- Unit (`node --test`): 12 passed, 0 failed (ordering rules, contrast pairs).
- Playwright + axe: 36 passed, 0 failed.

Covered: every page (status, one `h1`, alt text, axe, no old class names, 320 px width), link checks, prev / next order, tab order on a project page, fonts, and the home page (arrival, stops, skip, nav reveal, reduced motion, no WebGL2, zoom layout, touch notice, no JavaScript).

Checked by hand: the real cursor journey at 1440 x 900 on the GPU (reveal fires, two wheel steps reach project 3, no console errors), and screenshots of the other pages.

Lighthouse (local preview, this machine):
| Page | Preset | Performance | Accessibility | LCP | CLS | TBT | Weight |
|---|---|---|---|---|---|---|---|
| `/` | desktop | 83 | 100 | 0.2 s | 0 | 390 ms | 782 KiB |
| `/projects/nba-predictor/` | mobile | 100 | 100 | 0.6 s | 0 | 0 ms | 219 KiB |

The home page's mobile run scored 100 but only measured the "needs a computer" notice, so it is not a useful number.

Not covered: Firefox, Safari, integrated GPUs, and the cursor-driven assembly inside the automated tests (they use the skip link).

## 6. Commits
- `c615a41` Replace the altarpiece home with the Creation scene
- `7935ca7` Restyle the other pages in Night Sky and remove the altarpiece
- Update the README and add the implementation summary (this commit)

Both are pushed to `https://github.com/arinb44/portfolio`, branch `claude/website-design-overhaul-45e304`.

## 7. Decision Log
- New project in the worktree; the altarpiece project is left as a record (#1, #2).
- Whole site; same stack; fidelity first (#3-#5).
- Fontsource fonts, plain headings on project pages, deletions approved (#7-#9).
- Repository `https://github.com/arinb44/portfolio`; only the work branch is pushed (#10, #12).
- Implementation notes (#11): shared `Head.astro` instead of a `home` flag; Playwright on the real GPU; skip link wired before the scene loads; no-JavaScript fallback.
Full log: `decisions.md`.

## 8. Known Issues & Next Steps
- **Placeholders:** name, tagline, email, About text, CV, project images, and the `TODO` fields in the project files.
- **Remote `main`:** the GitHub repository's `main` (f86fe95) has no shared history with this project. Decide how to bring this branch onto it (for example, replace `main` or open a pull request with unrelated histories allowed).
- **Schema names:** `predella` and the four layer names come from the first design. Renaming them means editing all 7 content files and `scripts/placeholders.mjs`.
- **Home page blocking time:** 390 ms, from building about 690,000 particles on the main thread at load. A worker or a lower particle count on slow machines would cut it.
- **Tests are Windows-specific:** `playwright.config.ts` uses `--use-angle=d3d11`.
- **Other pages have no approved design:** their layout is this agent's; a design pass may follow.
- **Fonts:** the Newsreader variable files are 132 KiB (roman) and 147 KiB (italic, About page only). A static 400 weight would be smaller.
