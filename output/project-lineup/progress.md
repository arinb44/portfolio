# Progress: Project Lineup

- **Current phase:** Phase 4, M1 (lineup)
- **Status:** waiting for user (approve the M1 commit)

## Completed milestones
- 2026-11-17: Project root confirmed (`C:\Users\arins\Arin\School\Projects\Portfolio`); new project chosen over resuming `altarpiece-portfolio-site` / `creation-site`.
- 2026-11-17: Phase 1 interview confirmed; slug `project-lineup`.
  - Goals: delete Hearth and Juno fully; featured moves from Falling Constellations to NFL; order NFL 1, MLB 2, NBA 3, Nightfall 4, FC 5.
  - Stack: existing (Astro, TypeScript, Playwright, node:test); no new dependencies.
  - Focus: correctness, small diff. Off-limits: other agents' `output/` folders, intro, loops, styling, project text.

- 2026-11-17: Phase 2 `programAgent.md` approved. Branch: new `project-lineup` from `project-visuals`. Repository: `https://github.com/arinb44/portfolio` (`origin`), push only with approval.
- 2026-11-17: Phase 3 `plan.md` written (one milestone, M1).
- 2026-11-18: `plan.md` approved. Branch `project-lineup` created from `project-visuals`.
- 2026-11-18: M1 built (not yet committed):
  - Deleted `hearth.md`, `juno.md`, `src/assets/projects/hearth/`, `src/assets/projects/juno/` (10 PNGs).
  - `order`: NFL 1, MLB 2, NBA 3, Nightfall 4, FC 5; `featured: true` moved from FC to NFL.
  - Tests: `order.test.ts`, `site.spec.ts`, `home.spec.ts` updated (new order, 5 stops, NFL first; `#hearth` no-loop checks removed).
  - `npm test`: check 0 errors / 0 warnings, 9 pages built, unit 12/12, Playwright 40/40.
  - No `hearth` / `juno` left outside `output/` (`git grep`).
  - Browser (existing dev server on :4321): Home stops and `/projects/` rows read NFL, MLB, NBA, Nightfall, FC; NFL `01 / 05 · Featured` with its loop; `/projects/hearth/` and `/projects/juno/` 404.

## Next step
Ask to commit M1 on `project-lineup` ("Drop Hearth and Juno and lead with NFL"), then ask to push to `origin` (`arinb44/portfolio`), then write `summary.md` (Phase 5).

## Open questions
None.

**Last updated:** 2026-11-18
