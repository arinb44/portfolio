# Progress: Creation Site

- **Current phase:** Phase 4, Milestone 1 (home page)
- **Status:** waiting for user (approve `git remote add`, then commit M1)

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

## Next step
Add the remote and commit M1, each with approval; ask before pushing. Then M2: rewrite `global.css` in Night Sky, restyle Header / Footer / project pages / index / About / 404 with plain headings, delete `SfumatoPicture.astro`, `src/assets/art/`, `scripts/art.mjs`, the image-load script in `Base.astro` and the old tokens; update `site.spec.ts` and `contrast-pairs.ts`.

## Open questions
- **Repository:** `https://github.com/arinb44/portfolio` (decision #12). It already has a `main` (f86fe95) that is not in the local history. Remote not added yet; ask before adding and before each push.
- Placeholders in `src/site.ts` (name, tagline, email) and the About text.

**Last updated:** 2026-11-14
