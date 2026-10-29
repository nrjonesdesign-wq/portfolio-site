# CLAUDE.md

Working guide for Claude Code in this repo. Reflects current implementation, not the original aspirational spec — `portfolio_spec.md` has section-by-section narrative; this file is the load-bearing technical reference.

## Project

Single-page portfolio for Nathaniel Robert Jones (NRJ), senior visual designer ~20yrs. Heavy motion, per-section color identity, scroll-snap navigation between full-viewport panels.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind v4** (CSS-first config; no `tailwind.config.ts`)
- **Framer Motion** for everything animated. **No GSAP** — not needed.
- **No WebGL libraries** (OGL/Three). Liquid cursor distortion uses SVG `feDisplacementMap` instead. Swappable later if a true shader becomes necessary.
- **pnpm** as package manager.
- **Analytics: PostHog** (`components/analytics/PostHogProvider.tsx`, mounted in the root layout so `/approach` is covered). The public project key is in the code (env vars override); it only initialises on nathanielrobertjones.com / www, so local dev and Vercel previews send nothing. Before Oct 29 2026 it relied on env vars that were never set on Vercel, so no traffic before then was recorded.
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
    LetterCascade.tsx              # per-letter (default) or per-word (`by="word"`) rise (opacity + y offset)
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
| approachIntro | ink | lavender | lavender | **intermediate** — Work→Approach scroll-in, and Approach→Contact pre-scroll invert |
| approach | lavender | ink | ink    | Approach teaser panel                             |
| contact  | coral | ink   | ink    | Contact section (not yet built)                   |

**Smooth color transitions**: `transition: background-color 1.4s cubic-bezier(0.22, 1, 0.36, 1)` on `html`, `body`, `.snap`. The same 1.4s transition is on the desktop nav + footer backdrop layers (was 0.6s, which tinted the bars ahead of the page mid-transition) so blur tints stay in lockstep with section bg (no banding). The OutlineName component (Robert/Jones) gets a matching 1.4s transition on `-webkit-text-stroke-color` via the `.text-name-outline` class so the accent stroke morphs smoothly from sage → sky alongside the bg colour.

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
| Nav              | rule WHO → WORK                | 9–13     | `"9 / 14"`        |
| Nav              | WORK label                     | 14–15    | `"14 / 16"`       |
| Nav              | rule WORK → APPROACH           | 16–21    | `"16 / 22"` (end inset 1.5rem) |
| Nav              | APPROACH label                 | 22–23    | `"22 / 24"`       |
| Nav              | rule APPROACH → CONTACT        | 24–28    | `"24 / 29"` (start + end inset 1.5rem) |
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
5. **Approach** (`#approach`) — lavender+ink. Desktop: one `.content-grid` vertically centred in the panel (`top: 50%` + `translateY(-50%)`; nav and footer are both 5rem, so this centres between them). Row 1 = "How I / work." cascade (cols 3–20) + [ Approach ] teaser in the body column (21–28: intro line + "Read the full approach" pill to `/approach`), teaser `alignSelf: end` like Contact's CTA. Row 2 = the 4 process steps as a horizontal row of cards (cols 3–28) styled to match the /approach Process cards via `approachSection.module.css`: 22px padding, 10px internal gap, 16px gutters, muted `[ 0N ]` label, Geist 700 19px title, hover invert (card fill = panel --fg, type = panel --bg; tokens swapped locally from a `--panel-bg/--panel-fg` snapshot on the `<ol>`), `data-cursor-color="local"` so the cursor contrasts with a hovered card. Each card is a plain `<a href={APPROACH_HREF}>` (full load to `/approach`, like the teaser pill) inside the `<li>`, which only carries the entrance fade; the link has `data-cursor="view"` (lens) but no `data-magnetic` (a card-sized magnet pulls the cursor oddly), and keyboard focus gets the same invert as hover. Keep the two card specs in sync. Entrance: headline `LetterCascade by="word" animate={false}` (rises in word by word on scroll-in, 0.12s steps), teaser rises in at 0.7s (RiseOn pattern), cards fade in one after another from 1.0s at `STAGGER.item` (Select Engagements pattern, opacity only). Mobile (`MobileApproachSection.tsx`) keeps its stacked list: same word cascade, rows fade in and rise 14px one by one from 1.1s (0.12s steps, 0.8s). Both share copy constants from `ApproachSection.tsx`.
6. **Contact** (`#contact`) — placeholder, not yet built.

