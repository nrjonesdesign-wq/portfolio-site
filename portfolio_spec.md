# NRJ Portfolio — Build Spec

A senior visual designer's portfolio site for Nathaniel Robert Jones. Single-page experience with a strong narrative, scroll-driven section transitions, and per-section color identity. This document is intended as a kickoff brief for Claude Code.

---

## 1. Global Principles

### Layout & navigation
- **Single page**, scroll-driven. There are five logical sections: **Loading → Who → Work → Contact**, with Work containing nested project cards.
- **Fixed top nav** with the rotating NRJ logo (top-left) and three labels: `WHO`, `[ WORK ]`, `CONTACT`. The label for the section the user is currently in gets wrapped in `[ brackets ]`. Horizontal lines connect the labels and animate in left-to-right when first revealed.
- **Footer meta-row** (fixed at bottom): `SENIOR DESIGNER` ────── `AVAILABLE FOR WORK` ────── `(C) 2026`. Animates in the same left-to-right, element-by-element pattern as the nav.
- **Progress indicator**: small subtle vertical bar on the right edge of the viewport that moves up and down with scroll position, indicating progress through the page.

### Section color system
Each section has its own highlight/accent color. When the user enters a section (scroll position crosses its top boundary), the page's color tokens swap and any dark-on-light / light-on-dark inversion happens at that moment. Use a short cross-fade rather than a hard cut.

**Palette:**

| Token | Hex | Role |
| --- | --- | --- |
| `--sage` | `#D7DAAC` | warm pale sage — Loading + Who accent |
| `--ink` | `#151515` | near-black — primary dark surface and dark-mode text foil |
| `--sky` | `#94D9F3` | soft sky blue — Work / HIRED accent |
| `--mint` | `#A8D8B9` | pale mint — Work / INSPIRED accent |
| `--coral` | `#EC7A55` | warm coral — Contact accent |

**Per-section assignment:**

| Section | Background | Foreground | Accent |
| --- | --- | --- | --- |
| Loading (initial) | `--sage` | `--ink` | `--ink` |
| Loading (post-scroll, inverted) | `--ink` | `--sage` | `--sage` |
| Who | `--ink` | `--sage` | `--sage` |
| Work — HIRED | `--ink` | `--sky` | `--sky` |
| Work — case study cards (HIRED) | `--ink` | `--sky` | `--sky` |
| Work — INSPIRED | `--ink` | `--mint` | `--mint` |
| Work — case study cards (INSPIRED) | `--ink` | `--mint` | `--mint` |
| Contact (initial) | `--ink` | `--coral` | `--coral` |
| Contact (inverted) | `--coral` | `--ink` | `--ink` |

### Typography
Three-typeface system. Each role is non-overlapping. Detail and Tailwind/`next/font` wiring lives in `CLAUDE.md`; the short version:

- **Manrope ExtraBold (800)** — display only. The hero words (`Hello`, `Nathaniel Robert Jones`, `Let's make things happen!`) and project titles. Architectural scale, tight tracking (`-0.04em` to `-0.06em`), tight leading (`90–95%`).
- **Geist Regular (400)** — body copy. `19px / 150%`, never uppercase, never below 19px for paragraphs.
- **Geist Mono Regular (400)** — every label, tag, and meta strip. `[ WHO ]`, `[ PROJECT ]`, `[ SCROLL ]`, `SENIOR DESIGNER`, `AVAILABLE FOR WORK`, `(C) 2026`, year ranges, project numbers, discipline tags. Always uppercase, `12–13px`, `letter-spacing: 0.04em`. Brackets are typed as literal characters.

Don't introduce a fourth typeface. Don't add Manrope weights below 800. The contrast between Manrope's architectural display, Geist's readable prose, and Geist Mono's small uppercase labels is the editorial texture of the site.

### Animation language
A single shared vocabulary used throughout. Treat these as the "primitives" — every animation in the doc below is built from them.

