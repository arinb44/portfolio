# Research Plan

## Project Title
Renaissance in Motion: 3–5 creative directions and build frameworks for an animated portfolio

## Objective
Develop 3–5 distinct concept directions for the user's portfolio website. In every concept, the artwork looks like a Renaissance painting and animation connects all the projects into one experience. Each concept pairs a creative direction with a framework (site structure plus recommended tech stack) that the user can build from later. The report compares the concepts so the user can pick one to develop in more depth.

## Key Research Questions
1. Which visual elements and techniques of Italian and Northern Renaissance painting can become web visuals and motion? Candidates to check: linear perspective, sfumato, gold ground, underdrawing, glazing layers, cracked varnish, folding altarpiece panels, engraving lines.
2. Which painting images can be used legally, and under what license? This covers public domain status and museum open-access programs.
3. What rendering and animation techniques can produce a painterly look on the web, and how well are they supported in current browsers? Examples: shaders, canvas, SVG filters, scroll-driven animation, view transitions.
4. What animation patterns can link separate projects into one continuous experience while each project stays easy to reach?
5. What do colleges, internships, employers and clients look for in a portfolio, and how quickly do they scan it? What structure lets them find the projects within a few seconds?
6. How can heavy motion stay fast on phones and respect reduced-motion and other accessibility settings?
7. For each concept: what site structure and tech stack fit, and how hard is it to build?

## Scope
**In scope**
- Renaissance painting, about 1400–1600, Italian and Northern, used as visual and motion material
- Web rendering and animation techniques, and browser support, from 2024–2026
- Portfolio UX for colleges, internships, employers and clients
- Image rights for using painting reproductions
- Site structure and tech-stack recommendations for each concept
- Projects shown: code/software and school/academic work, about 4–8, able to grow

**Out of scope**
- Building or coding the site during this project
- Copying or recreating any existing portfolio site
- Hosting, domain and SEO
- Deep art-history analysis beyond what the visuals need

## Methodology
- **Source types**
  - Museum open-access collections: painting references and image licenses
  - Official documentation (MDN, web.dev, animation and 3D library docs, Can I use): techniques and browser support
  - Award galleries for creative sites (e.g. Awwwards, FWA): real examples, cited by URL and described, never copied
  - Admissions offices', recruiters' and UX researchers' own published guidance: what reviewers look for
- **Search strategy:** web searches organized by research question. I may open example sites in the built-in browser to see how their motion and navigation actually behave.
- **How sources are evaluated**
  - Primary sources come first: official docs and an institution's own pages.
  - Web-tech sources are checked for date (2024–2026), and browser support is confirmed against MDN or Can I use.
  - Opinion pieces are labelled as opinion.
  - A claim backed by only one source is flagged.
- **Every source is logged** in `notes.md` with title, author or publisher, date, URL, a summary and a reliability note.
- **How concepts are made:** findings → 8–10 short concept seeds → the user picks 3–5 → each picked seed is developed into a full concept against the success criteria.

## Planned Report Structure
1. Executive Summary
2. Objective & Scope
3. Methodology
4. Findings
   - 4.1 Renaissance visual vocabulary (techniques, motifs, example paintings)
   - 4.2 Image rights and sources for painting reproductions
   - 4.3 Painterly rendering and animation techniques on the web
   - 4.4 Animation patterns that link projects together
   - 4.5 How reviewers read portfolios
   - 4.6 Performance and accessibility of heavy motion
5. Concept Directions: one section per concept (3–5), each with these parts:
   - Source paintings and techniques
   - How the animation links the projects
   - Visual style (type, color, texture)
   - Main interactions
   - Site structure (pages, navigation)
   - Recommended tech stack and difficulty
   - UX check
   - Mobile and reduced-motion notes
6. Comparison table and recommendation (clearly labelled; the choice is yours)
7. Conclusions & next steps
8. Limitations & open questions
9. Decision log
10. Sources

