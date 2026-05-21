# CLAUDE.md

Working guide for Claude Code in this repo. Reflects current implementation, not the original aspirational spec — `portfolio_spec.md` has section-by-section narrative; this file is the load-bearing technical reference.

## Project

Single-page portfolio for Nathaniel Robert Jones (NRJ), senior visual designer ~20yrs. Heavy motion, per-section color identity, scroll-snap navigation between full-viewport panels.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind v4** (CSS-first config; no `tailwind.config.ts`)
- **Framer Motion** for everything animated. **No GSAP** — not needed.
- **No WebGL libraries** (OGL/Three). Liquid cursor distortion uses SVG `feDisplacementMap` instead. Swappable later if a true shader becomes necessary.
- **pnpm** as package manager.
- **Fonts via `next/font/google`**: Manrope ExtraBold (display), Geist 400/500 (body), Geist Mono 400 (labels).

## File Layout (current)

```
app/
  layout.tsx        # mounts MagneticCursor, fonts, metadata
  page.tsx          # owns activeSection + scroll-driven colorScheme + auto-advance
  globals.css       # tokens, .snap, .content-grid, smooth color transitions
components/
  cursor/MagneticCursor.tsx        # default + view (lens) cursor states
  nav/
    Nav.tsx                        # two-layer (backdrop + content), grid-placed labels, sliding brackets
    NRJPlanet.tsx                  # canvas-based comet electron + SVG planet circle + wordmark
  primitives/
    LetterCascade.tsx              # per-letter rise (opacity + y offset)
    RiseOn.tsx                     # opacity+y on whileInView
    RuleDraw.tsx                   # scaleX 0→1
    SequenceReveal.tsx             # consecutive (not staggered) sequencer
    MarchingAnts.tsx               # cascading dots primitive — used for [SCROLL] cue
  starfield/StarField.tsx          # SVG <symbol>+<use>, discrete-frame sprite cycle
  sections/
    loading/LoadingSection.tsx     # permanent first snap panel; planet centered
    who/WhoSection.tsx             # exports HelloPanel + NamePanel separately
    work/WorkSection.tsx           # Select Work + HIRED/INSPIRED + bio
lib/
  colors.ts                        # COLORS palette + Section type + SECTION_COLORS map
  motion.ts                        # EASE, EASE_SPRING, DUR, STAGGER constants
  scroll.ts                        # useColorScheme + useSectionEntry (re-fires on every entry, NOT one-shot)
```

## Design Tokens

```css
:root {
  --sage:  #D7DAAC;   --ink:   #151515;
  --sky:   #94D9F3;   --mint:  #A8D8B9;
  --coral: #EC7A55;
  /* runtime — set by useColorScheme on :root, transitioned smoothly */
  --bg: #151515; --fg: #D7DAAC; --accent: #D7DAAC;
}
```

**Section schemes** (`lib/colors.ts → SECTION_COLORS`):

| key      | bg    | fg    | accent | role                                              |
| -------- | ----- | ----- | ------ | ------------------------------------------------- |
| loading  | sage  | ink   | ink    | landing panel                                     |
| who      | ink   | sage  | sage   | Hello + Name panels (semantic "WHO" group)        |
| name     | ink   | sky   | sky    | **intermediate** — fires only via scroll override |
| hired    | sky   | ink   | ink    | Work section, inverted state                      |
| inspired | ink   | mint  | mint   | (reserved, not yet active)                        |
| contact  | coral | ink   | ink    | Contact section (not yet built)                   |

**Smooth color transitions**: `transition: background-color 1.4s cubic-bezier(0.22, 1, 0.36, 1)` on `html`, `body`, `.snap`. The same transition is on the nav + footer backdrop layers so blur tints stay in lockstep with section bg (no banding). The OutlineName component (Robert/Jones) gets a matching 1.4s transition on `-webkit-text-stroke-color` via the `.text-name-outline` class so the accent stroke morphs smoothly from sage → sky alongside the bg colour.