- **Rise-on**: element starts ~20px below its final position with `opacity: 0`, eases up and in. Used for paragraph blocks and headlines.
- **Letter cascade**: per-letter version of rise-on, each letter rising up from a **baseline horizon** at the bottom of its final position — letters appear to rise into existence rather than fade in. Each letter starts just after the previous one becomes visible. Used on the giant display headlines (`Hello`, `Nathaniel Robert Jones`, `Let's make things happen!`) and on the `NRJ` wordmark inside the planet.
- **Rule draw**: horizontal lines draw on left-to-right. Used on all the connecting nav lines and divider rules.
- **Sequence reveal**: a group of elements (e.g. nav labels + their connecting rules) plays rise-on / rule-draw **consecutively**, not as a simultaneous stagger — each step waits for the previous to complete (or near-complete with a small overlap). Order: top-to-bottom, left-to-right.
- **Color invert**: section background and text colors cross-fade between dark and light variants. Triggered by entering a section.
- **Card swap (horizontal)**: outgoing element slides off to the left, incoming element slides in from the right. Used between project cards within a section.
- **Section swap (vertical)**: standard scroll. Used between top-level sections.
- **Marching ants**: a series of dots that cascade in one direction continuously, suggesting movement or scroll cue. Used on the `[ SCROLL ]` indicator's vertical dotted line.
- **Sprite cycle**: a discrete frame swap (no tween between frames) used for the star field's pixel-art twinkle. See Star field subsection in Loading.

Easing:
- **Default ease-out** (most animations): `cubic-bezier(0.22, 1, 0.36, 1)`. Use for rule draws, color inverts, paragraph reveals, card swaps.
- **Spring-style ease with overshoot** (entrances that land): `cubic-bezier(0.34, 1.56, 0.64, 1)`. Use for the planet entrance, the `Hello` letter cascade, and other "lands with a bounce" moments.

Exact durations can be dialed in later — start in the 400–800ms range and tune to taste.

### Persistent ambient details
- **Star field**: discrete-frame sprite cycle in negative space across all sections. Full spec lives in §3 Loading → Star field. The field is on every section, not just Loading; stars take the current section's accent color so they invert with everything else.
- **NRJ logo** (top-left, after the loading sequence) rotates clockwise as the user scrolls — a small amount per scroll delta.
- The top nav's connecting lines remain visible and the active section's label stays bracketed.

---

## 2. Signature Effects

Three effects are signature details that recur throughout the site.

### 2.1 Frosted glass nav blur
- **Reference**: evenodd.studio/quinnwhitneywilson
- **Where**: the fixed top navigation bar.
- **Tech**: CSS only — `backdrop-filter: blur(16px) saturate(160%)` with a semi-transparent background tint that matches the current section. Include `-webkit-backdrop-filter` for Safari.
- **Behavior**: as content scrolls underneath, it blurs through the nav. The tint should pick up the current section's background so it reads cohesively. Fall back to a flat semi-opaque background where `backdrop-filter` isn't supported.

### 2.2 Subtle chromatic aberration on project hovers
- **Reference**: dionpieters.dev
- **Where**: project thumbnails inside the Work section's accordion list, and the case study image reels.
- **Tech**: lightweight CSS only — **not** WebGL. Achieve with stacked pseudo-elements using `mix-blend-mode: screen` in red/green/blue offsets, or a `filter: drop-shadow()` chain. Animate the offset distance from 0 to ~2px on hover.
- **Behavior**: a whisper of RGB split appears on hover and recedes on hover-out. Subtle — the user should feel it more than see it. Ease in and out with the same curve as the rest of the site.

### 2.3 Context-aware magnetic cursor
- **Reference**: posterco.tv
- **Where**: site-wide on devices with a mouse (gate behind `(hover: hover) and (pointer: fine)` — fall back to native cursor on touch).
- **Tech**: `cursor: none` on `body`, custom cursor element positioned with `transform: translate3d(...)`, JS lerp-follows the real mouse position each frame for a slightly trailing feel. State is class-toggled on the cursor element based on what's underneath.
- **States**:
  - **Default**: small filled dot, current accent color.
  - **Project hover**: scales up into a circle containing the word `VIEW`.
  - **Link / button hover**: scales up slightly, no label.
  - **Text hover**: morphs into a thin vertical I-beam.
