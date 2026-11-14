# Decision Log

| # | Date | Decision | Options considered | User's answer |
|---|---|---|---|---|
| 1 | 2026-11-14 | Setup interview answers | Suggested answers (phases 1–7; the spec's stack; accessibility and budgets first); write own | Suggested answers accepted |
| 2 | 2026-11-14 | Agent definition and slug | Approve; change | Approved; slug `altarpiece-portfolio-site` |
| 3 | 2026-11-14 | Plan + D1 browser testing | A: no browser test library, hand checks in the built-in browser; B: Playwright + axe (recommended); C: Vitest + Playwright | Plan approved with B |
| 4 | 2026-11-14 | Network: npm installs + reading GitHub repo metadata | Both; installs only | Both. Years = repo creation year (2026; Nightfall 2024); MLB URL from the repo homepage |
| 5 | 2026-11-14 | Node types for the unit tests (`astro check` failed without them) | Add `@types/node` (recommended); exclude tests from type checking | Add `@types/node` (dev only) |
| 6 | 2026-11-14 | D2: repository | Local only for now; new GitHub repo; existing URL | Local only: `git init -b main`, nothing pushed. Ask again before any push. |