**Loading pre-scroll invert**: After 2.4s on Loading, `loadingInverted` flips and the scheme moves from `loading` (sage/ink) → `who` (ink/sage) before the user has scrolled. Foreshadows the WHO section identity. State lives in `app/page.tsx`.

**Color flow Name → Work** (the trickiest one):
1. While in Name panel → `colorScheme = "who"` (sage on ink)
2. As user wheel-advances down, an immediate override sets `colorScheme = "name"` (sky on ink) and a **1500ms hold** plays the smooth color transition before scrollIntoView fires
3. As Work top crosses ~50% of vh → `colorScheme = "hired"` (ink on sky, fully inverted)
4. Reverse: same pause on Work → Name with the intermediate "name" scheme
5. Implementation lives in `app/page.tsx`'s `colorScheme` state + scroll listener + `advance/retreat`
6. Wheel lock for Work boundary: **3400ms** (was 1800 elsewhere) so the longer hold + 1.4s CSS transition + smooth-scroll + inertia tail doesn't double-fire

**Persistent [Intro] overlay**: The [Intro] eyebrow + bio paragraphs that visually appear in cols 23–30 of the Name panel are rendered as a `position: fixed` overlay in `app/page.tsx`. Visibility scoped to **WHO only** — `activeSection ∈ {who, name}` (Hello + Name, the two screens of the WHO section). Driven by `--intro-opacity` CSS var, fade 1.2s via `.intro-persist`. The paragraph stays anchored on screen while Hello → Name scrolls beneath it. Does NOT persist into Work — Work owns its own right column (see Work Section Accordion below).

**Engagements fade**: Select Engagements (Name panel) fades **based on scroll position**, not colour scheme. Bound to `--engagements-opacity`: `1` when `workTop ≥ vh × 0.96` (Work fully below viewport), else `0`. Earlier versions tied this to colour scheme, which oscillated during the Work-boundary scroll and caused a "reappears mid-scroll" flicker. Scroll-position binding is monotonic over a single transition, so engagements fade out once and stay out until Work fully clears the viewport again on the way back. 0.7s opacity transition via `.engagements-fade`.

## Typography

| Class / token   | Family       | Size                     | Use                                       |
| --------------- | ------------ | ------------------------ | ----------------------------------------- |
| `.text-hero`    | Manrope 800  | clamp(4rem, 25vw, 28rem) | Hello, Let's make things happen!          |
| `.text-name`    | Manrope 800  | clamp(2.5rem, 10vw, 12rem) | Nathaniel Robert Jones                  |
| `.text-body`    | Geist 400    | 19px                     | All paragraph copy                        |
| `.text-label`   | Geist Mono   | 13px uppercase           | Eyebrows, footer meta, project disciplines |
| `.text-sm`      | Geist Mono   | 11px uppercase           | Tertiary metadata                         |
| Nav labels      | Geist 500    | 19px                     | WHO / WORK / CONTACT (inline, not a class)|
| Section headers | Geist 700    | 32px                     | "Select Engagements", "Select Work"       |
| Project names   | Geist 700    | 19px uppercase           | Bloomberg LP, Liquid Agency, etc. (NOT mono) |
| Engagement names | Geist Mono 700 | 13px uppercase        | Freelance Services, etc.                  |

**Outlined Robert / Jones** uses simple `color: var(--bg)` + `WebkitTextStroke: 1.5px var(--accent)` + `paint-order: stroke fill`. Earlier attempts (SVG `<text fill="none" stroke>`, double-stacked filled+scaled-bg layers) had artifacts — keep this CSS-only approach. The `paint-order` is essential on heavy weights (Manrope 800).

## 32-col Grid System

`.content-grid` in `globals.css`:

```css
.content-grid {
  display: grid;
  grid-template-columns: repeat(32, minmax(0, 1fr));
  column-gap: 1.5rem;
  width: 100%;
}
```

Children place via inline `style={{ gridColumn: "3 / 19" }}` (CSS-Grid syntax: inclusive col-start, exclusive col-end).

**Per-section column placements**:

