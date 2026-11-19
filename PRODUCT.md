# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Internship recruiters and hiring managers** (software, ML and data roles), usually skimming between applications on a laptop, deciding in a minute or two whether Arin is worth an interview.
- **Peers and professors** (Michigan Edge members, classmates, faculty) looking at the work itself.

## Product Purpose
The personal portfolio of Arin Barman, a computer science student at the University of Michigan (BSE, expected May 2028). It shows five projects so a visitor can judge the work quickly and then reach Arin. Success means interviews: a visitor finishes convinced enough to email Arin or move the application forward.

## Positioning
Honest, shipped engineering with an artist's eye, from the same person. Every project is live or demonstrable, keeps itself current, and reports real accuracy against honest baselines (never a flattering number without its context); and the same person makes the games, renders and generative art.

## Operating Context
- Desktop-first: the home page is computer-only (a fresco intro and painted video loops); the other pages must work down to 320 px.
- Recruiters arrive from a resume or application link, often straight to the home page or a project page.
- Each project page links to a live demo (some sleep and take 30–67 s to wake) and the GitHub repo.

## Capabilities and Constraints
- Astro static site; content in `src/content/projects/*.md` with a fixed schema (hero, metric, role, stack, links, then Key features and results, Architecture, Origins, each with text and an image).
- Projects, in order: Fourth and Why (NFL), Full Count (MLB), Tip-Off (NBA), Nightfall (Godot game), Falling Constellations (generative art). NFL is featured.
- WCAG 2.2 AA (axe in the test suite), no sideways scroll at 320 px, reduced-motion respected, keyboard order tested.
- No deployment or host is set up yet (undecided).

## Brand Commitments
- Name: Arin Barman. Email: barmanar@umich.edu. CV: `public/cv.pdf`.
- Voice: plain, factual, first person on About; numbers always with their baseline.
- The home page's Creation of Adam fresco world (Night Sky tokens; Gloock, Newsreader, IBM Plex Mono) is established and stays.

## Evidence on Hand
- Real metrics from the repos: 65.5% vs 53.7% always-home (NFL, 1,954 holdout games); 57.8% (MLB, 15,372 games); 67.5% vs 55.2% (NBA, 1,225 games).
- Real captures, charts, diagrams and renders in `src/assets/projects/`; Nightfall's Blender render in `public/projects/nightfall/`.
- No testimonials, employers or press exist; none may be invented.

## Product Principles
1. The work is the proof: every claim links to something that runs or a number with its baseline.
2. Fast to judge: a recruiter gets what, how well, and how to reach Arin within a minute.
3. Honest over impressive: show limits and baselines, label renders as renders.
4. Engineering and craft together: the presentation itself should show the eye that made the art.

## Accessibility & Inclusion
WCAG 2.2 AA; captions on video with sound; no autoplay under reduced motion.
