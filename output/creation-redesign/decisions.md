# Decisions: Creation Redesign

| # | Date | Decision | User's answer |
|---|---|---|---|
| 1 | 2026-11-14 | Project root | This worktree (`.claude/worktrees/website-design-overhaul-45e304`), not the main checkout |
| 2 | 2026-11-14 | Concept | Recreate God from *The Creation of Adam* in nodes; the camera pans down the arm as it assembles; projects at the fingertip. Memorable over safe. |
| 3 | 2026-11-14 | Fingertip, Adam, looks, frequency | All 7 projects take turns at the fingertip; the visitor's cursor is Adam; show both looks (night sky, fresco plaster); on every visit |
| 4 | 2026-11-14 | Motion model | Scroll drives everything (nothing plays by itself) |
| 5 | 2026-11-14 | What survives | Keep the pigment palette; drop the Garamond fonts |
| 6 | 2026-11-14 | Deliverables | Browser prototypes + Figma / Paper boards; no build into the Astro source; no tokens/spec deliverable |
| 7 | 2026-11-14 | Guardrails | User had no preference; the proposed set was confirmed in the summary: AA contrast, reduced-motion version, name readable at load, keyboard and touch access (no Skip intro needed) |
| 8 | 2026-11-14 | Phones | Touch-and-drag toward God's finger plays Adam |
| 9 | 2026-11-14 | Scope and slug | Home page first; other pages later. Slug `creation-redesign` |
| 10 | 2026-11-14 | Plan | `plan.md` approved as recommended |
| 11 | 2026-11-14 | D1 board tool | Figma |
| 12 | 2026-11-14 | D2 fonts in prototypes | Load OFL fonts from Google Fonts; nothing installed |
| 13 | 2026-11-14 | M1 scene content | God + mantle (cherubs left out of the node figure) |
| 14 | 2026-11-14 | Rendering (after M1 review) | No nodes: they can't show the fine detail. Rebuild the painting itself from particles that roll into place as the mouse moves toward the center |
| 15 | 2026-11-14 | Particle image | God + mantle (no cherubs, no Adam); the cursor still plays Adam |
| 16 | 2026-11-14 | "Center" | God's fingertip: the closer the cursor, the more assembled; reaching it completes the image and sparks the project |
| 17 | 2026-11-14 | Scroll's role | Scroll pans the camera along the arm and steps through the 7 projects (replaces #4's scroll-driven assembly) |
| 18 | 2026-11-14 | No mouse | Phones: touch-drag toward the fingertip assembles, tap opens. Keyboard and reduced motion: image already assembled |
| 19 | 2026-11-14 | Amendment 1 + D3 | Amendment 1 approved; download the 3524 px Wikimedia Commons original (public domain) to git-ignored `art-src/` |
| 20 | 2026-11-14 | Camera | Zoomed in, the camera follows the arm's path as it assembles, and zooms out once the project is revealed (cursor-driven; supersedes the scroll pan in #17) |
| 21 | 2026-11-14 | Phones and tablets | Not supported: show a notice that a computer is required (replaces #8 and the phone half of #18; M4 drops the phone work) |
| 22 | 2026-11-14 | M1b approved; particle image | M1b (round 2, camera follows the arm) approved. Rebuild the whole group (God, mantle, cherubs, lower angel) instead of God + mantle: replaces #15 |
| 23 | 2026-11-14 | 7 projects after the reveal | Scroll steps through the projects while the painting holds (arrow keys / next button too), small spark at the fingertip each step; replaces the rest of #17 |
| 24 | 2026-11-14 | Direction | A, Night Sky (M2 choice); refine in iterations/round-n |
| 25 | 2026-11-14 | Type (round 1) | Pairing 2, Atlas: Gloock (display), Newsreader (body), IBM Plex Mono (labels) |
| 26 | 2026-11-14 | M3 | Round 2 approved as the final design (Night Sky, Atlas type); go to M4 checks and M5 final delivery |
| 27 | 2026-11-14 | M4 fixes (agent, within the approved plan) | `main` landmark always present (axe); reading layout at <= 900 px wide or <= 560 px tall (200-400% zoom) so nothing overlaps; reported to the user |
| 28 | 2026-11-14 | Repository | Local only: commit on this worktree's branch, no push |
