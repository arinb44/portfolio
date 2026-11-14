# Decision Log

| # | Date | Decision | Options considered | User's answer |
|---|---|---|---|---|
| 1 | 2026-11-14 | Setup interview answers | Suggested answers (phases 1–7; the spec's stack; accessibility and budgets first); write own | Suggested answers accepted |
| 2 | 2026-11-14 | Agent definition and slug | Approve; change | Approved; slug `altarpiece-portfolio-site` |
| 3 | 2026-11-14 | Plan + D1 browser testing | A: no browser test library, hand checks in the built-in browser; B: Playwright + axe (recommended); C: Vitest + Playwright | Plan approved with B |
| 4 | 2026-11-14 | Network: npm installs + reading GitHub repo metadata | Both; installs only | Both. Years = repo creation year (2026; Nightfall 2024); MLB URL from the repo homepage |
| 5 | 2026-11-14 | Node types for the unit tests (`astro check` failed without them) | Add `@types/node` (recommended); exclude tests from type checking | Add `@types/node` (dev only) |
| 6 | 2026-11-14 | D2: repository | Local only for now; new GitHub repo; existing URL | Local only: `git init -b main`, nothing pushed. Ask again before any push. |
| 11 | 2026-11-14 | Body font after the Cormorant preload: EB Garamond `swap` reflowed home during the arrival (CLS 0.0052) | EB optional too (recommended); keep swap and accept 0.005; drop the Cormorant preload | EB Garamond `optional` too. All 4 faces are own `@font-face` rules over the Fontsource files. CLS 0 at 150/400 ms latency and 150–400 KB/s. |
| 10 | 2026-11-14 | Cormorant (arrival name) font loading | Optional + preload (recommended); optional without preload; swap as spec | Optional + preload. Deviates from spec 6.2 "preload only EB Garamond Regular" (+23 KB on every page). |
| 9 | 2026-11-14 | Implementation notes, M4 (reported to the user) | n/a | (a) "Ink as the arrival background" became an ink plaque behind the name; a full ink page would hide the header's Index link. (b) Cormorant uses `font-display: optional` (own `@font-face`), because `swap` shifted the inscription (CLS 0.0094 on slow networks). (c) The gold texture is preloaded on `/` and re-exported at 26 KiB: it's the phone LCP image. (d) Playwright uses port 4329 with no server reuse: the app's dev server holds 4321. (e) Wing backs load lazily and exist only when the arrival will swing. |
| 8 | 2026-11-14 | D4 CC0 museum images; D5 M5 hover preview; GitHub | D4: download (recommended) or CSS stand-ins. D5: skip (recommended) or build. | D4: download, listing each file first. D5: skip. GitHub: decide later; stay local. |
| 7 | 2026-11-14 | Implementation notes, M1–M2 (reported to the user; no objection) | n/a | (a) Added a per-layer `text` field: the spec's schema had nowhere for the 3.4 layer descriptions. (b) Index rows: featured first, then predella order. Wireframe 05 draws NBA before NFL; I used one order everywhere. (c) Edge wings and the bottom bar are both real links, as spec 8.1 says. |
