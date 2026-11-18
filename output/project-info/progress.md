# Progress: Project Info

- **Current phase:** Phase 4, M1 (capture tooling)
- **Status:** waiting for user (approve the M1 commit)

## Completed milestones
- 2026-11-18: Project root confirmed earlier this session (`C:\Users\arins\Arin\School\Projects\Portfolio`). New project chosen over extending `project-lineup`.
- 2026-11-18: Phase 1 interview confirmed; slug `project-info`.
  - Goals: text and facts (all TODOs, check drafts against repos, metrics only where backed); real images (demo screenshots via Playwright, repo charts, HTML-built diagrams; Nightfall stills from its video via ffmpeg); Nightfall video in the project page hero.
  - Not in goals: turning `draft` off.
  - Stack: Astro content + writing, no new dependencies.
  - Focus: accuracy first. Facts come from the repos (read-only blobless clones in the scratchpad) and the user. All five projects are solo.
- Repo survey (2026-11-18): every commit in all five repos is the user's (plus a data-refresh bot on NBA). `gh` is not installed. ffmpeg 9.0.2 and Pillow 13 are available. The `predella` and `video` fields are not rendered anywhere.
- 2026-11-18: Phase 2 `programAgent.md` approved; repository `https://github.com/arinb44/portfolio` (`origin`), push only with approval.
- 2026-11-18: Phase 3 `plan.md` written (M1 tooling, M2 NFL, M3 MLB, M4 NBA, M5 FC, M6 Nightfall).
- 2026-11-18: `plan.md` approved. Branch `project-info` created from `project-lineup`.
- 2026-11-18: M1 built (not yet committed):
  - `scripts/capture.mjs` (Playwright, real GPU, a named-shot map, empty for now) and the `capture` npm script.
  - `site.spec.ts`: a `FINISHED` list (empty), with one test per listed slug that fails on "TODO" / "placeholder" in the page text or any alt. Proven by a temporary run with `nfl-predictor`, which failed as expected, then reverted.
  - `npm test`: check 0 errors / 0 warnings, 9 pages, unit 12/12, Playwright 40/40.
- 2026-11-18: M2 research started (read-only):
  - NFL holdout 2019–25 (1,954 games): logistic (final) 65.5% accuracy; Vegas 66.4%; always-home 53.7% (README table, `reports/results.json`).
  - Origins candidate: `notebooks/01_data_exploration.ipynb` cell 3 plot (games and home-field advantage by season); first commits all 2026-09-21.

## Next step
Commit M1 ("Add a capture script for project images") with approval and ask to push; then M2 (NFL): capture the live dashboard (This Week tab + a Full breakdown waterfall), build the architecture diagram, extract the notebook plot, write the text, and agree the metric framing with the user.

## Open questions
- Nightfall gameplay video: file path (user supplies).

**Last updated:** 2026-11-18
