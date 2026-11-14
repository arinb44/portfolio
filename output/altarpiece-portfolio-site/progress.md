# Progress: Altarpiece Portfolio Site

- **Current phase:** Phase 4, Milestone 1 (setup + content model)
- **Status:** waiting for user (approve the npm installs and the GitHub metadata read)

## Completed milestones
- 2026-11-14: Project root confirmed (`C:\Users\arins\Arin\School\Projects\Portfolio`); no earlier program-agent projects.
- 2026-11-14: Phase 1 interview: user accepted the suggested answers.
  - Goals: build `hybrid-spec.md` phases 1–7; the agent drafts project content, with placeholders for media.
  - Stack: the spec's (Astro, plain CSS, vanilla TS, raw WebGL2).
  - Focus: accessibility and budgets first, then fidelity, then simple code.
  - The research folder is read-only.

- 2026-11-14: Phase 2: `programAgent.md` and slug `altarpiece-portfolio-site` approved.

- 2026-11-14: Phase 3: `plan.md` approved with test option B (decision #3).
- 2026-11-14: M1, offline part:
  - Wrote the project setup files, the schema, 7 drafted project files, `order.ts` + test, the placeholder script and the README.
  - `npm run test:unit`: 6 passed, 0 failed.

- 2026-11-14: M1, online part:
  - Installed Astro 7.4.12 (Zod 4), the Fontsource fonts, TypeScript 6.0.3, `@astrojs/check`, Playwright 1.65 + axe, and Chromium.
  - Years filled from GitHub creation dates (2026; Nightfall 2024); MLB URL from the repo homepage.
  - Schema switched to `z.url()` (Zod 4).
  - 35 placeholder PNGs generated.
  - `astro sync`: passes. A blank alt fails with `layers.1.images.0.alt` (shown, then restored).
  - Unit tests: 6/6 pass.
  - `astro check`: 2 errors, both missing Node types in `tests/unit/order.test.ts`.

- 2026-11-14: Added `@types/node` (#5): `astro check` 0 errors, unit 6/6. `git init -b main`, local only (#6).

## Next step
Waiting for approval of the M1 commit: all files listed by `git status`, message "Set up Astro project and project content model". After the commit, check `git log -1 --format=%B` has no AI markers. Then start M2 (static skeleton) and ask D3 (name, tagline, email, About text).

## Open questions
- **Repository:** local only, branch `main`. Ask before any push.
- **D3 (M2):** display name, tagline, contact email and About text.

**Last updated:** 2026-11-14