| Section          | Element                        | Cols     | gridColumn string |
| ---------------- | ------------------------------ | -------- | ----------------- |
| Hello            | "Hello" headline               | 3–22     | `"3 / 23"`        |
| Hello            | Bio paragraph (lower-right)    | 23–30    | `"23 / 31"`       |
| Name             | Nathaniel/Robert/Jones stack   | 3–15     | `"3 / 16"`        |
| Name             | [INTRO] + bio (top-aligned)    | 23–30    | `"23 / 31"`       |
| Name             | Select Engagements             | 18–30    | `"18 / 31"`       |
| Work             | Select Work + project rows     | 3–17     | `"3 / 18"`        |
| Work             | [Intro] / project items list   | 20–30    | `"20 / 31"`       |
| Nav              | NRJ planet logo                | 3–5      | `"3 / 6"`         |
| Nav              | WHO label                      | 7–8      | `"7 / 9"`         |
| Nav              | rule WHO → WORK                | 9–20     | `"9 / 21"`        |
| Nav              | WORK label                     | 21–22    | `"21 / 23"`       |
| Nav              | rule WORK → CONTACT            | 23–28    | `"23 / 29"`       |
| Nav              | CONTACT label                  | 29–30    | `"29 / 31"`       |
| Footer           | SENIOR DESIGNER                | 3–5      | `"3 / 6"`         |
| Footer           | rule (only one)                | 6–17     | `"6 / 18"`        |
| Footer           | AVAILABLE FOR WORK             | 18–22    | `"18 / 23"`       |
| Footer           | (C) 2026 (no connecting rule)  | 29–30    | `"29 / 31"`       |
| Case Study       | Left rail (header / title / tabs / body / meta) | 3–12 | `"3 / 13"` |
| Case Study       | Right reel (auto-scrolling)    | 13–32   | `"13 / 33"`       |
| Case Study (rail)| NRJ mark / project number row  | 3–4 / 11–12 | nested `"1 / 2"` / `"10 / 11"` |
| Case Study (rail)| Rotated label tag              | 3 (1 col within rail) | nested `"1 / 2"` |
| Case Study (rail)| Body paragraphs                | 4–12 (cols 2-10 of rail) | nested `"2 / 11"` |

**The case-study left rail uses a nested 10-column grid** so component widths inside the rail (rotated tag, body paragraph offset) snap to the same column boundaries as the outer 32-col grid. Inner col width = outer col width because both use `1fr` units with the same column-gap.

