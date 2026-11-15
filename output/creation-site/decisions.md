# Decisions: Creation Site

| # | Date | Decision | User's answer |
|---|---|---|---|
| 1 | 2026-11-14 | Project root | The worktree (`.claude/worktrees/website-design-overhaul-45e304`) |
| 2 | 2026-11-14 | Start or resume | New project; `altarpiece-portfolio-site` is left as a record |
| 3 | 2026-11-14 | Goals | Whole site: Creation home page, altarpiece removed, other pages restyled |
| 4 | 2026-11-14 | Stack | Keep: Astro, plain CSS, vanilla JS/TS, raw WebGL2 |
| 5 | 2026-11-14 | Focus | Fidelity first, then accessibility, then simple code; other agents' `output/` and project content text untouched |
| 6 | 2026-11-14 | Slug and agent file | `creation-site`; `programAgent.md` approved |
| 7 | 2026-11-14 | Plan | Approved, including the deletion list (D6) |
| 8 | 2026-11-14 | D1 + D2 fonts and installs | Fontsource packages; `npm install` approved; Garamond packages removed |
| 9 | 2026-11-14 | D5 project page wording | Plain headings, no layer / varnish labels |
| 10 | 2026-11-14 | D3 repository | A GitHub repository (URL not given yet; ask before the first commit) |
| 11 | 2026-11-14 | Implementation notes (agent, within the plan; reported) | Shared `Head.astro` instead of a `home` flag on Base; home-only altarpiece components deleted in M1 instead of M2; Playwright uses the real GPU; skip link wired before the scene loads; no-JS shows the finished page |
| 12 | 2026-11-14 | D3 repository URL | `https://github.com/arinb44/portfolio` |
