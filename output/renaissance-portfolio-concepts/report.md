# Renaissance in Motion: Five Creative Directions and Build Frameworks for an Animated Portfolio

**Prepared by:** Bottega (Renaissance Portfolio Concept Researcher)
**Date:** 2026-11-13
**Status:** Final

Citations like [S12] point to the numbered sources in Section 10. Full notes for every source are in `notes.md`.

---

## 1. Executive Summary

- **Five concepts were developed**, all chosen by you: **The Altarpiece, Beneath the Paint, The Vanishing Point, Cartoon & Pounce and Sfumato.** Each one is based on a real Renaissance technique or format, and each defines one motion system that links every project into a single experience.
- **The browser tech for "connected" motion is ready.**
  - Same-document View Transitions work in every major browser (October 2025) [S20].
  - CSS scroll-driven animations do too, as of Firefox 159 (October 2026) [S24].
  - GSAP, including Flip, DrawSVG and ScrollTrigger, is now free [S25].
  - Cross-document transitions work in Chrome and Safari. Firefox support is unconfirmed, but Astro's router provides a fallback [S21][S46].
- **Process is the strongest content.** MIT says it is more interested in your build process than the end result. It reviews code projects only with a working demo, and it may only see what you upload to SlideRoom [S29]. Every concept therefore uses the same project page: result and links first, process story below.
- **The art must never hide the work.** About 57% of viewing time is spent on the first screen [S30], and hiding the main navigation roughly halves how often people find it [S31]. All five concepts keep a plain, visible project index and an HTML-first title.
- **Accessibility shapes the motion.** Parallax, camera moves and swinging panels must switch off under `prefers-reduced-motion` [S36][S38]. Opacity changes are excluded from WCAG's definition of "motion animation", so a sfumato-style cross-fade is a natural fallback for every concept [S36].
- **Use CC0 museum images**: the Met [S12], the National Gallery of Art [S13] and the Walters [S43]. Paintings held by Italian state museums can carry reproduction fees even though they are in the public domain [S16].
- **One stack for all five:** Astro (static HTML pages, JavaScript only where needed) + GSAP + CSS. Three.js is needed only for The Vanishing Point [S46][S47][S25][S26].
- **Difficulty at your level (HTML/CSS + some JS):** Sfumato 2/5; Altarpiece, Cartoon & Pounce and Beneath the Paint (CSS version) 3/5; Vanishing Point 5/5, or 4/5 as a 2.5D "lite" version.
- **Recommendation (labelled; the choice is yours):** build **The Altarpiece** as the site's structure, use **Beneath the Paint** for the project pages, and use **Sfumato** as the reduced-motion and base layer. Section 6 explains why.

---

## 2. Objective & Scope

**Objective:** develop 3–5 distinct concept directions for your portfolio website. In each one, the artwork looks like a Renaissance painting and animation connects all the projects. Each concept pairs a creative direction with a framework (site structure + recommended tech stack) you can build from. You then pick one to develop in more depth.

**In scope:**
- Italian and Northern Renaissance painting (about 1400–1600) as visual and motion material
- Web techniques and browser support from 2024–2026
- Portfolio UX for colleges, internships, employers and clients
- Image rights
- A site structure and tech stack for each concept
- Code/software and school/academic projects, designed for about 4–8 projects and able to grow

**Out of scope:**
- Building the site during this project
- Copying any existing portfolio
- Hosting, domain and SEO
- Art-history analysis beyond what the visuals need

---

## 3. Methodology

