# Decisions: nightfall-escape

| # | Date | Decision | Options | Chosen | By |
|---|---|---|---|---|---|
| 1 | 2026-11-18 | Project | resume Stalked / new | New project, `nightfall-escape` | user |
| 2 | 2026-11-18 | Brief | | 25 s companion to Stalked, MP4 with sound, first person, running, shaking camera, look-backs, trip then cut to black, no music | user |
| 3 | 2026-11-18 | Added detail | ground clutter / fallen trees to dodge / moving mist and debris / agent's call | Ground clutter + moving mist and debris (needles and dust, no snow) | user |
| 4 | 2026-11-18 | Wendigo visibility | glimpses then beam / glimpses only / clear and closing | Glimpses only, never lit by the beam | user |
| 5 | 2026-11-18 | Quality | 128 spp (~2.5-3 h) / 64 spp (~1.5 h) | 128 spp, same as Stalked | user |
| 6 | 2026-11-18 | Run mode | live MCP / background | Background only ("I don't need to work on it") | user |
| 7 | 2026-11-18 | Base file | from scratch / Stalked's packed final | Stalked's packed final, read-only, saved as a new version | user (confirmed summary) |
| 8 | 2026-11-18 | Sound over black | silent cut / ~1 s of sound into the black | ~1 s of sound into the black | user (confirmed summary) |
| 9 | 2026-11-18 | Delegation | | User is asleep: "make any decisions you see fit", and push the commits. Agent definition and plan treated as approved; milestones reviewed by the agent and logged here | user |
| 10 | 2026-11-18 | Git target | | `origin` = https://github.com/arinb44/portfolio (the only remote, used by Stalked), new branch `nightfall-escape` from `project-info` HEAD. Commits are built with a separate index so the user's checkout stays on `project-info` with its uncommitted work untouched. Scripts and docs only | agent (delegated) |
| 11 | 2026-11-18 | M1 path and forest | | Accepted: 92 m weaving path away from the wendigo (bearing 126), forest extended with Stalked's rules, lane and look-back sight lines kept clear | agent (delegated) |
| 12 | 2026-11-18 | M2 clutter and mist | | Accepted. Roots made shorter, half buried and darker after the first test (they read as pipes). Mist 0.15/m; biased volume rendering (mist cost 7.9 -> 5.9 s on a test still) | agent (delegated) |
| 13 | 2026-11-18 | Flashlight while running | spill 120 (Stalked) / 350 / 700 | 350: trunks and ferns beside the lane show; 700 washed the fog. The beam is aimed lower (-13 deg) with a wider arm swing, so the ground ahead is lit | agent (delegated) |
| 14 | 2026-11-18 | The fall | flashlight thrown ahead / kept in hand | Kept in hand until the impact so the ground rushing up is lit; ends lying beside a fern with the beam along the floor, then black. The thrown version ended on near-black frames | agent (delegated) |
| 15 | 2026-11-18 | Sound design | | Demonic scream at the start (front right, reverb); dirt footsteps + synthesized thump per stride; panting synthesized from shaped noise, in time with the stride; whooshes on the head turns; wendigo steps from the monster-footstep file, placed by real distance and direction; collapse-in-grass + thump on the impact; the echo scream over the black, cut off at frame 590, then silence | agent (delegated) |
