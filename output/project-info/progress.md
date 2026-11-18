# Progress: Project Info

- **Current phase:** Phase 4, M3 (MLB)
- **Status:** in progress (user away overnight; standing approval to commit and push, decision #11)

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
- 2026-11-18: M1 committed `da64fd6` and pushed to `origin/project-info` (approved).
- 2026-11-18: User gave standing approval to commit and push while away overnight (decision #11).
- 2026-11-18: M2 NFL done:
  - Text: role, hero, key features, architecture and origins rewritten from the README, `reports/results.json` and the notebooks.
  - Metric: 65.5% vs 53.7% always-home; Vegas 66.4% named (decision #12).
  - Images: dashboard This Week (1600×1000, `nfl-hero`), Full breakdown waterfall (`nfl-waterfall`), diagram `scripts/diagrams/nfl-predictor.html` (`nfl-architecture`), first notebook plot on white (decision #13).
  - `capture.mjs` gained `scale` and `prep` options; `scripts/diagrams/diagram.css` is shared by all diagrams.
  - `npm test`: check 0/0, 9 pages, unit 12/12, Playwright 41/41 (NFL no-TODO check included).

## Next step
M3 (MLB): capture the Render demo (wake it first; 30-60 s), put the two SHAP charts on white at 1200×800 (logistic = Key features, gradient boosting = Origins), build `scripts/diagrams/mlb-predictor.html`, write the text (metric 57.8% from the README results table), add `mlb-predictor` to `FINISHED`, test, commit and push.

## Open questions
- Nightfall gameplay video: file path (user supplies).

**Last updated:** 2026-11-18