**Active section detection**: `useSectionEntry(ref, () => setActiveSection(...), 0.5)` in `page.tsx`. Threshold 0.5. Re-fires on every entry (not one-shot) so scrolling back up restores schemes correctly.

## Auto-advance Navigation

Implemented in `page.tsx` global `useEffect`. Inputs:
- **Click anywhere** that isn't `a, button, [data-no-advance]` → next section
- **Keyboard**: ↓ / PgDn / Space / Enter → advance; ↑ / PgUp → retreat
- **Wheel**: deltaY ≥ 30 fires once per gesture; lock window 1800ms (2500ms on Work boundary). `preventDefault` is called on **every** wheel event so the page never scrolls into "no-man's-land" between snaps.

Section sequence: `loading → who → who-bio → work → approach → contact`. The Name → Work transition has the 650ms color-morph hold (see Color flow above).

**Mobile scroll container = `<main>`, NOT the document** (restored 2026-10-28). `<main>` is `height: 100dvh; overflow-y: auto` with `scroll-snap-type: y mandatory` + `scroll-padding-top: var(--m-nav-h)`; the document never scrolls. **Why — the Safari bar tint:** with the document still, iOS Safari 26 tints its status bar + toolbar from the html/body background, which `useColorScheme` sets instantly on every section change, so the bars follow the page. From Oct 19 to Oct 28 the document was the scroller (to fix stale bars after menu jumps); Safari then sampled whatever sat under the bars and stopped re-checking, and nothing fixed it — solid edge plates/strips (hidden, visible, mid-swipe, at rest), theme-color, scroll nudges and an invisible full-screen scroller all failed across five frame-sampled screen recordings. The user A/B-tested the Oct 19 builds on a phone: the inner-scroller one follows. **Don't move scrolling back to the document.** All mobile scroll code reads `main` (`main.scrollTop`, `main.scrollTo`, main `scroll` events, `getComputedStyle(main).scrollPaddingTop`, `main.clientHeight`); anchor tops add `main.scrollTop`; `PlanetMark` uses its default `scrollSource="main"`. **Gotcha:** body's global `overflow-x: hidden` makes `<body>` a scroll container, so sections snapped to body (which never scrolls) — MobileHome sets `body.style.overflowX = "clip"` while mounted. **Static geometry (no dvh):** iOS Safari's toolbar collapses/expands while you scroll; with `100dvh` panels every panel below (and every snap stop) moved mid-swipe, and Safari re-snapped to whatever was nearest — Work → Approach bounced back to Work or overshot to Contact (user's screen recording). Panels are now `100lvh` (Work `min-height: 100lvh`), their centred content boxes `calc(100svh - nav - foot)`, anchors `calc(100svh - nav)`; the tall-panel test compares against a `100lvh` probe (not `innerHeight`), and anchors only re-set when a stop actually moved. Keep new mobile panel sizes off `dvh`. **Snap anchors:** mobile panels are 100lvh but the snapport is 100dvh − nav (scroll-padding-top), so a panel *covers* the snapport and the browser accepted any stop in a 72px band (inconsistent landings). Panels get `scroll-snap-align: none` on mobile and MobileHome renders one invisible absolutely-positioned anchor per panel (measured `offsetTop`, ResizeObserver), exactly `calc(100dvh - var(--m-nav-h))` tall with `scroll-snap-align: start` + `scroll-snap-stop: always` — one deterministic stop per panel, panel top just below the nav (same as menu jumps / deep links). **Tall panels:** mobile Work is NOT its own scroller (`height: auto`, `min-height: 100dvh`, `overflow: clip`) — it grows with the project list and `<main>` scrolls through it. A panel taller than the screen gets an anchor as tall as the panel (measured in MobileHome alongside `top`; ResizeObserver on main + each panel + window resize): a snap area larger than the snapport lets the page rest anywhere inside, so Work scrolls natively and snaps only at its top / on to the neighbours. The old inner `100dvh` + `overflow-y: auto` scroller nested in the mandatory-snap scroller broke once the case-study list outgrew the screen (swipes scrolled the list a few px, then chained and snapped to the next panel). The drawer-open auto-scroll puts the opened row's header flush under the nav (clamped to Work's own stop): measured in a layout effect before paint, minus the height of any collapsing `[data-drawer]` above the row (so switching open projects lands right), then animated with framer `animate` writing `main.scrollTop` per frame (0.5s, `EASE`, same as the drawer) with snap suspended and restored to `'y mandatory'` 300ms after; a touch/wheel cancels it. Work's bottom padding is `--m-nav-h + --m-foot-h + WORK_RUNOUT` (30svh, open or closed): the panel sits below the nav, so the nav height counts; the run-out is open space under the list. **Leaving Work downward is JS-assisted:** from the end of a panel-tall snap area a normal swipe lands nearer Work's last position than Approach's stop, so mandatory snap pulled the page back (only a hard flick got through). MobileHome watches scroll; when a *downward* scroll settles (160ms) past Work's own stop with the list end (`[data-work-end]`) at least 12% of the screen above the footer — i.e. in the run-out — it calls `jumpTo('approach', true)`. **Coming back up:** an upward swipe from Approach can come to rest in that run-out (empty space under the list); when an *upward* swipe settles there, MobileHome smooth-scrolls (`main.scrollTo`, still inside Work's tall snap area) so the list end sits just above the footer. So both directions land on a frame: Work's list end or Approach's top. Arrivals at Work from above never trigger either. Section detection uses viewport coverage (`intersectionRect.height / rootBounds.height`, 0.05 thresholds), not `intersectionRatio`, since a tall section's own ratio never passes 0.5. The menu overlay blocks page scroll with `touch-action: none` + `overscroll-behavior: contain` (don't toggle overflow on html — iOS can jump). Menu jumps (`handleMenuSelect`) still cut colours to the destination (`jumpScheme` + `html.color-jump`, no CSS transitions) and jump instantly. **Phones cut, don't fade:** MobileHome injects a `<style>` while mounted (globals.css silently dropped the rule — Tailwind gotcha) that turns off the `.snap` and glass-tint (`[data-chrome-tint]`) colour transitions, so page, chrome and html/body all change colour in the same frame. **Glass tint must stay a gradient:** ChromeBackdrop's tint is a gradient `background` on the backdrop-filter layer (mask on the wrapper only — opaque-fill bug). **Never make it a solid `background-color`:** iOS Safari 26 tints its bars from a fixed edge element with a solid background-color, reads it once (first paint, or when a fixed overlay like the case-study tray mounts/unmounts) and freezes — commit 6782555 did that and the bars stuck on ink until a case study closed, then on that colour (2026-10-28 recording). With a gradient Safari tints from html/body, which follow the section. **Same rule for the case-study tray and its lightbox:** both are full-screen fixed layers, so their fills are `linear-gradient(c, c)` backgrounds, not background-color (as a solid ink layer the tray froze the bars on whatever colour sat under it at close — 2026-10-28 recording); MobileHome paints html/body + theme-color ink via `paintPageBg` (`lib/scroll.ts`) while the tray is open and restores the section bg on close. **Bar-tint strips (`[data-bar-edge]`):** Safari 26 tints from fixed elements within ~4px of the top/bottom edge (≥80% wide, ≥3px tall) with a solid background-color, and re-reads only when such elements mount/unmount — html/body are a fallback it sometimes stops tracking (2026-10-28 recording: bars stuck ink from Hello on, before any case study). MobileHome renders two 6px fixed strips (top: 0 / bottom: 0, z 75, above the tray) in the current bg (`edgeBg`, ink while the tray is open) keyed on the colour, so every colour change remounts them and forces a re-scan. Keep other solid-colour fixed layers off the edges so they don't compete. **History — this is the Oct 19 fix restored:** e6b69ef had safe-area edge plates keyed per scheme (the build the user A/B-tested as working); 092ca4f (Oct 20) removed them as "frosted glass chrome only" and the bars have lagged since. Don't remove the strips again. **Soft edges:** MobileChrome's glass uses `ChromeBackdrop bleed`, which extends the nav/footer glass out through the safe area to the screen edge — solid `--bg` there (matching the strip-driven bar tint), then a dense tint across the bar (88% → 78% → 62% of `--bg` at its inner edge, blur 20px, so nav/footer type stays legible over busy content) fading out in the run-out (still a gradient background, never background-color). The blur is full strength behind the whole bar and fades out over `GLASS_RUNOUT` (1.5rem) past its inner edge, so anything behind the header/footer is blurred. /approach's phone chrome doesn't bleed. **Run-out handoff is swipe-gated:** it only fires within 2.5s of a touchend whose finger moved >12px in the scroll's direction (up for the Approach glide, down for the list-end settle), and never while `[data-case-study-tray]` is open — layout changes (opening a case study) fired scroll events and jumped the page to Approach behind the tray, then on to Contact on close. **All programmatic panel jumps go through `jumpTo(id, smooth?)`** (planet tap via `MobileChrome onHome`, menu, deep links, intro): it sets `main.style.scrollSnapType = 'none'`, scrolls, restores it to `'y mandatory'` (NOT `''` — main's snap is an inline style, so clearing it removes snap entirely) after 600ms (1500ms smooth) and re-jumps once if the page was pulled back — iOS Safari re-snaps to the last-snapped panel when the toolbar resizes after a jump, which made the planet tap flash Loading then bounce back, and menu jumps stay put.

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
- **UAP fly-by** (`UfoFlyby`): occasional zoom-in / zip-away (first 30–90s after mount, then every 60–180s). Silhouette is re-rolled per appearance (never repeats back-to-back) from `components/starfield/uapShapes.ts` — Saucer, Tic Tac, Triangle, Orb, Cigar, Cube-in-sphere, Boomerang — drawn as **pixel sprites** to match the star frames: each is a 24×12 ASCII grid (`#` body, `+` shading, `o` halo, `f` faint fill, `*` white light, `=` dim light) rendered as 2×2 crisp-edged rects in a 48×24 viewBox, colour via `currentColor`. Edit or add grids there.

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

**Reel axis + tile ratio overrides**: `CaseStudyContent.reelDirection` overrides the desktop reel's group default (HIRED vertical, INSPIRED horizontal); the mobile reel is always vertical. `reelAspect` sets the tile ratio for `cover` reels on desktop and mobile (default `"16 / 9"`) — set it to the assets' own ratio so slides fill the width uncropped. Morning Brief uses `vertical` + `"8 / 5"` (slides 4800×3000, clips 3200×2000 — 2× and 4∕3× the 2400×1500 layout, for Retina and the lightbox; clips stop at 3200 wide so phones decode them in hardware).

**Mobile lightbox zoom is baked into layout size:** a CSS `scale()` on the `<img>` only magnified the bitmap iOS rasterised at fit-to-screen size (crunchy zooms). `ImageLightbox` scales with a transform only mid-pinch (`scale / committed`); on finger lift the zoom is committed into the image's width/height (`base × committed`, base = fit size measured on load), so WebKit re-rasterises the full-res file. 2D `translate`, no transition.

**Reel labels**: image `ReelItem`s take an optional `label`, rendered bottom-left on the case-study reel tile (desktop `ReelTileContent`, mobile `MobileCaseStudyPanel`) as `[ LABEL ]` in the audio hint's style: Geist Mono, uppercase, white with `mix-blend-mode: difference`, `pointer-events: none` so the lightbox click still lands. Used by Velvet Isles and Morning Brief (hero tile). Video items take `label` too, shown only when `hasAudio: false` (the audio hint uses the same bottom-left spot) — Morning Brief's hero is a looping silent MP4 with a label.

## Approach page (`/approach`)

Standalone route (`app/approach/`), not a snap panel. Plain scrolling page built with a CSS module (`approach.module.css`) so its `@media` rules stay out of globals.css (see Build Gotcha #1).

- **Palette**: the homepage two-scheme system in lavender. Bands alternate `.light` (ink on lavender = "approach") and `.dark` (lavender on ink = "approachIntro"): nav/hero L, Foundation D, Philosophy L, Process D, Influences L, marquee D, In Practice L, Contact D. Each band sets local `--bg`/`--fg`/`--muted` and carries `data-scheme`.
- **Cards**: every section's items (Foundation/Influences columns, Philosophy tenets, Process steps) share one card: no fill, 1px `--fg` stroke, square corners — the Work-row rule. **Exception — In Practice project cards** are inverted: charcoal fill with lavender type (the dark scheme scoped to `.projects .proj`) on the lavender band. The In Practice band also carries the homepage StarField behind its content (`.starBand` / `.stars`, `--fg` at 0.4 opacity): 48 stars, `gapScale={0.4}` (shorter invisible gaps = faster twinkle) and `avoid="article"` so stars are placed in the margins and gutters instead of hidden under the opaque cards. `gapScale` and `avoid` are optional StarField props (defaults unchanged elsewhere). **Hover invert** (pointer devices only): every card swaps scheme on hover — outlined cards on light bands go ink-filled with lavender type, on dark bands lavender-filled with ink type, and the charcoal In Practice cards go lavender with ink type (local `--bg/--fg/--muted` redefined, 0.3s ease). **Cursor colour on /approach is local:** every `[data-scheme]` band and every card carries `data-cursor-color="local"` (cards via `Reveal cursorColor="local"`). MagneticCursor resolves `local` to the element's own computed `--fg`, so the cursor contrasts with whatever is under it — band, or hover-inverted card — instead of the page-level scheme, which ApproachTint takes from the band at the viewport's middle (that mismatch made the cursor vanish over the lavender header when a dark band filled the middle).
- **Typography** mirrors the home page: body = `.text-body` sizes (Geist 400, `--fs-body`, 1.5; 16px under 768px), labels = `.text-label` (Geist Mono 13 uppercase 0.04em), section headers = "Select Work" style (Geist 700 30px), item names/tenets/quotes = project-row style (Geist 700 19px), nav = home nav labels (Geist 500 19px, 70% inactive, `[ ]` on the current page), display = Manrope 800 (hero −0.06em; CTA uses the Contact hero spec), email = Contact mailto pill, footer = home meta row. Manrope is reserved for the two display headlines.
- **Entrance motion** (scroll-in, once per element): "How I work." and "Let's make things happen!" use `LetterCascade by="word" animate={false}`; labels, section heads, the hero lede, the toolbox and contact copy use `Reveal` (client, `ApproachChrome.tsx`, RiseOn pattern: opacity + 20px rise); every card group (Foundation/Influences columns, tenets, steps, projects) uses `Reveal kind="fade"` with `0.15 + i * STAGGER.item` delays so cards cascade in one after another (Select Engagements pattern). `Reveal` keeps the element's own tag + className. Reveals fire on the **first pixel** in view (`amount: "some"`, +24px bottom margin to offset the pre-entrance y shift), and card delays are re-based per entry batch (`batchDelay`): a card scrolling in alone starts within 0.15s instead of waiting out its index stagger; cards entering together still cascade. On phones (`max-width: 767px`, checked after mount so SSR is unchanged) every `Reveal` — cards included — fades in **and rises 24px** over `DUR.slow` (0.8s); opacity-only fades read as blunt pop-ins in the stacked layout.
- **Nav planet** (`NavPlanet` in `ApproachChrome.tsx`): built like the homepage's docked MorphingPlanet — an `NRJPlanet` box at loading size (`min(60vw, 60vh, 720px)`) CSS-scaled down to `NAV_PLANET_PX` (113px), clipped to its circle, centred on a 44px slot, with the NRJ wordmark cascade, scroll-linked rotation and a 1.18× hover swell. **Don't render NRJPlanet natively at 113px**: it derives stroke weights from its on-screen scale, so an unscaled small box gets the heavy loading-screen strokes. Links to `/`. Nav row is 5rem tall to match the home nav.
- **`ApproachTint`** (client) is the page's `useColorScheme`: it sets root `--bg`/`--fg`/`--accent`, html/body bg and theme-color from the `[data-scheme]` band under the viewport's middle, so the cursor, mobile nav bar, overscroll and iOS status bar follow the section. Restores on unmount.
- **Mobile nav** (`ApproachMobileNav`, under 768px): the homepage MobileChrome bar — exported `PlanetMark` (`scrollSource="window"`) + `ChromeBackdrop`, hairline rule, Geist Bold `[ APPROACH ]` that opens `MobileMenuOverlay`; WHO/WORK/CONTACT load `/#who-bio` / `/#work` / `/#contact`. Replaces the desktop nav row; content uses `--m-gutter`.
- **Footer** (`ApproachFooter`): the homepage fixed meta row, not a page band — desktop = DesktopHome footer (5rem, masked blur + 45% `--bg` tint, cols 3–17 SENIOR VISUAL DESIGNER / rule / AVAILABLE FOR WORK, (c) 2026 at cols 29–30); phones = MobileChrome footer (`ChromeBackdrop`, SENIOR DESIGNER — AVAILABLE FOR WORK — © 2026). Coloured by the root tokens ApproachTint sets; `.page` has bottom padding so Contact clears it.
- **Project links** use the home page's case-study deep links (`/#<item-slug>`, e.g. `/#liquid-challenger-index`). Keep the hrefs in `PROJECTS` in sync with item slugs in `content/projects/*.ts`. Velvet Isles links to `/#velvet-isles`, Morning Brief to `/#morning-brief` (project file `content/projects/morning-brief.ts`, item 07, first under INSPIRED). In Practice is six cards in a 2-column grid: Liquid Website UX, Challenger Index, Revolutionary Change, Velvet Isles, Morning Brief (self-initiated newsletter; links to its case study — the newsletter repo itself is private), Personal Portfolio. Morning Brief's reel mockups use stand-ins for the article photos (Food: real CC0 / CC BY / Unsplash photos, credited in the case study's CREDITS; elsewhere AI stand-ins); its hero tile carries the reel label saying so — keep that label if the reel is reordered. Mockups are rendered in the newsletter's section palette (the `morning-brief` repo's `feeds.py` PALETTE) — rebuild them if that palette changes. Contact carries an availability line (brand, web, retainer work for small teams, startups, agencies).
- **Marquee** is `ScrubMarquee` (`ApproachChrome.tsx`): Work-row type and ★ separators via the exported `renderMarqueeSegment`, driven by the site's rAF scrub pattern — 56px/s drift, pause on hover (desktop reels), horizontal wheel/trackpad scrub (vertical wheel left to the page), touch drag + flick inertia (mobile Work marquee constants). Don't swap it for a CSS `@keyframes` marquee — those failed to animate in production builds. It renders as many segment copies as the band width needs (`ceil(band / segment) + 1`, re-measured via ResizeObserver) and wraps by one segment's width, so wide screens never show blank space at the end of the strip.
- **Cursor**: every link/button (nav labels, case-study links, email pill, copy button, planet) carries `data-cursor="view" data-magnetic` — MagneticCursor only expands to the lens on `[data-cursor="view"]`, so new interactive elements need the attribute too.
- Links back to `/` are plain `<a>` (full load) on purpose: the home page reads its hash and runs its intro/snap setup on a fresh mount. Both homes (DesktopHome, MobileHome) accept **section deep links** — `/#who`, `/#who-bio`, `/#work`, `/#approach`, `/#contact` (`SECTION_HASHES`) — read once at first render, jump straight to that panel (planet pre-docked on desktop, loading intro skipped), then clear the hash. Case-study slugs (`/#<item-slug>`) still open the tray on Work. **Gotcha:** page.tsx paints DesktopHome first and swaps to MobileHome after mount on phones, so DesktopHome must not clear a section hash on phones — its case-study URL sync only clears the hash when it holds a case-study slug, and the section jump skips itself under 768px.
- **Nav entry**: APPROACH sits between WORK and CONTACT in the desktop `Nav` (label centres on grid lines 8 / 15 / 23 / 30 — a symmetric 7 / 8 / 7 split) and in `MobileMenuOverlay` (lavender highlight). It scrolls to the homepage `#approach` snap panel like the other labels; that panel's pill links on to `/approach`.

**Work → Approach → Contact transitions** (DesktopHome): each exit uses the pre-scroll invert pattern. Leaving Work sets `workExitingToApproach` (holds "name"/"nameMint" for 900ms, then scrolls; `approachTop` drives "approachIntro" → "approach"). Leaving Approach sets `approachExitingToContact` (holds "approachIntro" for 900ms, then scrolls; `contactTop` drives "contactIntro" → "contact"). Both flags clear on arrival or abort, and in the snap safety net. Retreating from Approach lands on Work with the accordion closed; retreating from Contact lands on Approach. Approach → Contact gets the same 1600/2400ms wheel lock as the last-project → next-section step.
- At the narrowest desktop widths (~800px) label→rule gaps drop to ~10px, slightly under the bracket overhang — same as the three-label nav before it.

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
