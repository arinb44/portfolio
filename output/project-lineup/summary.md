# Cut the portfolio to five projects: Implementation Summary

**Prepared by:** Lineup Editor
**Date:** 2026-11-18
**Status:** Complete

## 1. Overview
Hearth and Juno are gone from the site, along with their content files and images. The five remaining projects now appear on Home and `/projects/` as NFL Game Predictor, MLB Game Predictor, NBA Game Predictor, Nightfall, Falling Constellations. NFL is now the featured project, so the existing featured-first rule puts it first. No page or sorting code changed; only front matter, deletions and tests.

## 2. Requirements Checklist
| # | Requirement | Status | Note |
|---|---|---|---|
| 1 | Hearth / Juno content and images deleted | Done | 2 `.md` + 10 PNGs |
| 2 | `order` NFL 1, MLB 2, NBA 3, Nightfall 4, FC 5 | Done | |
| 3 | `featured` on NFL only | Done | FC's line removed (schema default false) |
| 4 | Home and `/projects/` in the new order, NFL `01 / 05 · Featured` | Done | e2e + checked in the browser |
| 5 | Prev/next follow the new order and wrap | Done | NBA: MLB ← → Nightfall; FC → NFL |
| 6 | No source or test refers to Hearth / Juno | Done | `git grep` outside `output/` is empty |
| 7 | `npm test` passes | Done | see section 5 |

## 3. Changes Made
- **Deleted:** `src/content/projects/hearth.md`, `src/content/projects/juno.md`, `src/assets/projects/hearth/` (5 PNGs), `src/assets/projects/juno/` (5 PNGs).
- **Modified:**
  - `nfl-predictor.md`: added `featured: true`.
  - `mlb-predictor.md`, `nba-predictor.md`, `nightfall.md`: `order` renumbered.
  - `falling-constellations.md`: `order` 5, `featured` removed.
  - `tests/unit/order.test.ts`: 5-project fixture with NFL featured; NBA's neighbours are now MLB / Nightfall.
  - `tests/e2e/site.spec.ts`: new slug order; NBA prev/next; JS-off walk NBA → Nightfall; table has 6 rows.
  - `tests/e2e/home.spec.ts`: new slug order; NFL is the first image, Skip-to-projects focus and first loop; counts are `/ 05`; the `#hearth` no-loop checks are removed, since every stop now has a loop.
- **Added:** `output/project-lineup/` (agent definition, plan, progress, decisions, this summary).

## 4. How to Use / Run
- Dev: `npm run dev`. Full check: `npm test`.
- To change the order later, edit `order` in `src/content/projects/*.md`. Exactly one file may have `featured: true`, and that project always shows first.

## 5. Testing
`npm test`, run on 2026-11-18:
- `astro check`: 0 errors, 0 warnings.
- Build: 9 pages.
- Unit: 12 passed, 0 failed.
- Playwright: 40 passed, 0 failed.

Covered: order and featured rules, the Home stop order and counts, the `/projects/` row count, prev/next wrap, links, axe on every page.
Not covered by tests: how NFL's first frame looks right after the opening's flash. I checked it once in the browser (NFL card over its loop, pause control shown).

## 6. Commits
- `8a95d16` Drop Hearth and Juno and lead with NFL (branch `project-lineup`, pushed to `origin`)
- Add the project-lineup summary and decision log (docs only, pushed)

## 7. Decision Log
See `decisions.md`. Key choices: delete fully rather than hide (#2); move featured to NFL rather than drop featured-first (#3); work on a new branch `project-lineup` off `project-visuals`, pushed to `arinb44/portfolio` (#6, #7).

## 8. Known Issues & Next Steps
- `project-lineup` is built on `project-visuals`, which is not merged into `main` yet. A PR to `main` would include those 13 commits too, unless `project-visuals` is merged first.
- Falling Constellations no longer shows "· Featured" on its card or project page.
- Hearth and Juno can only be recovered from git history (before `8a95d16`).
