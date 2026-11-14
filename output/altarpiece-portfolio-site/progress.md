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

- 2026-11-14: **M1 committed** as `062a6f4` (no AI markers).
- 2026-11-14: M2 static skeleton built:
  - Base layout, Header, Footer, home altarpiece (open), predella, Index table, 7 project pages, About, 404, placeholder CV.
  - `npm test`: check 0/0, 11 pages built, unit 6/6, Playwright 28/28.
  - Fixes found by the tests and screenshots: the 320 px overflow from the visually hidden "(featured)" text; the predella below the fold on desktop.

- 2026-11-14: **M2 committed** as `68bfb80` (no AI markers).
- 2026-11-14: First Lighthouse mobile run (`npx lighthouse`, Playwright's Chromium, local preview):
  - `/`: score 100, LCP 1.2 s, CLS 0, TBT 30 ms, 41 KiB, 0 KiB JS.
  - `/projects/nba-predictor/`: score 100, LCP 0.8 s, CLS 0, 49 KiB.
  - Placeholder images, no fonts yet; re-measure in M3 and M9.
- Uncommitted: `.gitattributes` (`*.pdf binary`, so autocrlf can't alter the PDF). Goes into the next commit.

- 2026-11-14: D4 download / D5 skip / GitHub later (decision #8).
  - Downloaded 20 Met previews (scratchpad only) and 3 originals (8.2 MB, git-ignored `art-src/`): DT11783, LC-1975_1_010_001, DP-46759-013.
  - `scripts/art.mjs` crops them into `src/assets/art/` (~270 KiB in total).
- 2026-11-14: M3 visual system built:
  - Fontsource EB/Cormorant (Latin, EB Regular preloaded), motion tokens, gold-leaf frame, craquelure SVG, M4 glint, M13 `SfumatoPicture`.
  - Joseph on the Contact wing; grisaille wings and credits on About.
  - Contrast unit test reads `tokens.css`.
  - `npm test`: check 0/0, 11 pages built, unit 17/17, Playwright 32/32. `contrast_check.py`: 12 PASS, 0 FAIL.
  - Bug found by a test and fixed: image `load` events don't reach `window`; the listener moved to `document`.
  - Lighthouse mobile: home 99 (LCP 2.1 s, 192 KiB), NBA 100 (LCP 1.7 s), About 100 (LCP 0.8 s); CLS 0 and 0 KiB JS everywhere.
  - Home LCP element = the altarpiece's gold CSS background. Re-check in M4; preload it if it's still the LCP.

- 2026-11-14: **M3 committed** as `c2c82e0`.
- 2026-11-14: M4 arrival built:
  - `src/scripts/arrival.js` (inlined on `/` only, unit-tested from the same file), `src/styles/arrival.css`.
  - Wing front/back faces, exterior inscription + Skip intro, glaze veil; reduced motion = 150 ms fade; phone `rotateX`.
  - `npm test`: check 0/0, 11 pages built, unit 27/27, Playwright 44/44; `arrival.spec.ts` stable over 5 repeats (60/60).
  - Lighthouse home (first visit, arrival playing): LCP 2.0–2.3 s, CLS 0, 228 KiB, 0 KiB external JS. TBT 0 ms in one run, 560 ms in another (machine noise?).
  - NBA page: LCP 1.7 s.
  - Implementation notes: decision #9.

- 2026-11-14: Fonts finalised (decisions #10, #11): all 4 faces `optional`, EB Regular and Cormorant 600 preloaded.
  - Throttled first-visit CLS: 0.
  - `npm test`: check 0/0, unit 27/27, Playwright 44/44; arrival 60/60 over 5 repeats.
  - Lighthouse: home 98 (LCP 2.28 s, CLS 0, TBT 0, 228 KiB); NBA 100 (LCP 1.59 s).
- 2026-11-14: **M4 committed** (see `git log`).

## Next step
Ask the user to start M5, page transitions: `<ClientRouter />`, M6 morph, M7 fold. Check that the head inline scripts (arrival, image-load listener) still work after client-side navigation. D3 (name, tagline, email, About) can arrive any time.

## Open questions
- **Repository:** local only, branch `main`. Ask before any push.
- **D3 (M2):** display name, tagline, contact email and About text.

**Last updated:** 2026-11-14