**Mobile/tablet breakpoints not yet implemented** — desktop only. When adding them: do NOT put `@media` rules adjacent to `.content-grid` in globals.css (Tailwind v4's CSS pipeline silently drops the rule when adjacent). Use container queries or a separate component-scoped style.

## Sections (snap panels)

All sections are full-viewport `.snap` panels. `html.snapping { scroll-snap-type: y mandatory }` is added on mount. Order:

1. **Loading** — sage bg, large planet centered. Permanent (always in DOM, scrollable to from anywhere).
2. **Hello** (`#who`) — ink+sage. "Hello" headline, intro paragraph lower-right.
3. **Name** (`#who-bio`) — ink+sage. Nathaniel/Robert/Jones stack, [INTRO] + bio top-aligned right, Select Engagements lower-right.
4. **Work** (`#work`) — sky+ink (inverted). Select Work + HIRED/INSPIRED list left, [INTRO] + bio right.
5. **Contact** (`#contact`) — placeholder, not yet built.

**Active section detection**: `useSectionEntry(ref, () => setActiveSection(...), 0.5)` in `page.tsx`. Threshold 0.5. Re-fires on every entry (not one-shot) so scrolling back up restores schemes correctly.

## Auto-advance Navigation

Implemented in `page.tsx` global `useEffect`. Inputs:
- **Click anywhere** that isn't `a, button, [data-no-advance]` → next section
- **Keyboard**: ↓ / PgDn / Space / Enter → advance; ↑ / PgUp → retreat
- **Wheel**: deltaY ≥ 30 fires once per gesture; lock window 1800ms (2500ms on Work boundary). `preventDefault` is called on **every** wheel event so the page never scrolls into "no-man's-land" between snaps.

Section sequence: `loading → who → who-bio → work → contact`. The Name → Work transition has the 650ms color-morph hold (see Color flow above).

## Cursor (`MagneticCursor`)

- `cursor: none !important` on `*` via `globals.css` (only on `(hover: hover) and (pointer: fine)`).
- All cursor visuals use `var(--fg)`, NOT `currentColor` (with `color: transparent`, currentColor resolves to transparent — broken).
- States detected via `[data-cursor]` attribute on element under pointer.
- Each visual element (dot, lens, link ring) is **always in the DOM** with its size + matching `marginLeft/Top` (= -size/2 for centring) animated via framer-motion. Sizes go to 0 when not active. **No `transform: translate()` on the morphing elements** — that conflicts with framer-motion's transform pipeline and silently zeroes things out. Negative-margin centring is the workaround.
  - `default` — 10px filled var(--fg) dot
  - `view` — 96px lens circle, dot shrinks to 4px focal pin in centre
  - `link` — 18px outline ring (dot at 0)
  - `text` — 2×22 I-beam (separate static element)
- **View lens** is a single motion.div with:
  - 2px var(--fg) border outline
  - background-color `color-mix(in srgb, var(--accent) 8%, transparent)` — soft accent tint so the lens reads as a visible disc even if backdrop filters fail to apply
  - backdrop-filter: `url(#cursor-lens) contrast(1.5) saturate(2) brightness(1.08)` — SVG filter (when supported) PLUS reliable CSS filters as fallback so the warp is visible even on GPUs / browsers that don't render SVG-filter URLs in backdrops
  - Two inner sibling divs: red ghost (translateX -12, hue-rotate -50°, saturate 3, mix-blend screen) and blue ghost (translateX +12, hue-rotate +50°). Opacity 0.7 each.
- **SVG filter `cursor-lens`** is one comprehensive chain: `feTurbulence` (freq 0.03, octaves 2, seed 7) → `feDisplacementMap` scale=120 → split into R/G/B via three `feColorMatrix` extracts → R offset −9px, B offset +9px → recombined via two `feBlend mode="screen"` ops. Single filter URL keeps the chromatic registered with the displacement.
- **Morph spring**: stiffness 320, damping 26, mass 0.7 on size + opacity.
- **Magnetic pull** on `[data-magnetic]` elements via lerp toward magnet center.
- Cursor → "view" state on `a, button, [data-magnetic], [data-cursor]`.

## NRJ Planet (`components/nav/NRJPlanet.tsx`)

Shared component for both the loading screen (large) and the nav (small). Sizes 100% to its parent — caller wraps in a sized container.

**Structure**: 4 stacked layers in a `position: relative` wrapper:
1. Back canvas (z-index 1) — orbit segments behind nucleus
2. Planet circle SVG (z-index 2) — fill `var(--bg)`, stroke `currentColor`
3. Front canvas (z-index 3) — orbit segments in front of nucleus
4. Wordmark SVG (z-index 4) — N R J letters, optional cascade-in

**Orbit (one electron)**:
- `ORBIT_DURATION_SEC = 1.0` (one lap per second)
- `DRIFT_DEG_PER_ORBIT = 7` — ellipse tilt drift each lap; produces the spirograph weave over time
- `RING.rxFrac = 0.42`, `ryFrac = 0.16`, `swFrac = 0.0040`
- `SUBSTEPS = 5` per frame for smooth chord-polygon
- `TRAIL_ORBITS = 3.0`, `TRAIL_DECAY_POWER = 1.6`
- **Front/back assignment**: `isFront = Math.sin(phase) < 0` (phase ∈ (π, 2π) → front canvas). Phase-based, rotation-invariant.
- Stroke width clamped `Math.max(1.2, swFrac * dim)` so nav-size still has visible trails.
- **Always draw the boundary chord** (don't skip across front/back); skipping created visible apex/nadir gaps.
- **Render mode**: clear-and-redraw each frame, draw N trail segments with explicit per-segment alpha (`Math.pow(i/N, TRAIL_DECAY_POWER)`). Avoids canvas alpha accumulation artifacts.
- **Line cap `butt` + line join `miter`** — round caps/joins were producing visible chord-end "dots".

**Sizing GOTCHA**: parent runs scale spring on entrance. `getBoundingClientRect()` is affected by CSS transforms; reading it during the spring would size the canvas backing buffer to ~1px (and ResizeObserver doesn't fire on transform changes). Use `offsetWidth` / `offsetHeight` instead — those report the layout box.

**Wordmark**: three motion.text elements (N R J) at manual offsets. `cascadeWordmark + wordmarkDelay` props animate them in.

## Star Field

SVG `<symbol>` + `<use>`-based, discrete-frame sprite cycle. State machine per star:

```
invisible → dot → small → large → small → dot → invisible (re-randomize position)
```

- Three symbols: dot (small square), small ("+" of 8 squares), large (4-pointer of 18 squares with body cells)
- 18 stars by default; size 28px
- Color = `currentColor` — parent sets `color: var(--fg)` so stars invert with the section
- Frame durations randomized within ranges for natural breathing
- Direct DOM mutation for state changes (no React re-render per frame)

## Nav

**Two-layer structure** — required because:
- Backdrop has `mask-image: linear-gradient(...)` for soft fade-out at bottom edge
- Mask would clip the planet's hover-scale (1.35×) and the chromatic-aberration cursor effect
- So: backdrop is a `position: absolute; inset: 0; pointer-events: none` sibling BEHIND the content row

**Layout**: `.content-grid` content row, planet at cols 3–5 with hover-scale, labels + rules placed via grid columns. **Sliding brackets** via `<LayoutGroup>` + `motion.span layoutId="nav-bracket-left/right"` — only the active label renders the brackets, framer-motion morphs them between positions on activeSection change.

**Bracket positioning**: each label has an INNER `<span>` wrapper sized to the word itself (`display: inline-block`, `position: relative`). Brackets anchor to that wrapper at `right: 100%` / `left: 100%` (with `top:0; bottom:0; display:flex; align-items:center` for vertical centring). This way bracket→glyph distance is constant (0.35em + bracket glyph) regardless of label width — `[WHO]` sits tight, `[CONTACT]` sits wide, with equal space on either side. Bracket spring: stiffness 620, damping 22, mass 0.5.

**Generous hit area**: each label button has `padding: 1.2rem 1.4rem` + matching negative margin so the visual position is unchanged but the cursor catches the "view" state well before the pointer lands on the actual glyphs.

**Hover underline**: thin 1px var(--fg) line at `bottom: -0.18em` of the inner word wrapper, scaleX 0 → 1 on hover, 0.25s ease-out. Anchored to the word, not the padded button, so it lines up with the actual glyphs.

**Backdrop**: blur(16px) only — saturate filter removed (was producing visible saturation/hue banding through the mask gradient). Tint reduced from `var(--bg) 55%` to `var(--bg) 45%`.

**Planet click** scrolls to `#loading`. Active label highlight: `who` OR `name` activeSection both highlight WHO (Hello and Name are both semantically "WHO").

**Hidden during loading**: `opacity: 0, y: -8` when `activeSection === "loading"`.

## Footer

Same two-layer pattern as Nav (mask-image on backdrop, content above). Single rule between SENIOR DESIGNER and AVAILABLE FOR WORK; (C) 2026 floats at col 30 with no connecting rule. Hidden during loading.

## Motion (`lib/motion.ts`)

```ts
EASE         = [0.22, 1, 0.36, 1]   // default ease-out
EASE_SPRING  = [0.34, 1.56, 0.64, 1] // overshoot landing
DUR          = { fast: 0.25, base: 0.5, slow: 0.8 }
STAGGER      = { letter: 0.03, item: 0.08, section: 0.12 }
```

LetterCascade currently uses `EASE` (not `EASE_SPRING`) per design pref — bouncy didn't read right.

## Build Gotchas (hard-won)

1. **Tailwind v4 silently drops CSS rules** if `@media` queries are placed adjacent to them in globals.css. Reproduced with `.content-grid`. Solution: keep responsive variants out, or use container queries.
2. **`getBoundingClientRect()` includes CSS transforms.** For canvas backing-buffer sizing under any element that scales/rotates, use `offsetWidth/Height`. ResizeObserver doesn't fire on transform changes.
3. **`currentColor` resolves to `transparent`** if the element has `color: transparent`. Use `var(--fg)` / `var(--accent)` directly for stroke colors on transparent-text outlines.
4. **`mask-image` clips children, including their hover transforms.** If a hover-scaled element lives under a masked parent, split the parent into `backdrop (masked)` + `content (unmasked)` siblings.
5. **`scroll-snap` + smooth-scroll + wheel events** can produce momentum bleed-through. Always `preventDefault` wheel events; rely on a single `lockedUntil` timestamp (~1800ms) instead of gesture-coalescing logic which leaks events.
6. **Framer-motion `layoutId` for shared transitions** can fire unwanted entry morphs when both ends mount simultaneously. The pattern that works for one-way handoff: render only the source initially, conditionally mount the target on state change so framer-motion sees `unmount → mount` (not `simultaneous mount`).
7. **SVG `<text>` with `fill="none" stroke`** strokes every path component including counters, and a thick stroke renders as a band with two visible edges. CSS `-webkit-text-stroke` on rasterized text gives a single outline. Prefer CSS for outlined text.

## Work Section Accordion

The Work section is a **two-column accordion**. State (`openSlug`) lives in `WorkSection.tsx` and drives BOTH columns simultaneously:

- **Left column (cols 3–17)**: Select Work header + HIRED/INSPIRED groups + project rows. When a row is `open`, the row's button-bar inverts (ink bg, sky fg) to read as a project preview top-bar, and a `<motion.div>` panel below it animates `height: 0 → auto` to reveal a `16:7` placeholder preview area (currently a dotted-grid placeholder + project label; will hold the project artwork when assets land).
- **Right column (cols 20–30)**: Toggles between `[Intro]` paragraph (when `openSlug === null`) and a numbered project items list (when a row is expanded). `AnimatePresence mode="wait"` cross-fades them. Each item block has `[ Project ]` eyebrow, big number (Geist 700 20px), description paragraph, and an inverted "View Work" pill button (ink bg, sky fg, mono uppercase).

**No "+" toggle indicators on rows** — the row's inverted state is the open/closed signal. **No row-level summary/span/link** — that content lives in the right-column item blocks instead.

Project data shape (`Project`):
- `slug`, `name`, `disciplines` — visible in row
- `previewLabel` — caption shown bottom-left of the preview placeholder
- `items[]` — `{ number, description, href? }` — populates the right column when expanded

The `View Work` link uses `data-no-advance` so the global click-advance handler in `page.tsx` doesn't fire. `href` is reserved for case-study routes (currently `preventDefault`s).

Project group labels (HIRED / INSPIRED) and inter-row strokes are full opacity (`var(--fg)` directly, no `color-mix` transparency).

## Out of Scope (current state)

- Real OGL/Three.js GLSL shader (using SVG feDisplacementMap as proxy — visually equivalent for current "lens" use)
- Case-study detail routes — accordion's "View case study →" link is in place but no `href` is wired yet (clicks `preventDefault()` until `project.href` is populated)
- Contact section (just a placeholder with [Contact] coming next text)
- MDX content infrastructure (frontmatter + Zod parsing + `lib/content.ts`)
- Mobile / tablet breakpoints — desktop only for now
- Cross-section color transition for Inspired (mint) and Contact (coral) — schemes defined, not yet wired
- WebGL liquid distortion as a real shader — currently SVG feDisplacementMap

## Working Style

- Read `portfolio_spec.md` for narrative section descriptions; this file for technical decisions.
- When you change something, update THIS file. The spec file is intentionally aspirational; this one tracks reality.
- Avoid SVG `<text>` for outlined display type — use CSS `-webkit-text-stroke` + `paint-order: stroke fill`.
- The user iterates fast and often reverts — small focused changes per turn beat big restructures.
- Auto-advance bindings, color schemes, and section composition all live in `page.tsx`'s component body — keep them there rather than spreading across hooks.
