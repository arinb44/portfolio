# Decisions: Fresco Intro

| # | Date | Decision | User's answer |
|---|---|---|---|
| 1 | 2026-11-14 | Project root | `C:\Users\arins\Arin\School\Projects\Portfolio` (main checkout) |
| 2 | 2026-11-14 | Resume Creation Redesign or start a new project | New project |
| 3 | 2026-11-14 | Goals, specialization, focus | The suggested answers: full original fresco fades in from particles, camera lands on the gap between the fingers, one soft flash, then the current home page; plays by itself (~6–8 s) every visit with "Skip intro"; reduced motion = still fresco; rest of the site unchanged |
| 4 | 2026-11-14 | Deliverables | HTML/CSS/WebGL2 prototype, design spec, web-sized full fresco image; no Figma, no new tokens |
| 5 | 2026-11-14 | Slug and branch | `fresco-intro` for both; branch cut from `main` at `4871a92` |
| 6 | 2026-11-14 | Approve `designAgent.md` | Approved as written |
| 7 | 2026-11-15 | Approve `plan.md` | Approved as written |
| 8 | 2026-11-15 | D1: intro direction | A, Starlight (as built in M1; no elements from B or C) |
| 9 | 2026-11-15 | D2: landing zoom | Zoom 2 (both hands and wrists; 2 screen px per source px) |
| 10 | 2026-11-15 | D3: fresco image | 3524 px WebP, q80, 820 KiB |
| 11 | 2026-11-15 | D4: header during the intro | Readable over the night sky at the start, fades out as the painting fills the screen, returns at the handover |
| 12 | 2026-11-15 | Approve M2 round 1 (Starlight) | Approved as final design |
| 13 | 2026-11-15 | Replay rule (plan Open Question 1) | Once per browser tab (sessionStorage); coming back from a project page goes straight to the home page |
| 14 | 2026-11-15 | D5: reading layout (200–400% zoom, ≤ 900 px wide or ≤ 560 px tall) | Skip the intro there |
| 15 | 2026-11-15 | D6: source-tree path for the fresco image | `public/creation/fresco.webp` (copied from `final/fresco.webp`) |
| 16 | 2026-11-15 | GitHub repository for commits on `fresco-intro` | `https://github.com/arinb44/portfolio` (remote `origin`); raw measurement captures (`bg-*`, `land-*`, 42 MB) left out of the commit |
| 17 | 2026-11-15 | What changes in the project showcase | The intro leads straight to the projects: no ring or cursor step; after the flash the camera pulls back and the full fresco settles beside the project cards |
| 18 | 2026-11-15 | Formation and zoom together: timing | Shorter: both 0.2–4.0 s, flash at ~4.2 s, projects at ~5.5 s |
| 19 | 2026-11-15 | Approve Amendment 1 (intro leads to the showcase) | Approved as written |
| 20 | 2026-11-15 | After the flash (revises #17) | The fresco is gone; the projects' own visuals show |
| 21 | 2026-11-15 | Particles | Removed; the fresco acts as a window the viewer enters |
| 22 | 2026-11-15 | Each project's visual | Its main image (the `varnish` image; placeholders until real screenshots are added) |
| 23 | 2026-11-15 | Visual layout | Full screen behind the card; a dark gradient on the left keeps the card readable |
| 24 | 2026-11-15 | The window | The gap opens into a soft-edged window showing the first project; the camera passes through; the flash marks the threshold |
| 25 | 2026-11-15 | How the fresco first appears | On screen from the first frame; the camera starts moving in straight away |
| 26 | 2026-11-15 | Approve Amendment 2 (the fresco is a window into the projects) | Approved as written |
| 27 | 2026-11-15 | Approve round 3 (the window) | Approved as the final design |
