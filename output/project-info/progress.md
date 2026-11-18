# Progress: Project Info

- **Current phase:** Phase 4, M6 (Nightfall)
- **Status:** waiting for user (M6 needs the Nightfall video and answers about the game); standing approval to commit and push, decision #11

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
- 2026-11-18: M2 committed `cf90a62` and pushed.
- 2026-11-18: User asked to rename the bland titles first (decision #14): NFL → Fourth and Why, MLB → Full Count, NBA → Tip-Off; display titles only. Diagram kicker labels removed after a design-hook finding (#15). Committed `2a600cc` and pushed. `npm test` 41/41.
- 2026-11-18: M3 Full Count (MLB) done: text from the README (results, pitcher-embedding lesson, pinned versions); metric 57.8% (#17); images: demo prediction card (JPEG), two SHAP charts, diagram `scripts/diagrams/mlb-predictor.html` (#18). Stack corrected (#16). `npm test`: check 0/0, 9 pages, unit 12/12, Playwright 42/42.
- 2026-11-18: M3 committed `dde3955` and pushed.
- 2026-11-18: M4 Tip-Off (NBA) done: text from the README, `train_model.py` and the refresh workflow; images: daily slate, Any matchup, diagram `scripts/diagrams/nba-predictor.html`, original tracker dashboard (#19). `npm test`: check 0/0, 9 pages, unit 12/12, Playwright 43/43.
- 2026-11-18: M4 committed `a5b5287` and pushed.
- 2026-11-18: M5 Falling Constellations done: text from HANDOFF.md, `src/` and the research report; images: live piece, core close-up, diagram `scripts/diagrams/falling-constellations.html`, the 528f5d5 prototype rendered locally (#20, #21). `npm test`: check 0/0, 9 pages, unit 12/12, Playwright 44/44.
- Noticed (out of scope, site styling): at ~800 px wide the project page h1 breaks "Falling Constellations" mid-word.

## Next step
M6 Nightfall, blocked on the user: (1) the gameplay video file (path), (2) what the player does and the goal, (3) what they built themselves vs. assets (models, textures, sounds), (4) the Godot version and when/why it was made. Then: ffmpeg to `public/projects/nightfall/gameplay.{webm,mp4}` + 4 stills + poster; video hero in `[slug].astro` (muted, loop, playsinline, controls, poster; no autoplay under reduced motion); text; tests; commit; push. Then Phase 5 `summary.md`.

## Open questions
- Nightfall: video file path; gameplay, goal, what was self-made vs. assets, Godot version, when/why it was made.

**Last updated:** 2026-11-18
