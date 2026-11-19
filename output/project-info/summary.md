# Project Info and Finishing the Portfolio: Implementation Summary

**Prepared by:** Project Info Writer
**Date:** 2026-11-18
**Status:** Complete, and live at https://arin-barman.pages.dev/

## 1. Overview
All five project pages now carry checked facts and real images: Fourth and Why (NFL), Full Count (MLB), Tip-Off (NBA), Nightfall and Falling Constellations. The three bland predictor names were replaced. The site shows Arin's name, tagline, email, About page and real CV. Every project is published (`draft: false`). The project pages and the projects index were redesigned as a "paired folio": on wide screens one plate holds still and swaps as the reader moves through each section, and a gold index step follows. The design was reviewed independently and documented in DESIGN.md.

## 2. Requirements Checklist
| # | Requirement | Status | Note |
|---|---|---|---|
| 1 | No TODO in any visible field | Done | Tested on `/`, `/projects/`, `/about/` and all five project pages (also "placeholder", "[Your", "you@example") |
| 2 | Role lines | Done | Four solo; the three predictors credit Michigan Edge (#26) |
| 3 | Text checked against each repo | Done | Corrections logged (#16 MLB stack; Nightfall "its scripts are public", the 140-line count) |
| 4 | Metrics only where a repo states them | Done | NFL 65.5%, MLB 57.8%, NBA 67.5%; sources in decisions #12, #17, #19 |
| 5 | Four real images per project, real alt and captions | Done | Live demos, repo charts, HTML diagrams, a prototype render, Blender render frames |
| 6 | Image sizes and budget | Done | Every shown source ≤ 400 KB; heavy screenshots as JPEG |
| 7 | Nightfall video in the hero | Done | The Blender escape clip (another session), with captions and a reduced-motion poster |
| 8 | Nightfall stills | Changed | Its repo has no screenshots and no gameplay video was supplied, so: one frame of the render plus two diagrams from the scripts (#28) |
| 9 | Tests pass every milestone | Done | Final `npm test`: Playwright 56/56 |
| 10–13 | Identity, About, CV, Michigan Edge | Done | #24–#27 |
| 14 | Nightfall page finished | Done | #25, #28 |
| 15 | `draft: false` on all five | Done | |
| 16 | Project pages and index redesigned; h1 never breaks mid-word | Done | Paired Folio (#29); title test at 320/390/1280/1440 |
| 17 | Site-wide placeholder test | Done | |

## 3. Changes Made
- **Content:** `src/content/projects/*.md` (all five), `src/site.ts`, `src/pages/about.astro`, `public/cv.pdf` (the resume).
- **Images:** `src/assets/projects/<slug>/` hero, Key features, Architecture and Origins images for all five, captured or prepared by `scripts/capture.mjs`. Diagram sources are in `scripts/diagrams/*.html` with the shared `diagram.css`.
- **Pages and components:**
  - `src/pages/projects/[slug].astro`: the folio, plus the stage script.
  - `src/components/ProjectLayers.astro`, `ProjectNav.astro`, `Footer.astro`.
  - New `src/components/Arrow.astro`.
  - `src/pages/projects/index.astro`: the folio list with results.
  - `src/styles/global.css`.
- **Tests:** `tests/e2e/site.spec.ts`: the placeholder check, the stage swap at 1440, plate-above-text at 390, the title-wrap check, and the updated tab order and index tests. `tests/e2e/home.spec.ts`: the renames.
- **Design records:** `PRODUCT.md`, `DESIGN.md`, `.impeccable/` (config, surface brief with the direction contract, decision sketches, `design.json`).
- **Deleted:** placeholder images replaced by real ones (`varnish.png`, `paint-1.png` and others where the format changed to JPEG).

## 4. How to Use / Run
- Dev server: `npm run dev`. Full check: `npm test`.
- To redo an image, run `npm run capture -- <name>` (no name lists them). Some shots need a demo awake first: Render takes 30–60 s, and Streamlit Cloud needs its wake button pressed. The NFL waterfall is cropped above the chart's axis title.
- To change a project's facts, edit its `.md`. Images keep their base names (`varnish`, `paint-1`, `underpainting`, `underdrawing-1`), and a plate's frame follows its image's aspect ratio automatically.

## 5. Testing
`npm test` on 2026-11-18:
- `astro check`: 0 errors, 0 warnings.
- Build: 9 pages.
- Unit: 12/12.
- Playwright: 56/56.

Covered:
- axe (WCAG 2.2 AA) on every page and in the staged state.
- No sideways scroll at 320 px.
- Keyboard tab order.
- Placeholders.
- Title wrapping at 4 widths.
- The stage swap.
- Narrow stacking.
- The Nightfall video and its reduced-motion behaviour.

Not covered by tests: how the plates look (checked by eye and by two finish reviews).

## 6. Commits (branch `project-info`, then `finish-portfolio`; all pushed to `origin`)
- `da64fd6` Add a capture script for project images
- `cf90a62` Fill in the NFL project page
- `2a600cc` Rename the predictors to Fourth and Why, Full Count and Tip-Off
- `dde3955` Fill in the Full Count project page
- `a5b5287` Fill in the Tip-Off project page
- `940d018` Fill in the Falling Constellations project page
- `6a1f55c` Note what the Nightfall repo shows
- (another session: the Nightfall escape clip and its hero, merged into `main` as `65f845d`)
- `c047296` Fill in the site's name, About page and CV
- `f49e433` Fill in the Nightfall project page
- `77c8023` Redesign the project pages as a paired folio
- then DESIGN.md and this summary

## 7. Decision Log
See `decisions.md` (#1–#30). The key ones:
- Facts come only from the repos and the user (#4).
- The renames (#14).
- The CV is published with its phone number, by the user's choice (#24).
- The Falling Constellations prototype was rendered locally, a deviation from the plan (#20).
- The Paired Folio was chosen, then rebuilt and fixed through two independent reviews (#29, #30).

## 8. Known Issues & Next Steps
- **Hosting:** Cloudflare Pages at https://arin-barman.pages.dev/, rebuilt on every push to `main` (decision #31). Checked live on 2026-11-19: every page 200, CV and videos served, 404 page, no console errors or broken images.
- **Merged:** PR #1 (`finish-portfolio` into `main`) as `5cf5aee`.
- **Reviewer's non-material ideas, not built:**
  - A clip-path wipe instead of the plain fade for the plate swap.
  - Bare ink below shorter plates on wide screens.
  - Linked index thumbnails with a hover state.
  - Slightly larger arrows in the prev/next links.
- **Captures date:** the demo screenshots show week 11 of 2026 and are captioned with their capture date.
- **Unchecked:** Tip-Off's `coldStartSeconds: 67` is not in its repo.
- **Nightfall's Origins** is a diagram because no early screenshot exists. Send one to replace it.
- **Unused:** the `predella` images and alt text are still placeholders, but nothing on the site shows them.