- Magnetism: when near an interactive element, the cursor's lerp target snaps a few px toward the element's center, giving the "magnetic" feel.

---

## 3. Page-by-Page Animation & Interaction Notes

### Section 1 — Loading (intro)

#### Composition

Match these proportions; they define the visual identity of the opening frame.

- **Planet** (the circle containing `NRJ`): roughly **25% of viewport height**, vertically centered, **slightly right of horizontal center** (~55% from left). The circle is a 2D vector — fill matches the page background (`--sage` in light mode, `--ink` in dark), stroke is `--ink` (light) or `--sage` (dark), stroke width matches the ring stroke width.
- **Rings**: extend roughly **1.5× the planet's diameter on each side**. They **orbit through the planet**, not around or behind it — each ring's elliptical path crosses the planet's silhouette so that parts of the ring pass in front of the planet and parts pass behind it. Reference: the way electron orbits are typically drawn around an atomic nucleus, or the woven look of a Spirograph pattern. **Not** concentric Saturn-style bands sitting in front of the planet as a flat layer.
- **Ring count and offset**: 3–5 rings, each at a different rotation angle and a slightly different aspect ratio (some more circular, some more elongated), so the overall pattern reads as a tangled orbital cluster rather than a tidy stack.
- **Wordmark** (`NRJ`) sits centered inside the planet in Manrope ExtraBold, sized to fill ~60% of the planet's diameter. The wordmark sits *above* the rings — wordmark is always fully visible, rings pass behind it where they cross the planet's interior.
- **Star field**: scattered across all negative space; see star spec below.

#### State A — initial load (light mode)

Background: `--sage`. Foreground (planet stroke, wordmark, stars): `--ink`.

**Planet entrance:**
- Planet scales from `0%` to `100%` with a soft bounce on settle (overshoot ~5%, settle back). Anchored at its final position — it grows in place, doesn't translate. Use a spring-style ease (try `cubic-bezier(0.34, 1.56, 0.64, 1)` as a starting point and tune).
- The `NRJ` wordmark inside the planet rises into view via **letter cascade** as the planet finishes settling.

**Ring draw-on:**
- Each ring traces on along its elliptical path with a **gradient stroke**: the leading edge is fully opaque, the tail fades to transparent at the same rate the leading edge advances. The visual effect: a comet-like streak orbiting the planet, drawing the ring as it goes while erasing it from behind. The ring's "head" chases its own "tail" around the orbital path — the ring is never fully drawn at any single moment, it's always partially visible as a fading streak.
- Because each ring's path **passes through the planet**, the streak naturally weaves in front of and behind the planet's circle as it orbits — front when the path crosses the near side of the planet, behind when it crosses the far side.
- Multiple rings (3–5), each offset in rotation and aspect ratio (Spirograph-like), draw on in staggered succession and continue looping. Don't pause them after the entrance — the rings remain in perpetual motion as long as the loading screen is visible. The weave between rings + planet should feel alive, not synchronized.

**Star field:**
- See "Star field" subsection below — same spec across all dark-mode and light-mode sections.

#### State B — on first scroll or click

Triggered by either: any scroll input, or a click anywhere on the screen.

1. **Color invert** (cross-fade, ~400ms): page background goes from `--sage` to `--ink`. Planet stroke, wordmark, and stars cross-fade from `--ink` to `--sage`. Use the same timing curve as the section-entry color invert primitive.
2. **Planet morphs to nav logo** (immediately after the color invert begins, slight overlap): planet shrinks and translates to its final position in the top-left nav. End state: planet is roughly **1/12th** the size of the loading-screen planet, positioned in the nav's logo slot. The rings shrink with it, ending at the same proportion.
3. **Site enters main scroll experience** — the Who section's entry sequence begins (see Section 2).

