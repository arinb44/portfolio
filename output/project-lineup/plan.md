# Plan: Project Lineup

## Project Title
Cut the portfolio to five projects: NFL, MLB, NBA, Nightfall, Falling Constellations.

## Objective
Delete the Hearth and Juno projects (content and images) and reorder the remaining five so Home and `/projects/` read NFL Game Predictor, MLB Game Predictor, NBA Game Predictor, Nightfall, Falling Constellations. The featured flag moves from Falling Constellations to NFL, so the existing featured-first rule puts NFL first without any code change. Tests that name, count or order projects are updated to match.

## Requirements
1. `src/content/projects/hearth.md`, `src/content/projects/juno.md`, `src/assets/projects/hearth/` and `src/assets/projects/juno/` no longer exist.
2. Front matter `order`: NFL 1, MLB 2, NBA 3, Nightfall 4, Falling Constellations 5.
3. `featured: true` on NFL only. Falling Constellations has no `featured` line (the schema defaults it to false).
4. Home stops and `/projects/` rows appear as NFL, MLB, NBA, Nightfall, Falling Constellations, with NFL marked "01 / 05 · Featured".
5. Project pages' prev/next follow the new order and wrap (FC → NFL, NFL ← FC).
6. No source file or test refers to Hearth or Juno.
7. `npm test` passes.

## Scope
**In:** the 7 content files (delete 2; edit `order` / `featured` lines in 4), the two image folders, `tests/unit/order.test.ts`, `tests/e2e/home.spec.ts`, `tests/e2e/site.spec.ts`.
**Out:** `sortProjects` / featured-first logic, page templates, the intro, painted loops in `public/projects/`, styles, project text, other agents' `output/` folders.

## Technical Approach
No code changes. `getProjects()` already sorts by `order` and enforces exactly one featured project; Home and `/projects/` already put the featured project first. So moving the flag and renumbering is enough. The count label (`01 / 05`) is computed from the list length, and no CSS or JS hard-codes 7 (checked by grep).

Content edits:
| File | `order` | `featured` |
|---|---|---|
| nfl-predictor.md | 1 (unchanged) | add `featured: true` |
| mlb-predictor.md | 3 → 2 | — |
| nba-predictor.md | 2 → 3 | — |
| nightfall.md | 6 → 4 | — |
| falling-constellations.md | 7 → 5 | remove `featured: true` |

Test edits:
- `order.test.ts`: the fixture becomes the 5 projects (NFL featured). Expected order updated. "NBA sits between NFL and MLB" becomes "NBA sits between MLB and Nightfall". The wrap test is unchanged (FC → NFL still holds).
- `site.spec.ts`: `SLUGS` gets the new order. NBA prev/next become MLB / Nightfall (prev/next test and tab-order test). The JS-off walk becomes NBA → "Next: Nightfall". The projects table has 6 rows (header + 5).
- `home.spec.ts`: `SLUGS` becomes NFL, MLB, NBA, Nightfall, FC. The first image, Skip-to-projects focus and first-stop loop test move from FC to NFL. The count labels become `01 / 05 · Featured` and `05 / 05`, and "7 projects" becomes 5. The reduced-motion and JS-off headings check NFL (the first project) instead of FC. The NBA loop test loses its two "no loop at this stop" checks on `#hearth`: every remaining stop now has a loop, so it scrolls away to `#nightfall` and checks the NBA loop switches off.

## Files Affected
| File | Change | Reason |
|---|---|---|
| `src/content/projects/hearth.md` | delete | Req 1 |
| `src/content/projects/juno.md` | delete | Req 1 |
| `src/assets/projects/hearth/` (5 PNGs) | delete | Req 1 |
| `src/assets/projects/juno/` (5 PNGs) | delete | Req 1 |
| `src/content/projects/nfl-predictor.md` | modify | featured (Req 3) |
| `src/content/projects/mlb-predictor.md` | modify | order (Req 2) |
| `src/content/projects/nba-predictor.md` | modify | order (Req 2) |
| `src/content/projects/nightfall.md` | modify | order (Req 2) |
| `src/content/projects/falling-constellations.md` | modify | order + featured (Req 2, 3) |
| `tests/unit/order.test.ts` | modify | Req 2, 5 |
| `tests/e2e/home.spec.ts` | modify | Req 4, 6 |
| `tests/e2e/site.spec.ts` | modify | Req 4, 5, 6 |

## Dependencies
None.

## Testing Strategy
- `npm test` (`astro check`, `astro build`, unit, Playwright e2e on the real GPU).
- `git grep -i -e hearth -e juno -- src tests` returns nothing.
- Built site check in the browser preview: the Home stops and the `/projects/` table in the new order.

## Milestones
1. **M1: Lineup.** Make every edit and deletion above, run `npm test`, and check in the browser. Then propose one commit on new branch `project-lineup` (from `project-visuals`): "Drop Hearth and Juno and lead with NFL". Ask before pushing to `origin` (`arinb44/portfolio`).

## Decision Points
- Commit and push approval at the end of M1.
- If an e2e test fails for a reason unrelated to this change (e.g. GPU timing), stop and ask.

## Risks & Limitations
- Home now opens on NFL's painted loop instead of Falling Constellations', so the opening's flash lands on NFL's image. Nothing in `intro.js` or `home.js` names FC (checked by grep). Whether NFL's first frame reads as well after the flash is a look question, checked in the browser.
- NFL's project page now shows "· Featured" and FC's no longer does.
- Deleted files are recoverable from git history only.

## Open Questions
None.

**Status:** Approved on 2026-11-18