## Milestones
1. **Renaissance visual vocabulary:** collect techniques and motifs from both traditions, each tied to specific paintings. Check which museums offer reusable images (RQ1, RQ2).
2. **Rendering and animation techniques:** painterly effects, transitions that link content, library options, browser support (RQ3, RQ4).
3. **Portfolio UX:** what each audience looks for, how they scan, navigation patterns, strong example portfolios (RQ5).
4. **Performance and accessibility:** phones, reduced motion, accessibility guidance for animation (RQ6).
5. **Concept seeds:** 8–10 one-paragraph seeds built from the findings. **You pick 3–5 to develop.**
6. **Develop concepts:** full write-up of each picked concept, including structure and stack (RQ7).
7. **Compare and report:** comparison table, labelled recommendation, final `report.md`.

`progress.md` is updated after each milestone.

## Decision Points
- **After milestone 5:** which seeds become the 3–5 full concepts.
- **If a concept depends on a technique with weak browser support or very high difficulty:** keep it, simplify it, or drop it.
- **If research points toward one tradition or artist:** whether to lean into it or keep the mix.
- **Any source that needs payment, login or a download:** you decide before I use it.
- **Any change to scope or to the research questions:** you approve it first.

## Risks & Limitations
- There is little formal research on how admissions officers and recruiters review personal websites. Much of the guidance is opinion, so confidence will be marked.
- Award galleries reward visual impact, not usability or what recruiters need. Examples from them will be weighed with that in mind.
- Browser support for newer features (scroll-driven animation, view transitions, WebGPU) changes quickly. Support will be dated and checked.
- Image rights differ by museum. Some photos of public-domain paintings still carry restrictions, so each recommended source will be checked.
- Difficulty ratings are estimates that depend on your experience, which isn't known in detail yet (see Open Questions).
- Some interactive WebGL examples may not render fully in my browser, so descriptions of them may be incomplete.

## Open Questions
1. **Your experience level** with JavaScript, animation libraries and 3D/WebGL. This makes the difficulty ratings useful instead of generic.
2. **Favorite paintings or artists** you want considered. These would seed the concepts. Answering "none" is fine.
3. **Sites you admire**, portfolio or otherwise. Optional.

**Status:** Approved on 2026-11-13

---

# Amendment 1: In-depth development of the hybrid direction

## Project Title
The Altarpiece, Beneath the Paint: design and build framework for the chosen hybrid

## Objective
Turn the recommended hybrid into a specification detailed enough that you can start building without guessing:
- **The Altarpiece** is the site structure.
- **Beneath the Paint** is the project pages.
- **Sfumato** is the base and reduced-motion layer.

The specification covers every screen, every animation (with timings), the visual system, the assets, the accessibility behaviour, the technical architecture, and a step-by-step build order matched to your experience (HTML/CSS + some JS). Building the site itself stays out of scope.

## Key Research Questions
8. **Motion timing:** what durations and easing curves fit each animation (wing opening, panel swap, layer reveal, page transition), based on published motion guidance rather than taste alone?
9. **Accessible patterns:** which keyboard and screen-reader patterns fit the predella (project row) and the lens? What is the non-pointer alternative for touch and keyboard users?
10. **Colour contrast:** do the grisaille and glaze palettes meet WCAG AA contrast for text and controls?
11. **Exact images:** which CC0 images go with each element (wings, frame, gold, textures, reference scenes)? Are their licences confirmed on each object page? This also closes the open licence items in report Section 8.
12. **Technical feasibility:** how do CSS 3D wing hinges, GSAP Flip, Astro view transitions and a persisted lens fit together? What JavaScript and image weight budget keeps LCP ≤ 2.5 s on a phone?
13. **Learning path:** what is the shortest set of official tutorials and docs that takes you from HTML/CSS + some JS to building this?

## Scope
**In scope:**
- user journeys for the three audiences
- page inventory and content model
- low-fidelity wireframes (desktop + phone, normal + reduced motion)
- motion specification
- visual system (palette with contrast checks, type scale, textures)
- asset list with sourced images
- accessibility specification
- technical architecture and performance budget
- phased build roadmap with learning resources