The morph is one continuous motion, not a fade-out-then-fade-in. The planet you see in the loading screen is literally the same element that becomes the nav logo.

### Star field

The star field is a key piece of ambient texture — visible across every section, subtle but always present.

**Aesthetic**: 8/16-bit / SNES-era video game (think Toby Fox / Undertale). Crisp, vector, no anti-aliased twinkle — frames swap discretely.

**Sprite cycle**: each star runs through this sequence and loops (or fades out and re-spawns elsewhere):

```
invisible → dot → small star → large star → small star → dot → invisible
```

Frames are **discrete** — the star snaps from one shape to the next, no tween between. This is what gives it the pixel-art rhythm rather than a smooth twinkle.

**Implementation**:
- Define three SVG `<symbol>`s in a hidden `<svg>` at the root of the page: `#star-dot`, `#star-small`, `#star-large`. Reuse via `<use href="#star-..." />`.
- Each star instance is a `<use>` element positioned absolutely in the star field. The `href` attribute swaps between the three symbols on a per-star timer (or "invisible" — `display: none` or `opacity: 0`).
- Spawn ~30–60 stars (tune to feel right) randomly across the viewport. Re-randomize positions when stars complete a full cycle so the field doesn't feel static.
- Stagger each star's timing so the field is always partly active. Frame durations roughly: dot 200ms → small 200ms → large 300ms → small 200ms → dot 200ms → invisible 400–1200ms (randomized).
- Color: stars take the current foreground accent (`--accent` or `--fg` — match the live section color so they invert with everything else).

**Performance note**: render the whole star field inside one absolutely-positioned `<svg>` overlay rather than dozens of separate elements. The state machine for each star runs in JS but the DOM stays cheap.

### Section 2 — Who (`Hello` → bio)

**Entry state (immediately following the Loading → Who color invert and planet morph):**

The nav and headline don't animate on simultaneously — they reveal **consecutively** in this order:

1. **Top nav builds left to right, element by element.** `WHO` label appears (rise-on), then the rule to its right draws on left-to-right, then `WORK` appears, then its rule draws on, then `CONTACT` appears. Each step waits for the previous to complete (or near-complete with a small overlap) — not a simultaneous stagger.
2. **`Hello` headline**: each letter rises up from below an invisible **baseline horizon** with a gentle bounce on settle. `H` first, then once it's settled, `e` begins, then `l`, `l`, `o`. The horizon is the bottom of each letter's final position — letters appear to rise into existence rather than fade in. Use the same spring-style easing as the planet entrance.
3. **Right-column intro paragraph** (`I'm Nathaniel Robert Jones…`): fades and rises in as a single block once `Hello` is fully settled.
4. **`[ SCROLL ]` cue** appears at the right edge, vertically centered: rise-on the `[ SCROLL ]` label, then the dotted vertical line beneath it animates on with **marching ants** — dots cascade downward continuously, suggesting scroll direction. The whole `[ SCROLL ]` cluster has a subtle hovering bounce loop (a gentle up-down translation of ~4–6px) to draw the eye.
5. **Bottom meta-row** (`SENIOR DESIGNER ─── AVAILABLE FOR WORK ─── (C) 2026`) builds left-to-right in the same element-then-rule pattern as the top nav.

Stars continue their sprite cycle in the negative space throughout.

**On scroll (Who detail):**
- `Hello` fades out and rises off the top of the screen, replaced by the multiline `Nathaniel Robert Jones` headline that animates on **one line at a time**.
- `[ WHO ]` brackets appear around the `WHO` nav label to indicate the active section.
- Right column paragraphs appear in order: `[ INTRO ]` label, top paragraph, then the next paragraph.
- The `Select elements` block (`FREELANCE SERVICES`, `LIQUID AGENCY`, `NIFTY'S`, `BLOOMBERG LP` with date ranges) animates in top-to-bottom, one row at a time, each rule drawing on left-to-right.
  - These are **not links** — they're metadata only.