- **Sources:**
  - museum and conservation pages (the Met, NGA, the National Gallery London, the Walters, KIK-IRPA/Getty)
  - official web-platform documentation (MDN, web.dev, Chrome for Developers, W3C WAI, Astro, GSAP)
  - primary UX research (Nielsen Norman Group)
  - admissions guidance (MIT)
  - working technical tutorials (Codrops, a well-known creative developer's blog)
  - a small number of surveys and vendor studies, marked as lower reliability
- **How sources were evaluated:**
  - Primary sources were preferred.
  - Browser-support claims were dated and cross-checked (e.g. the Firefox 159 Baseline claim was confirmed directly on web.dev [S24]).
  - Statistics that could not be traced to an original were **excluded**, e.g. a widely repeated "73% of hiring managers…" figure [S34].
- **Process:**
  1. Four research milestones (painting vocabulary and rights, rendering and animation, portfolio UX, performance and accessibility).
  2. Eight concept seeds.
  3. You chose five.
  4. Each of the five was developed against the success criteria in `researchAgent.md`.

---

## 4. Findings

### 4.1 Renaissance visual vocabulary (RQ1)

The research found three kinds of material that work as **structures**, and several that work as **motion principles**.

**Structures**
- **The winged altarpiece.** A main panel sits above a predella: a row of small, often narrative, scenes. Hinged wings are painted on both sides, so the closed and open states show completely different images. Closed exteriors, especially Netherlandish ones, were often painted in grey **grisaille** imitating stone [S6].
- **The layered painting.** Infrared reflectography of the Ghent Altarpiece shows the underdrawing beneath the paint, including changes of plan such as trees added after the sky was painted. The Closer to Van Eyck site lets you compare these layers side by side [S1]. Leonardo built shadows from glazes about 1–2 µm thick, with total build-up no more than 30–40 µm [S4]. Netherlandish oil painters built glowing colour from translucent glazes [S5].
- **Perspective construction.** Brunelleschi demonstrated linear perspective around 1415 and Alberti wrote it down in 1435 [S2]. Masaccio's *Holy Trinity* places its vanishing point near the viewer's eye level [S2], reportedly constructed with a nail and string [S3]. In the Walters *Ideal City*, the orthogonals converge at the city gate [S43]. Mantegna's painted ceiling oculus looks *up* into another space [S9].

**Motion principles**

| Technique | Source | Motion idea |
|---|---|---|
| Sfumato | [S4] | Elements condense out of haze in many thin steps; nothing "pops" |
| Glazing | [S5] | Colour builds up in transparent layers over a grey or light ground |
| Spolvero (pouncing) | [S8][S44] | Dotted pricked outline → dust → joined line → paint |
| Anamorphosis | [S7] | A distorted shape resolves at the right angle |
| Gold ground and punchwork | [S11] | Burnished gold that catches a moving light |
| Craquelure | [S10] | Crack textures that differ by tradition (Italian: jagged, across the grain; Flemish: straighter, along the grain) |

### 4.2 Image rights (RQ2)

| Source | Terms | Use it? |
|---|---|---|
| The Met Open Access | Public-domain works are CC0, any use, no permission needed (400,000+ images) [S12] | **Yes** |
| National Gallery of Art | CC0, downloads from object pages; credit requested but not required [S13] | **Yes** |
| Walters Art Museum | CC0; please credit "The Walters Art Museum" [S43] | **Yes** |
| National Gallery, London | Some images non-commercial only; current terms not confirmed [S14] | Check first |
| Italian state museums (e.g. Uffizi) | Reproduction fees and authorization can apply to public-domain works (Arts. 107–108; Decree 161/2023) [S16] | **Avoid** unless checked |

An EU rule (Directive 2019/790, Art. 14) also says faithful reproductions of public-domain art are not protected by copyright [S15]. Italy's separate cultural-heritage rules still apply to works held there [S16].

### 4.3 Painterly rendering on the web (RQ3)

There are three tiers, from cheapest to richest:

1. **SVG filters + CSS.** `feTurbulence` + `feDisplacementMap` give paper grain, rough brushed edges and torn edges. They have been supported everywhere since 2015 [S27].
2. **WebGL 2 shaders.**
   - The Kuwahara filter turns any image, video or 3D scene into an oil-paint look while keeping edges [S17][S18].
   - Depth maps give 2.5D parallax and candle-style relighting of a flat painting [S28].
3. **WebGPU.** This is now in Chrome, Safari 26 and Firefox on Windows. Three.js `WebGPURenderer` falls back to WebGL 2, so treat WebGPU as an upgrade, never a requirement [S26].

For your level, a beginner-friendly option exists for tier 2: Blender's compositor has a Kuwahara node [S18]. You can "paint" all your images offline and ship them as plain images, with no shader code.

### 4.4 Motion that links projects (RQ4)

- **Shared-element morphs** make a project card *become* its page.
  - Same-document View Transitions: Baseline since October 2025 [S20].
  - Cross-document: Chrome 126+ and Safari 18.2+; Firefox unconfirmed [S21].
  - Astro's `<ClientRouter />` adds fallbacks for browsers without native support [S46].
  - GSAP Flip does the same within a page [S25].
- **Persistent elements**: Astro's `transition:persist` keeps a canvas or a UI element alive between pages, so one object (a lens, a 3D scene) can travel through the whole site [S46].
- **Scroll-linked effects**: native CSS in all major browsers as of October 2026 [S24]; GSAP ScrollTrigger for finer control [S25].
- **Lesson from production**: Google's AI Mode transitions had frame drops on older devices and stacking-context bugs, and shipped as progressive enhancement [S22].

### 4.5 How reviewers read portfolios (RQ5)

- **Colleges (MIT as the clearest example)** [S29]:
  - "more interested in your build process than your end results"
  - up to 25 media items, each explained, with finished work kept separate from work in progress
  - 2 minutes of video in total
  - **code needs the codebase plus a working demo**
  - outside links may not be reviewed
- **Hiring managers** [S32][S34]:
  - In a small 2021 survey, 93% would likely look at a portfolio site, but 51% said not having one wouldn't lower a junior candidate's chances. The site is a differentiator, not a requirement.
  - Many recruiters don't read code; they rely on write-ups, diagrams and demos.
- **Attention** [S30][S31][S33]:
  - 57% of viewing time is on the first screen and 74% on the first two [S30].
  - Hidden navigation roughly halves discoverability [S31].
  - Resume screens average 7.4 s. This is a vendor study about resumes, so treat it as directional only [S33].
- **Award-winning "explore to discover" portfolios** (e.g. a playable WebGL world) win craft awards [S35] but conflict with the attention findings. They need a plain index as a second route.

### 4.6 Performance and accessibility (RQ6)

- **WCAG 2.3.3 (AAA):** interaction-triggered motion must be possible to turn off. Parallax is the named example. Colour and opacity changes are not "motion animation", but the erratum says blur should be treated as motion [S36].
- **WCAG 2.2.2 (A):** automatic movement that lasts more than 5 s needs pause/stop/hide [S37].
- **`prefers-reduced-motion`:** widely supported since 2020 [S38].
- **Smooth motion:** animate `transform` and `opacity`, and use `will-change` sparingly [S39].
- **Core Web Vitals "good" thresholds:** LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 [S40]. A WebGL intro must not be the largest paint.
- **Phones:** cap the pixel ratio and render only on change [S41].

---

## 5. Concept Directions

### 5.0 Shared foundation (applies to all five)

**Recommended stack**
- **Astro**, with a static HTML page per project. It ships zero JavaScript by default and adds interactive "islands" only where needed [S47].
- **View transitions**: native, plus `<ClientRouter />` for fallbacks [S46].
- **GSAP** (free; Flip, DrawSVG, ScrollTrigger) [S25].
- **Plain CSS**, including scroll-driven animations [S24].
- **Three.js** only where a concept says so, on a WebGL 2 baseline [S26].

**Project content model:** one Markdown file per project in a content collection [S47], with these fields:
- `title`, `oneLine`, `role`, `stack`, `year`
- `demoUrl`, `repoUrl`
- `process[]`: images with captions, each marked *finished* or *in progress*

The process images double as your MIT SlideRoom upload set (≤ 25 items across what you send) [S29].

**Project page template (every concept)**
- First screen: title, one line, role, stack, **Demo** and **Code** buttons [S29][S30].
- Below that: the process story.
- At the end: **Next project**, which plays the concept's signature transition. This is how motion links the projects end to end.

**Always-visible plain index:** a visible "Index" link on desktop, not hidden in a hamburger menu [S31], leading to a simple text list of every project.

**Motion budget**
1. HTML-first title, name and project links, so LCP and CLS stay good [S40].
2. Animate transform/opacity or GPU shaders only [S39].
3. Reduced motion → opacity cross-fades [S36][S38].
4. Ambient loops stop within 5 s or get a pause button [S37].
5. Cap pixel ratio and render on demand on phones [S41].
6. WebGL 2 baseline [S26].

**Art pipeline (your choice: mix)**
- CC0 paintings from the Met, NGA and Walters for textures, skies, gold, architecture and detail [S12][S13][S43].
- A few **original compositions** for the key scenes. Drawing underdrawing-style line art is much easier than painting, and it suits three of the five concepts.
- Run *everything* (CC0 fragments, your drawings, project screenshots) through the same painterly treatment, so the collage reads as one painting. Use Blender's Kuwahara node offline [S18], or a live shader later [S17].
- Verify the Open Access label on each object page before downloading.

**Type and colour**
- Type: **EB Garamond** for body text, a free revival based on a 1592 specimen of Garamont's types, and **Cormorant Garamond** for display sizes only [S48]. Add a plain monospace for code labels.
- Colour: start from pigments. Gesso white, ochre, umber, vermilion, ultramarine, verdigris and gold, as glazed jewel tones over a neutral ground [S5][S11].

---

### 5.1 The Altarpiece

**Source paintings and techniques**
- The winged altarpiece: main panel, wings painted on both sides, grey grisaille exterior when closed, and a predella of small narrative scenes [S6].
- Reference: the Met's *Annunciation Triptych (Merode Altarpiece)*, Workshop of Robert Campin, c. 1427–32, available under Met Open Access [S42][S12]. Its right wing shows Joseph working in his carpenter's workshop [S42], an apt emblem for a maker's portfolio.
- Oil-glaze colour [S5]; gold-ground mouldings with punchwork [S11].

**How the animation links the projects:** the whole site is **one object** whose panels rearrange.
1. **Arrival:** the altarpiece is closed and in grisaille, showing your name and one line as stone-carved lettering. The wings swing open (CSS 3D `rotateY`, transform only [S39]) and colour glazes in over the grey [S5].
2. **The predella is your project index.** Each project is a small painted scene in the base row, labelled in text.
3. **Choosing a scene** morphs it up into the main panel (GSAP Flip [S25]) while the previous main project drops into its predella slot. The projects literally trade places within one structure.
4. **Opening a project:** the main panel expands to fill the screen as the project page (shared element via `transition:name` [S46]). The wings stay as thin edges: the left wing is the previous project and the right wing is the next. "Next" folds the wing shut and opens it on the next project.
5. **About** lives on the closed exterior. Closing the altarpiece takes you back to the start.

**Visual style**
- Grisaille stone grey for the interface chrome; jewel-tone glazes inside the panels; gold mouldings.
- Very faint craquelure on panel surfaces: Flemish-style straight cracks to match a Northern triptych [S10].
- EB Garamond / Cormorant Garamond [S48].

**Main interactions**
- "Open" (also opens automatically after a moment); click or arrow keys along the predella; Enter to open; Esc to close.
- Hovering over a predella scene: gold catches the light and a punched halo pattern appears.

**Site structure**
- `/`: closed → open altarpiece, with the predella visible on the first open screen
- `/projects/[slug]`: panel page
- `/about`: the exterior
- `/index`: plain list

4–8 projects fit one predella row. Beyond that, add a second tier or a scroll-snapping predella; real altarpieces varied in panel count [S6].

**Tech stack and difficulty**
- Astro + CSS 3D transforms + GSAP Flip + view transitions. **No WebGL needed.** A WebGL glaze-lighting pass can be added later.
- **Difficulty for you: 3/5.** The new skills are CSS 3D transforms and GSAP Flip; both are well documented.

**UX check: strong.**
- Within one screen of arriving, a reviewer sees your name and every project title (the predella).
- The closed intro must never block: open it automatically, or show the predella straight away.

**Mobile and reduced motion**
- **Phones:** the triptych stacks vertically. The wings hinge top and bottom, and the predella becomes a horizontal strip with scroll snapping.
- **Reduced motion:** the wings cross-fade open instead of swinging, and the Flip morph becomes a cross-fade [S36][S38].

---

### 5.2 Beneath the Paint

**Source paintings and techniques**
- Technical imaging of the Ghent Altarpiece: high-resolution photos, infrared reflectography of the underdrawing, X-rays, and side-by-side layer comparison [S1].
- Leonardo's micro-thin layers [S4] and Netherlandish glazing over underdrawing [S5].
- The Ghent site is used as an *interaction precedent only*: its images' licence was not checked, so don't reuse them. Your own artifacts are the layers.

**How the animation links the projects:** each project is a painted panel whose layers are your process, and **one tool, the conservator's lens, travels through the whole site.**

| Layer (surface → deepest) | What it shows |
|---|---|
| Varnish (surface) | The finished product: screenshot or demo clip, painterly treated |
| Paint | Key features and results |
| Underpainting | Architecture: diagrams, data flow, stack |
| Underdrawing | Origins: first sketches, wireframes, first commit |

- **Home:** one large original panel with each project as a framed region. Move the lens (a soft circular loupe) over a region to glimpse its underdrawing.
- **Project page:** scroll *descends through the layers* (scroll-driven [S23][S24]). The finished result comes first, which is good for UX [S30], and each layer down tells the story further back.
- **Between projects:** the lens is kept alive across navigation (`transition:persist` [S46]), so it is literally the same object moving from project to project.

**Visual style**
- Infrared layers in charcoal-grey line, X-ray layers in inverted grey, paint in full glazed colour.
- Small monospace "conservation report" labels, e.g. *Layer 3, Underdrawing: wireframes, March 2025*.
- Optional faint craquelure on the varnish layer [S10].

**Main interactions**
- Lens follows the pointer on desktop. On touch, a before/after slider handle.
- Keyboard: buttons to step through layers.
- A **Compare** mode shows two layers side by side, as the Ghent viewer does [S1].

**Site structure**
- `/`: master panel + plain index
- `/projects/[slug]`: layer stack; the first screen is the varnish layer with summary and links
- `/about`
- `/index`

**Tech stack and difficulty**
- **CSS version:** a circular `mask-image`/`clip-path` moved by a few lines of JS, plus scroll-driven layer transitions. **3/5.**
- **WebGL version:** a soft-edged mask shader, a live Kuwahara paint layer [S17] and a craquelure overlay. **4/5.**
- Start with the CSS version; the concept works fully without WebGL.

**UX check: good if the finished result always shows first.** Every layer's content must also be readable as ordinary content in the scroll, not only through the lens. Nothing important can be lens-only.

**Mobile and reduced motion**
- **Phones:** the lens becomes a slider.
- **Reduced motion:** layers swap with cross-fades; no trailing lens motion or scroll-linked movement [S36].

**Why this one stands out:** it is the concept most directly aligned with what MIT says it values [S29]. Each layer image with its caption is a ready-made SlideRoom item.

---

### 5.3 The Vanishing Point

**Source paintings and techniques**
- Linear perspective: Brunelleschi c. 1415, Alberti 1435; Masaccio's eye-level vanishing point [S2]; nail-and-string construction [S3].
- Master reference: *The Ideal City* (c. 1480, attributed to Fra Carnevale), Walters Art Museum, CC0. Its orthogonals converge at the central gate [S43].
- Mantegna's *di sotto in sù* oculus for "looking up" [S9].

**How the animation links the projects:** the whole portfolio is **one continuous place**, an ideal city.
1. **Arrival:** red-chalk construction lines draw outward from a single vanishing point (the "nail and string"), forming the orthogonals and pavement grid. Then the architecture fills in with paint (sfumato fade).
2. **Projects are buildings or bays** along the orthogonals, each labelled with its title. Scroll moves the camera forward along the central axis.
3. **Choosing a project** turns the camera into its bay. The doorway opens onto the project page; the 3D scene is kept alive across navigation, so the camera move is continuous [S46].
4. **At the end of the axis**, the camera tilts up through a painted oculus into sky, which is About/Contact [S9].

**Visual style**
- Stone and pale-sky palette from the *Ideal City*; crisp ochre/red-chalk construction lines.
- Facade textures from CC0 sources, unified through the painterly filter [S17][S18].

**Main interactions**
- Scroll or drag to walk; click a bay; arrow keys step between bays.
- A fixed **floor-plan minimap** that is also the project index [S31].

**Site structure**
- `/`: the piazza
- `/projects/[slug]`: real HTML pages with the 3D scene as a backdrop
- `/about`: the oculus
- `/index`

**Tech stack and difficulty**
- **Full version:** Three.js in an Astro island, with GSAP for camera moves; WebGL 2 baseline, WebGPU optional [S26]. **5/5 for you.** It is the steepest learning curve: 3D scenes, cameras, textures and mobile performance.
- **Lite version:** 2.5D, using CSS `perspective` with flat painted planes, or depth-map parallax applied to the *Ideal City* image itself [S28]. **4/5.**

**UX check: highest risk of the five.**
- Exploring a space before seeing work fights the first-screen findings [S30].
- Mitigations:
  - the title, name and project list render as HTML first (LCP is never the canvas) [S40]
  - project names are readable on the buildings from the first frame
  - the minimap index is always visible
  - a "Skip to projects" link

**Mobile and reduced motion**
- **Phones:** cap the pixel ratio at about 1.5 and render on demand [S41], or serve the 2.5D lite version.
- **Reduced motion:** no camera flights; jump-cut with a cross-fade between bays [S36]. Any idle camera drift stops within 5 s or gets a pause control [S37].

---

### 5.4 Cartoon & Pounce

**Source paintings and techniques**
- The cartoon is a full-scale drawing used to transfer a design. In pouncing (*spolvero*), the outlines are pricked, charcoal dust is tapped through the holes, and the dots are joined up [S8].
- Real examples: the Met's Anselmi cartoon (outlines "pricked with small holes for transfer by pouncing") and a Carpaccio study with pricked outlines [S44]. Confirm each object's Open Access status before reuse.

**How the animation links the projects:** **every** page change is the same four-beat "transfer", so the motion itself is the thread through the whole site.
1. A pricked, dotted outline of the next page's key shapes appears.
2. A soft charcoal "dust" cloud sweeps across (`feTurbulence` noise [S27]).
3. The dots join into continuous lines (GSAP DrawSVG [S25]).
4. Colour washes in as glazes (opacity).

The home is one long **cartoon frieze**: every project is a scene drawn along a single sheet. As each scene scrolls into view, it is "transferred" into paint (scroll-driven [S24]).

**Visual style**
- Warm paper with fibre grain (SVG noise [S27]); charcoal and red-chalk line; visible pricking along the edges.
- Colour appears **only** on the active, transferred project, so the eye always knows where it is.
- Cormorant Garamond display with EB Garamond body [S48]. Your own handwritten annotations, scanned, add a personal, detailed touch.

**Main interactions**
- Scroll along the frieze; hovering over a scene shows its pricked outline.
- Clicking runs the transfer into that project's page. "Next project" transfers the next scene.

**Site structure**
- `/`: the frieze
- `/projects/[slug]`
- `/about`
- `/index`

**Tech stack and difficulty**
- Astro + inline SVG + GSAP (DrawSVG, ScrollTrigger) + SVG filters. **No WebGL.**
- **Difficulty for you: 3/5.** The code is moderate (SVG paths and GSAP timelines). The real work is the **art**: one line drawing per project scene, which you trace and convert to SVG paths.

**UX check: good.** It is lightweight and fast, and the titles are HTML text beside each scene. Horizontal scrolling can confuse people, so drive the frieze with normal vertical scroll and keep the index visible.

**Mobile and reduced motion**
- **Phones:** the frieze becomes a vertical sequence.
- **Reduced motion:** skip the dots-to-lines drawing and the dust sweep; cross-fade straight from line art to colour [S36].

---

### 5.5 Sfumato

**Source paintings and techniques**
- Leonardo's sfumato: outlines softened by stacking glaze layers about 1–2 µm thick [S4].
- Reference portrait: *Ginevra de' Benci* (c. 1474/78), National Gallery of Art, whose public-domain images are CC0 [S45][S13]. Confirm the download option on the object page.

**How the animation links the projects:** one continuous vertical scroll where **there are no hard edges between projects**. Each project is a "portrait" that condenses out of haze as it reaches the centre of the screen, and dissolves back as the next one condenses (view-progress timelines [S23][S24]). Page changes are soft view-transition fades [S20][S46].

**Visual style**
- Quiet and editorial: large Garamond type, generous space, umber, olive and soft blue-grey haze.
- Project images get a light painterly filter [S17][S18].
- The craft is in the details: timing, type, and image treatment.

**Main interactions**
- Scroll. Optionally, the cursor clears a small soft window in the haze.
- Click a portrait to open the project.

**Site structure**
- `/`: a single scroll of projects with the plain index at the top
- `/projects/[slug]`
- `/about`

**Tech stack and difficulty**
- Astro + CSS scroll-driven animations [S24], with GSAP ScrollTrigger only if you want more control [S25]. Optional WebGL haze later.
- **Difficulty for you: 2/5**, the most achievable now.
- **Performance detail:** animating `filter: blur()` on large elements is expensive, because only transform and opacity stay cheap [S39]. Pre-render blurred copies of each image and **cross-fade opacity** between sharp and blurred versions. This also keeps the effect "motion-free" under WCAG [S36].

**UX check: strongest of the five.** It is readable, fast and HTML-first. The risk is that it feels *less ambitious*, so it relies on precise detail to show craft.

**Mobile and reduced motion**
- **Phones:** works almost unchanged.
- **Reduced motion:** nearly identical; use opacity only, no blur transitions [S36].

---

## 6. Comparison and Recommendation

| | Altarpiece | Beneath the Paint | Vanishing Point | Cartoon & Pounce | Sfumato |
|---|---|---|---|---|---|
| **How motion links projects** | Panels trade places in one object; wings = prev/next | One lens travels through layered panels | One continuous 3D city; camera moves between bays | Same "transfer" animation for every page | Continuous haze dissolve from project to project |
| **Visual signature** | Grisaille → glazed colour, gold | Infrared/X-ray layers | Perspective lines, ideal city | Pricked lines, charcoal dust, paper | Smoky haze, portraits |
| **Difficulty for you** | 3/5 | 3/5 (CSS) · 4/5 (WebGL) | 5/5 · 4/5 lite | 3/5 (+ drawing effort) | 2/5 |
| **WebGL needed?** | No | Optional | Yes (or 2.5D lite) | No | No |
| **UX risk** | Low (predella = index) | Low–medium | High | Low–medium | Lowest |
| **Shows process (MIT)** | Medium | **Highest** | Low | Medium (sketch → paint) | Low |
| **Mobile** | Good (stacked) | Good (slider) | Weakest | Good | Best |
| **"Wow" factor** | High | High | Highest | High | Medium |

### Recommendation (the choice is yours)

**Build The Altarpiece as the site, use Beneath the Paint as the project pages, and use Sfumato as the base and reduced-motion layer.**

- **It does what you asked most directly.** In the Altarpiece, animation *connects* the projects, which trade places inside one object. Beneath the Paint adds a second connector (the travelling lens) inside each project.
- **It shows attention to detail where reviewers look.** The process layers match MIT's stated priorities [S29] and produce SlideRoom-ready material.
- **It's safe on UX.** The predella is a visible project index on the first screen [S30][S31].
- **It's buildable at your level.** Both parts start without WebGL (3/5), on one stack (Astro + GSAP + CSS).
- **It's Renaissance-coherent.** A Northern triptych whose panels you can look beneath is exactly what the Ghent imaging project lets scholars do [S1][S6].

**Alternatives:**
- To ship something quickly and grow it, **start with Sfumato** (2/5) and later add Altarpiece navigation on top.
- To aim for the biggest "wow" and learn 3D, **The Vanishing Point** is the most ambitious, but build it last and keep the 2.5D lite version as a fallback.
- **Cartoon & Pounce** works well as a *transition style* layered onto any of the others, if you enjoy drawing.

---

## 7. Conclusions & Next Steps

**Direct answers**
1. **Which Renaissance visuals translate to the web?** Altarpiece structure, paint layers, perspective construction, sfumato, glazing, pouncing, gold and craquelure (4.1).
2. **Which images can you use?** CC0 from the Met, NGA and the Walters. Avoid Italian state-held works unless checked; check London's terms (4.2).
3. **Which techniques give a painterly look?** SVG filters → WebGL Kuwahara/depth shaders → WebGPU as an upgrade. Offline Kuwahara in Blender for zero code (4.3).
4. **How do you link projects?** Shared-element morphs (View Transitions, Flip), persistent elements, and scroll-linked reveals (4.4).
5. **What do reviewers need?** Name and project titles on the first screen, a visible index, result and links first, then process. Code needs a working demo (4.5).
6. **How do you keep heavy motion accessible and fast?** HTML first, transform/opacity, reduced-motion cross-fades, pause for loops, capped pixel ratio (4.6).
7. **Which stack, how hard?** Astro + GSAP + CSS for all five; Three.js for one. Difficulty 2/5 to 5/5 (Section 6).

**Suggested next steps (in order)**
1. **Choose** a direction or the recommended hybrid. Then we "work deeper", as you planned: a detailed design spec with wireframes, a motion spec with timings, and the asset list.
2. **Write the content first.** One Markdown file per project, with a one-line summary, role, stack, demo and repo links, and 3–6 process images with captions.
3. **Collect CC0 images** from the Met, NGA and Walters, checking the Open Access label on each object page.
4. **Build the static HTML version** in Astro with the plain index and project template. It should work fully with no animation.
5. **Add the signature motion** (Flip/view transitions, then the scroll reveals), with reduced-motion fallbacks written at the same time.
6. **Test** on a real phone and with the OS reduced-motion setting on. Check Core Web Vitals.
7. **Optional:** WebGL upgrades (glaze lighting, Kuwahara, lens shader).

---

## 8. Limitations & Open Questions

> **Update 2026-11-13 (Amendment 1):** the Met, NGA and Walters licence items below are now confirmed or no longer needed [see `hybrid-spec.md` Sections 7 and 11, notes S59-S61]. National Gallery London terms and Italy's fee amounts remain unverified; the spec avoids both. The developed hybrid is specified in `hybrid-spec.md`.

- **Reviewer behaviour evidence is thin.**
  - There is no rigorous study of how admissions officers or recruiters read *personal websites*.
  - The hiring-manager survey is small and from 2021 [S32]. The 7.4-second figure is a vendor study of resumes [S33].
  - The UX guardrails rest mainly on general web-attention research [S30][S31] and MIT's own instructions [S29].
- **Browser support:** Firefox support for cross-document view transitions is unconfirmed [S21]. Astro's fallback covers it [S46].
- **Image rights still to confirm per object:**
  - Open Access status of the Met's Anselmi cartoon and Carpaccio study [S44]
  - the *Ginevra de' Benci* obverse download [S45]
  - the Merode page (the Met site rate-limited a direct check; OA status came from the page's indexed text) [S42]
  - the National Gallery London's current terms [S14]
  - Italy's exact fee amounts [S16]
- **Tools and licences:**
  - GSAP's Terms of Use were not read; "100% free" is confirmed, but any restrictions are not [S25].
  - Some Astro facts (content collections, zero-JS default) come from secondary sources [S47].
- **Secondary-only details:** the craquelure classification is from a summary of Bucklow's work, not the primary papers [S10]. Typeface details are from font directories [S48].
- **Estimates:** difficulty ratings are estimates for "HTML/CSS + some JS" and will shift as you learn.
- **Not done:** example award sites were not opened and inspected in a browser; the descriptions come from listings [S35].

---

## 9. Decision Log

| # | Decision | Your answer |
|---|---|---|
| 1 | Expertise | Creative web dev + portfolio UX |
| 2 | Renaissance tradition | Both Italian and Northern |
| 3 | Tech limits | Open to anything |
| 4 | "Framework" means | Site structure + tech stack |
| 5 | Build | You build later; this project gives direction + framework |
| 6 | Number of projects | Not sure; design for about 4–8 |
| 7–8 | Agent definition, plan | Approved |
| 9 | Concepts to develop | Altarpiece, Beneath the Paint, Vanishing Point, Cartoon & Pounce, Sfumato |
| 10 | Art source | Mix: CC0 + a few original compositions |
| 11 | Experience | HTML/CSS + some JS |

Full log: `decisions.md`.

---

## 10. Sources

1. **[S1]** Closer to Van Eyck: Rediscovering the Ghent Altarpiece. KIK-IRPA / Getty Foundation; coverage by CODART and Getty News. https://www.codart.nl/other/ghent-altarpiece-website-enhanced/ ; https://www.getty.edu/news/more-to-explore-as-the-ghent-altarpiece-website-gets-an-update
2. **[S2]** Smarthistory, "Early applications of linear perspective"; Britannica, "Linear perspective". https://smarthistory.org/early-applications-of-linear-perspective ; https://www.britannica.com/art/linear-perspective
3. **[S3]** H. Oakley, "Hard reality: 9 Linear perspective projection", Eclectic Light Co., 2023-06-15. https://eclecticlight.co/2023/06/15/hard-reality-9-linear-perspective-projection/
4. **[S4]** Walter et al., Leonardo's glazes (ESRF news; Nature news), July 2010. https://esrf.fr/news/general-old/general-2010/new-light-on-leonardo-da-vinci2019s-faces ; https://doi.org/10.1038/466694a
5. **[S5]** S. Jones, "Painting in Oil in the Low Countries and Its Spread to Southern Europe", The Met, Oct 2002. https://www.metmuseum.org/essays/painting-in-oil-in-the-low-countries-and-its-spread-to-southern-europe
6. **[S6]** National Gallery London glossary "polyptych"; Courtauld predella panels; Philadelphia Museum of Art grisaille Annunciation; Wikipedia "Altarpiece". https://nationalgallery.org.uk/paintings/glossary/polyptych ; https://gallerycollections.courtauld.ac.uk/object-p-1966-gp-10 ; https://www.philamuseum.org/objects/102122
7. **[S7]** National Gallery London, Holbein, *The Ambassadors* (NG1314); Smarthistory. https://nationalgallery.org.uk/paintings/NG1314 ; https://smarthistory.org/hans-holbein-the-younger-the-ambassadors
8. **[S8]** National Gallery London, "Studying Raphael: drawings and cartoons"; Smarthistory, Italian Renaissance drawing. https://www.nationalgallery.org.uk/paintings/research/studying-raphael-drawings-and-cartoons
9. **[S9]** Camera degli Sposi (Wikipedia; DailyArt Magazine). https://en.wikipedia.org/wiki/Camera_degli_Sposi ; https://www.dailyartmagazine.com/andrea-mantegnas-bridal-chamber/
10. **[S10]** Wikipedia, "Craquelure" (after Bucklow); Bratasz et al., *Heritage Science*, 2020. https://en.wikipedia.org/wiki/Craquelure ; https://link.springer.com/content/pdf/10.1186/s40494-020-0352-0.pdf
11. **[S11]** Smarthistory, "Remaking a fourteenth-century triptych"; The Met, "Italian Painting of the Later Middle Ages". https://smarthistory.org/making-triptych ; https://www.metmuseum.org/essays/italian-painting-of-the-later-middle-ages
12. **[S12]** The Met, Image and Data Resources / Open Access (2017). https://www.metmuseum.org/policies/image-resources
13. **[S13]** National Gallery of Art, Free Images and Open Access. https://www.nga.gov/artworks/free-images-and-open-access
14. **[S14]** Image resources listing (National Gallery London licences), Association for Art History. https://forarthistory.org.uk/image-resources/
15. **[S15]** Directive (EU) 2019/790, Art. 14; Kluwer Copyright Blog, 2019. https://www.legislation.gov.uk/eudr/2019/790/article/14
16. **[S16]** Communia, "Tales of public domain protection in Italy", 2023; Kluwer Copyright Blog, 2023. https://communia-association.org/2023/07/10/tales-of-public-domain-protection-in-italy/
17. **[S17]** M. Heckel, "On Crafting Painterly Shaders". https://blog.maximeheckel.com/posts/on-crafting-painterly-shaders
18. **[S18]** Blender Manual, Kuwahara node; Kodeco paint-filter tutorial. https://docs.blender.org/manual/en/latest/compositing/types/filter/kuwahara.html
19. **[S19]** MDN, View Transition API. https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
20. **[S20]** web.dev, "Same-document view transitions are now Baseline Newly available", 2025-10-16. https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
21. **[S21]** Chrome for Developers, cross-document view transitions; caniuse; web-features explorer. https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
22. **[S22]** Chrome for Developers, "How Google created a connected experience for its new AI Mode using view transitions", 2025-08-28. https://developer.chrome.com/blog/google-ai-mode-view-transitions-case-study
23. **[S23]** MDN, CSS scroll-driven animations. https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations
24. **[S24]** web.dev, "New to the web platform in October" (2026). https://web.dev/blog/web-platform-10-2026
25. **[S25]** GSAP pricing page. https://gsap.com/pricing/
26. **[S26]** web.dev, "WebGPU is now supported in major browsers"; ICS Media, Three.js on WebGPU. https://web.dev/blog/webgpu-supported-major-browsers ; https://ics.media/en/entry/250501/
27. **[S27]** MDN, `<feTurbulence>`. https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence
28. **[S28]** Codrops, "How to Create a Fake 3D Image Effect with WebGL" (2019); "Relighting Images with Depth Maps and Three.js". https://tympanus.net/codrops/2019/02/20/how-to-create-a-fake-3d-image-effect-with-webgl/
29. **[S29]** MIT Admissions, Creative portfolios / Maker Portfolio FAQ. https://mitadmissions.org/apply/firstyear/portfolios-additional-material/ ; https://mitadmissions.org/blogs/entry/faq-for-maker-portfolios/
30. **[S30]** Nielsen Norman Group, "Scrolling and Attention", 2018. https://www.nngroup.com/articles/scrolling-and-attention/
31. **[S31]** Nielsen Norman Group, "Hamburger Menus and Hidden Navigation Hurt UX Metrics", 2016. https://www.nngroup.com/articles/hamburger-menus/
32. **[S32]** J. Kettmann, Profy.dev, portfolio-website survey of 60+ hiring managers, 2021. https://dev.to/profydev/this-survey-among-60-hiring-managers-reveals-don-t-waste-your-time-on-a-react-portfolio-website-17ge
33. **[S33]** Ladders eye-tracking study, 2018 (HR Dive coverage). https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/
34. **[S34]** Developer-portfolio guidance (Scrimba; Fueler), secondary. https://scrimba.com/articles/how-to-build-a-web-developer-portfolio-that-gets-you-hired
35. **[S35]** Awwwards, "Where Worlds Take Shape" and Portfolio Honors listings. https://www.awwwards.com/sites/where-worlds-take-shape
36. **[S36]** W3C WAI, Understanding SC 2.3.3 Animation from Interactions. https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
37. **[S37]** W3C WAI, Understanding SC 2.2.2 Pause, Stop, Hide. https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
38. **[S38]** MDN, `prefers-reduced-motion`. https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
39. **[S39]** web.dev, "How to create high-performance CSS animations"; "Animations and performance". https://web.dev/articles/animations-guide
40. **[S40]** web.dev, "How the Core Web Vitals metrics thresholds were defined" (updated 2025-05-07). https://web.dev/articles/defining-core-web-vitals-thresholds
41. **[S41]** three.js forum threads on mobile pixel ratio; three.js manual "Rendering on demand". https://discourse.threejs.org/t/low-fps-on-ios-mobile-with-pixel-ration-set-as-window-devicepixelratio/4963 ; https://threejs.org/manual/#en/rendering-on-demand
42. **[S42]** The Met, *Annunciation Triptych (Merode Altarpiece)*, Workshop of Robert Campin, 56.70a–c; DailyArt Magazine. https://www.metmuseum.org/art/collection/search/470304
43. **[S43]** Walters Art Museum, rights and reproductions (CC0); *The Ideal City*, 37.677. https://www.thewalters.org/rights-reproductions.aspx ; https://en.wikipedia.org/wiki/The_Ideal_City_(painting)
44. **[S44]** The Met, Anselmi, *Putti Playing with Hoops* (420449); Vittore Carpaccio page. https://metmuseum.org/art/collection/search/420449 ; https://www.metmuseum.org/perspectives/vittore-carpaccio
45. **[S45]** National Gallery of Art, Leonardo, *Ginevra de' Benci* (50724). https://www.nga.gov/artworks/50724-ginevra-de-benci-obverse
46. **[S46]** Astro Docs, View transitions. https://docs.astro.build/en/guides/view-transitions/
47. **[S47]** Scrimba, "How to Learn Astro [2026]"; Contentful, "What is Astro". https://scrimba.com/articles/how-to-learn-astro-2026/
48. **[S48]** Fontsource / Adobe Fonts, EB Garamond; Cormorant Garamond listings. https://fontsource.org/fonts/eb-garamond/about