**Out of scope:**
- writing the site's code
- final high-fidelity artwork
- hosting, domain and SEO
- the other four concepts, except where they feed the hybrid

## Methodology
- **Sources:** official design-system motion guidance (e.g. Material Design, Apple Human Interface Guidelines), NN/g research on animation duration, W3C WAI-ARIA Authoring Practices, WCAG contrast rules, museum object pages (to confirm each licence), official Astro and GSAP documentation.
- **How sources are evaluated:** same rules as the main plan: primary sources first, dated, and every source logged in `notes.md` (continuing from S49).
- **Checks I can run myself:** colour contrast ratios are calculated with a small script, not estimated.
- **Wireframes:** drawn as simple greyscale SVG files in `wireframes/`, which open in the app's file pane. They are not a working prototype.

## Planned Deliverable Structure
A new file, `output/renaissance-portfolio-concepts/hybrid-spec.md`:

1. Summary
2. User journeys: college reviewer, recruiter, client (what they see, in order)
3. Information architecture: pages, URLs, navigation, content model fields
4. Wireframes: links to SVGs with notes
   - home closed and open
   - predella interaction
   - project page layers
   - About (exterior)
   - index
   - phone layouts
   - reduced-motion states
5. Motion specification, one row per animation: trigger, properties, duration, easing, order, reduced-motion version, how it's built (CSS / GSAP / view transition)
6. Visual system: palette with hex values and contrast results, type scale, textures, gold and craquelure rules
7. Asset list: each image with source, licence status, and what you must draw yourself
8. Accessibility specification: keyboard map, focus order, ARIA roles, alt-text rules, pause control
9. Technical architecture: Astro folder structure, components, content schema, how the lens persists, fallbacks, performance budget
10. Build roadmap: phases with "done when" checks and learning links
11. Risks and open questions
12. Sources

## Milestones
- **A1. Motion research** (RQ8): published duration and easing guidance; turn it into timings for each animation.
- **A2. Accessibility patterns** (RQ9, RQ10): ARIA patterns for the predella and lens; contrast-checked palette.
- **A3. Image sourcing** (RQ11): a shortlist of CC0 images, each licence confirmed on its object page.
- **A4. Technical architecture** (RQ12): component plan, persistence approach, performance budget.
- **A5. Wireframes and journeys:** SVG wireframes and audience walkthroughs.
- **A6. Build roadmap** (RQ13) and final `hybrid-spec.md`.

## Decision Points
1. **After A1:** motion "personality": restrained and quick, or slower and ceremonial for the altarpiece opening. I'll show both with timings.
2. **After A2:** how the predella behaves for keyboard and screen readers, if the patterns differ meaningfully.
3. **After A3:** which reference painting(s) set the palette, if the licence checks leave more than one good option.
4. **After A5:** wireframe review before the roadmap is written.
5. **Anytime:** any source needing payment, login or download; any scope change.

## Risks & Limitations
- **Your actual projects** aren't known yet, so wireframes and the asset list use placeholder projects unless you list them.
- **Motion guidance** from design systems (Material, Apple) is written for apps. Applying it to an artistic site involves judgment, which I'll mark.
- **Museum sites may block automated checks.** The Met's site rate-limited one earlier. Any licence I can't confirm will be marked for you to check by hand.
- **Wireframes are low-fidelity.** They fix layout and behaviour, not the final look.
- **Performance budgets** are estimates until something is built and measured.

## Open Questions
1. **Your planned projects:** a rough list (name + one line + type: code or school) makes the spec concrete. Placeholders are used otherwise.
2. **Wireframe format:** SVG files by default. Say if you'd prefer something else.

**Answers at approval:** 7 GitHub projects featured (NeetCode left out); no school work to add; the roadmap assumes comfortable JS + WebGL, so WebGL extras move into the main build; SVG wireframes kept as the default.

**Status:** Approved on 2026-11-13