- Stars continue to twinkle occasionally in the negative space.

### Section 3 — Work

**Section entry:**
- Highlight color shifts to `--sky`.
- `[ WORK ]` brackets appear around the `WORK` nav label.
- The accordion-style project list appears with the same top-to-bottom, left-to-right sequence reveal: the `HIRED` label first, then each project row (`BLOOMBERG LP`, `LIQUID AGENCY`, `REVOLUTIONARY CHANGE`), then the `INSPIRED` label, then those rows (`TUESGAY`, `PAINTINGS`).
- Right column shows the `[ ABOUT ]` block — bio paragraphs.

**Per-tab interaction (HIRED projects):**
- On scroll, click, or hover into the first tab, that row inverts to **light text on a dark background** (`--sky` stays as accent).
- A video montage of work from that project starts autoplaying inside the now-dark row.
- The right-column text animates up and on, top-to-bottom, left-to-right: `01`, `[ PROJECT ]`, the project description, `VIEW WORK`.
- The `VIEW WORK` button grows slightly on hover.
- On click, a tray opens: current screen content slides off to the left while the case study slides in from the right (**card swap horizontal**).

**On entering INSPIRED projects:**
- Highlight color switches from `--sky` to `--mint` (page 25).
- Same accordion pattern, but the autoplaying media inside `INSPIRED` cards scrolls **right-to-left** instead of bottom-to-top, distinguishing personal work from client work.### Section 4 — Case Study Cards (within Work)

When the user enters a case study from a project tab:

**Entry:**
- Card slides in from the right (continuation of the card-swap from the project list).
- Left rail shows: project number (`01`, `02`...), title, three numbered tabs (`[ BRIEF ]`, `[ CHALLENGE ]`, `[ SOLUTION ]`), then `[ CLIENT ]`, `[ SERVICES ]`, `[ CREDITS ]` blocks.
- Right side displays an **auto-scrolling reel** of stills and videos, moving bottom-to-top on a loop. (Right-to-left for INSPIRED projects.)
- The three tab boxes (`BRIEF` / `CHALLENGE` / `SOLUTION`) are clickable. Clicking one navigates to that tab; the active tab inverts to dark-text-on-light.

**Between cards in the same case study:**
- Same vertical scroll, content updates per tab.

**Between projects in the same section:**
- Card swap horizontal: prior project slides off to the left, next slides in from the right.

**Exit:**
- The down-left arrow in the bottom-left of each case study card returns the user to the project list (the same accordion view they entered from).
- After the last project in a section is scrolled past, the project slides off to the right and **scroll resumes vertical orientation**, returning to the main page flow.

### Section 5 — Contact

**Entry:**
- Highlight color switches to `--coral`.
- Color inverts to dark-on-light (`--coral` background, `--ink` foreground).
- `[ CONTACT ]` brackets appear around the `CONTACT` nav label.
- The `Let's make things happen!` headline animates on with the same **letter cascade** as `Hello` did at the start.
- After it settles, the right-column CTA copy (`Have a project in mind? Want to hire me? Let's talk!`) and the `GET IN TOUCH` button rise in.

**Interaction:**
- `GET IN TOUCH` opens a `mailto:nrjones.design@gmail.com` link.

---

## 4. Open Decisions

These are intentionally left flexible — easier to dial in once there's something to react to.

- **Animation durations**: start in the 400–800ms range, tune by feel. Keep the curve consistent across the site.
- **Star density and twinkle frequency**: needs visual tuning so the field reads as alive but not distracting.
- **Magnetic cursor strength**: how strongly the cursor pulls toward interactive elements — tune until it feels confident but not jumpy.
- **Chromatic aberration intensity**: should be a whisper, not a statement.
- **Mobile / touch behavior**: the spec above assumes a pointer device. On touch, the magnetic cursor disables, hover effects collapse to tap states, and the nav-blur stays. Card swaps may benefit from swipe gestures in addition to scroll.
