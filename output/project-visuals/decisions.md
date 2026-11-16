# Decisions: Project Visuals

| # | Date | Decision | User's answer |
|---|---|---|---|
| 1 | 2026-11-15 | Project root | `C:\Users\arins\Arin\School\Projects\Portfolio` (the portfolio) |
| 2 | 2026-11-15 | Resume or new | New project (not Fresco Intro or Creation Redesign) |
| 3 | 2026-11-15 | Goals | NBA predictor video first, then the other projects' visuals |
| 4 | 2026-11-15 | Specialization | Motion + visual design, in the Night Sky palette and fonts |
| 5 | 2026-11-15 | Reference video | An NBA broadcast clip |
| 6 | 2026-11-15 | Rights of the broadcast footage (risk explained: owned by the NBA / broadcasters) | "Use it, my call": published on the site; the user accepts the risk |
| 7 | 2026-11-15 | Method | Own local renderer only; nothing uploaded to an outside service |
| 8 | 2026-11-15 | How the clip arrives | The user saves it to the git-ignored `art-src/` |
| 9 | 2026-11-15 | Loop length | 6–10 s |
| 10 | 2026-11-15 | Deliverables | Video (WebM + MP4) + poster, browser preview, written design spec, Figma file |
| 11 | 2026-11-15 | Setup summary and slug | Confirmed; slug `project-visuals` |
| 12 | 2026-11-15 | `designAgent.md` (incl. the mood keywords and things to avoid as written) | Approved; the Figma file location is still open |
| 13 | 2026-11-15 | `plan.md` | Approved |
| 14 | 2026-11-16 | M0: loop segment (A whole 9.04 s / B to the make 8.42 s / C handles 6.54 s) | B · To the make: frames 0–201 of the 24 fps master; the loop restarts on the cut after the make, so no cross-fade is needed (replaces the plan's ~0.5 s cross-fade) |
| 15 | 2026-11-16 | M0: framing behind the card | Reframe right x1.36 from the left edge (baked into the video) |
| 16 | 2026-11-16 | M0: in-arena branding (Pechanga, Tissot, Toyota, shot clock) | Let the paint soften it; revisit only if a logo still reads after M1 |
| 17 | 2026-11-16 | M1: direction (A Buon fresco / B Sinopia / C Grisaille / combination) | A · Buon fresco |
| 18 | 2026-11-16 | M1: the Pechanga stanchion logo and shot-clock digits still read (revisits #16) | Soften them more: flatten just those areas into plain paint so no letters read |
| 19 | 2026-11-16 | Figma location | A new "Project visuals" file in the user's team (drafts) |
| 20 | 2026-11-16 | M2 round 1: colour (user: "give it a little color") | More colour: the footage's own hue kept at 95% (was 55%) and the fresco ramp's saturation x1.3; tested against 0.85 / x1.2 (barely visible) and 1.1 / x1.4. Shown to the user for more or less |
| 21 | 2026-11-16 | Round 1: plaster grain baked into the video, or a separate still overlay | Overlay: grain-free WebM + `plaster.webp` with mix-blend-mode: multiply (2.9 MB total); the poster keeps the grain baked in |
| 22 | 2026-11-16 | Round 1: pause control (WCAG 2.2.2) | Corner pill: ink pill bottom-right, "Pause / Play the background video" |
| 23 | 2026-11-16 | Round 1: poster frame | Frame 150, the step-back jumper |
| 24 | 2026-11-16 | Round 1: colour (footage hue 0.95, ramp x1.3) | "A bit more": round 2 tries footage hue 1.1, ramp saturation x1.45 |
| 25 | 2026-11-16 | M2: approve the NBA loop (round 2) | Approved |
| 26 | 2026-11-16 | M3: put the loop into the site | Yes, as proposed: files to `public/projects/nba-predictor/` (loop.webm, loop.mp4, plaster.webp, poster.webp); the home page plays a project's loop when that folder has one; `varnish.png` untouched; tests updated; npm test |
| 27 | 2026-11-16 | M3: the loop on the NBA project page too? | Home page only (the project page leads with the dashboard) |
| 28 | 2026-11-16 | GitHub repository for commits | origin: https://github.com/arinb44/portfolio; push only with approval |
| 29 | 2026-11-16 | Branch | New branch `project-visuals` from `fresco-intro` (at 09732e8) |
| 30 | 2026-11-16 | Commit the NBA loop | Commit as proposed on `project-visuals`; rebuildable renders, frame dumps, analysis contact sheets and unpainted footage stills stay out via .gitignore |
