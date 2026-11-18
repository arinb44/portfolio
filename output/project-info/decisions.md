# Decisions: Project Info

| # | Date | Decision | Options offered | Answer |
|---|---|---|---|---|
| 1 | 2026-11-18 | Start new or extend `project-lineup` | New project; extend | New project, slug `project-info` |
| 2 | 2026-11-18 | Goals | Text and facts; real images; Nightfall video; publish (draft off) | Text and facts, real images, Nightfall video (draft flags stay on) |
| 3 | 2026-11-18 | Specialization | Astro content + writing; also page redesign | Astro content + writing |
| 4 | 2026-11-18 | Sources and priority | Repos + user, accuracy first; only from the user | Repos + user, accuracy first |
| 5 | 2026-11-18 | Roles | All solo; some not | All five solo |
| 6 | 2026-11-18 | Image sources | Captured demos + repo charts + HTML diagrams; user provides | Captured + repo charts + diagrams |
| 7 | 2026-11-18 | Nightfall media | Video, stills from it; video + stills; nothing yet | User supplies the video; stills pulled from it |
| 8 | 2026-11-18 | Where the video shows | Project page hero; a section below | Project page hero |
| 9 | 2026-11-18 | Repository / branch | `arinb44/portfolio`; local only | `arinb44/portfolio`, branch `project-info` from `project-lineup` |
| 10 | 2026-11-18 | Plan | Approve; change | Approved |
| 11 | 2026-11-18 | Commits and pushes | Ask each time | **Standing approval from the user:** "auto approve and push the commits" while they are away overnight. Decisions that would normally be asked are taken with the recommended option and logged here (marked *standing*) for review. |
| 12 | 2026-11-18 | *standing* NFL metric framing | Show 65.5% with both baselines; show no metric | Shown: **65.5%** winner accuracy vs 53.7% always-home, held-out 2019–2025 (1,954 games), with Vegas favourites' 66.4% named in the context so the model isn't oversold. Source: README "Holdout 2019–2025" table and `reports/results.json` (logistic, holdout 2019-25, accuracy 0.6546). |
| 13 | 2026-11-18 | *standing* NFL Origins image | Notebook plot; early commit | `notebooks/01_data_exploration.ipynb` cell 3 (home win rate by season), the only plot in the first notebook; the notebook has one commit (13e47fc, 2026-09-21). Placed on white at native size (834×556) because the PNG is transparent with dark text. |
| 14 | 2026-11-18 | Rename the bland predictor titles (user asked mid-M3; renamed before finishing MLB/NBA so diagrams, alt text and tests aren't redone) | Per project, 3 options drawn from its angle | **NFL → Fourth and Why**, **MLB → Full Count** (from a second round of baseball-phrase options), **NBA → Tip-Off**. Nightfall and Falling Constellations keep their names. Display `title` only: repo names, GitHub Pages URLs, slugs (`/projects/nfl-predictor/`) and the slug-keyed painted loops are unchanged. The one-liners keep naming the sport. |
| 15 | 2026-11-18 | Design-hook findings on the diagrams (kicker labels above headings) | Fix; suppress | Fixed: removed the project kicker and the DATA/FEATURES/MODEL/OUTPUT stage labels from both diagrams; recaptured. |
| 16 | 2026-11-18 | *standing* MLB stack line | Keep `LightGBM`, `pybaseball`; match the code | `LightGBM` is in `requirements.txt` but never imported in `src/` or `scripts/`, so it is dropped; the demo's FastAPI and Docker are added. |
