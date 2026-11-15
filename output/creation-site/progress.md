# Progress: Creation Site

- **Current phase:** Phase 5 (summary)
- **Status:** complete; waiting for any revision requests

## Completed milestones
- 2026-11-14: Project root confirmed: this worktree (`.claude/worktrees/website-design-overhaul-45e304`, branch `claude/website-design-overhaul-45e304`). New project chosen over resuming `altarpiece-portfolio-site`.
- 2026-11-14: Phase 1 interview confirmed; slug `creation-site`.
  - Goals: whole site (Creation home page, altarpiece removed, other pages restyled in Night Sky / Atlas).
  - Stack: Astro, plain CSS, vanilla JS/TS, raw WebGL2.
  - Focus: fidelity, then accessibility, then simple code. Other agents' `output/` folders and project content text are not touched.

- 2026-11-14: Phase 2 `programAgent.md` approved; Phase 3 `plan.md` approved (decisions #7-#10).
- 2026-11-14: M1 built (not yet committed):
  - `npm install`; fonts swapped to `@fontsource/gloock`, `@fontsource-variable/newsreader`, `@fontsource/ibm-plex-mono`.
  - `src/scripts/creation.js` (prototype engine, only the data path changed), `src/scripts/home.js`, `src/styles/creation.css`, `public/creation/`, new `src/pages/index.astro`, `src/components/Head.astro` (shared `<head>`; used instead of a `home` flag on Base, decision #11).
  - Deleted (approved list): arrival script, CSS and tests; the home-only components Altarpiece, MainPanel, Predella, PredellaScene, Wing (moved forward from M2 because nothing uses them any more).
  - Fixes beyond the prototype: the skip link works even if pressed before the scene has loaded; without JavaScript the page shows the still painting and all 7 projects; the ring is hidden when there is no scene.
  - Playwright now runs on the real GPU (`channel: 'chromium'`, `--use-angle=d3d11`); software GL was too slow for the particles.
  - `npm test`: check 0 errors, 11 pages built, unit 18/18, Playwright 37/37.
  - GPU cursor journey at 1440 x 900: reveal fires, 2 wheel steps reach project 3, no console errors; the revealed frame matches `final/shots/final-6-revealed.png`.

- 2026-11-14: Repository `https://github.com/arinb44/portfolio` (decision #12); remote `origin` added with approval. **M1 committed** as `c615a41` and pushed to `origin/claude/website-design-overhaul-45e304` (approved; no AI markers). The remote's own `main` (f86fe95) is unrelated history and was not touched.
- 2026-11-14: M2 built (not yet committed):
  - `tokens.css` reduced to the Night Sky tokens; `global.css` rewritten for the other pages; `contrast-pairs.ts` now 5 pairs.
  - Header (name + Projects, About, CV, Email), footer (GitHub, Credits), project page (plain headings, no layer labels, plain `<Picture>`), projects index ("Projects"), About (new credits), 404 ("Page not found"), new favicon (gold ring).
  - Deleted: `SfumatoPicture.astro`, `src/assets/art/`, `scripts/art.mjs`, the image-load script and `edges` in `Base.astro`.
  - Left as is: the content schema's `predella` image field and the layer names `varnish / paint / underpainting / underdrawing` (content files are out of scope); they are no longer shown anywhere.
  - `npm test`: check 0 errors, 11 pages built, unit 12/12, Playwright 36/36. Screenshots of project page (desktop + 390 px), index, About and 404 reviewed.

- 2026-11-14: **M2 committed** as `7935ca7` and pushed (approved; no AI markers).
- 2026-11-14: M3 done (not yet committed): `README.md` rewritten; Lighthouse: `/` desktop 83 / 100 (LCP 0.2 s, CLS 0, TBT 390 ms, 782 KiB), `/projects/nba-predictor/` mobile 100 / 100 (219 KiB); `summary.md` written. Final `npm test`: check 0 errors, 11 pages, unit 12/12, Playwright 36/36.

- 2026-11-14: **M3 committed** ("Update the README and add the implementation summary") and pushed (approved; no AI markers).

## Next step
Ask the user for revisions. Open follow-ups are in `summary.md` section 8 (remote `main` has unrelated history; placeholders; schema names).

## Open questions
- **Repository:** `https://github.com/arinb44/portfolio` (decision #12). It already has a `main` (f86fe95) that is not in the local history. Remote not added yet; ask before adding and before each push.
- Placeholders in `src/site.ts` (name, tagline, email) and the About text.

**Last updated:** 2026-11-14
