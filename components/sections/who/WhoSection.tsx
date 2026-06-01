"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import LetterCascade from "@/components/primitives/LetterCascade";
import RiseOn from "@/components/primitives/RiseOn";
import MarchingAnts from "@/components/primitives/MarchingAnts";
import StarField from "@/components/starfield/StarField";
import { DUR, EASE, STAGGER } from "@/lib/motion";

/* ─── Copy (verbatim from PDF) ───────────────────────────────────────────── */

const INTRO =
  "I'm Nathaniel Robert Jones, an artist / designer with nearly 20 years of crafting compelling experiences.";

// Exported so WorkSection can render the same paragraphs as its right-column
// fallback when no project row is hovered. Two separate paragraphs because
// the lead sentence is bolded ("Senior Visual Designer") and the rest is the
// regular body weight.
export const INTRO_LEAD =
  "with nearly 20 years of experience combining creativity with technical skill and a refined aesthetic sensibility—informed by a personal artistic practice as a painter and musician, and fueled by an insatiable curiosity and love of culture.";
export const INTRO_BODY =
  "Specialized in helping organizations translate complex ideas into clear, compelling visual narratives, designing and applying brand systems, and creating polished, high-fidelity visual assets that bridge user experience with brand identity.";

/** Reusable [Intro] block — rendered on Name panel and as Work's
 *  right-column fallback. Animates in via whileInView so it scrolls in
 *  with the surrounding section instead of fading in via a fixed
 *  overlay. */
export function IntroBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-15%" }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
    >
      <span
        className="text-label"
        style={{
          color: "var(--accent)",
          display: "block",
          marginBottom: "0.5rem",
          transition: "color 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        [ Intro ]
      </span>
      <p
        className="text-body"
        style={{ color: "var(--fg)", marginBottom: "1rem" }}
      >
        <strong style={{ fontWeight: 600 }}>Senior Visual Designer </strong>
        {INTRO_LEAD}
      </p>
      <p className="text-body" style={{ color: "var(--fg)", opacity: 0.85 }}>
        {INTRO_BODY}
      </p>
    </motion.div>
  );
}

const ENGAGEMENTS = [
  { label: "Freelance Services", years: "2008 — Present" },
  { label: "Liquid Agency",      years: "2024 — 2025"   },
  { label: "Nifty's",            years: "2021 — 2022"   },
  { label: "Bloomberg LP",       years: "2015 — 2021"   },
];

/* ─── Shared layout constants ────────────────────────────────────────────── */

const GUTTER    = "var(--gutter)";
const NAV_H     = "var(--nav-h)";
const FOOT_H    = "var(--footer-h)";

// Per-section column placements — matches the annotated 32-col reference
// frames. Inclusive col-start, exclusive col-end (CSS Grid syntax).
const COL_HELLO       = "3 / 23";  // cols 3–22 — Hello headline
// Body-copy column used by Hello intro, Name intro, Work explore/items,
// and Contact CTA. Aligns left with the "W" of WORK in the top nav so the
// user reads a single consistent body-copy left edge across every screen.
const COL_HELLO_INTRO = "21 / 29"; // cols 21–28 — bio paragraph below Hello
const COL_NAME        = "3 / 16";  // cols 3–15 — Nathaniel/Robert/Jones (per PDF ref)
const COL_RIGHT       = "18 / 31"; // cols 18–30 — Select Engagements column (wider)

/* ─── Panel 1: Hello ─────────────────────────────────────────────────────── */

export function HelloPanel() {
  return (
    <section
      id="who"
      className="snap"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ color: "var(--fg)", opacity: 0.6 }}>
        <StarField className="w-full h-full" />
      </div>

      {/*
       * "Hello" — placed in cols 3-18 of the 32-col grid, vertically centered.
       * The grid container is absolutely positioned to span the panel width;
       * the headline picks its column placement via gridColumn.
       */}
      <div
        className="content-grid"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-52%)",
        }}
      >
        <div style={{ gridColumn: COL_HELLO }}>
          <LetterCascade
            text="Hello"
            as="h1"
            animate={false}
            delay={0.1}
            className="text-hero"
            style={{
              color: "var(--fg)",
              // Optical alignment: shift the headline left by a
              // fraction of its OWN em (var(--fs-hero), not the
              // inherited body em). Manrope ExtraBold's H carries
              // enough left side-bearing at hero scale that this
              // pulls the H stem onto the col-3 boundary — flush with
              // the planet's left edge in the nav and the S of
              // SENIOR DESIGNER in the footer.
              marginLeft: "-0.07em",
            }}
          />
        </div>
      </div>

      {/*
       * Intro paragraph — cols 23-30. Reveals last in the entry sequence
       * (after SCROLL cluster) and sits closer to the Hello headline so the
       * smaller 16px body type doesn't read as orphaned far below the H1.
       * Hello bottom is at ~50% + 0.48 × 25vw × 0.9 ≈ 10.8vw below centre;
       * a small fixed gap of +20px keeps it visually anchored to Hello.
       */}
      <div
        className="content-grid"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "calc(50% + 10vw + 20px)",
        }}
      >
        <motion.div
          style={{ gridColumn: COL_HELLO_INTRO }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 2.2, duration: DUR.base, ease: EASE }}
        >
          <p className="text-body" style={{ color: "var(--fg)" }}>
            I&apos;m{" "}
            <strong style={{ fontWeight: 600 }}>
              Nathaniel Robert Jones
            </strong>
            , an artist / designer with nearly 20 years of crafting
            compelling experiences.
          </p>
        </motion.div>
      </div>

      {/*
       * [ SCROLL ] indicator — right gutter, vertically centered. Static
       * outer wrapper handles position (translateY -50% to centre), inner
       * motion.button handles the gentle hovering bounce loop AND is now
       * clickable: a tap advances to the Name panel just like a wheel
       * gesture would. data-no-advance is on the button so the global
       * click handler doesn't double-fire.
       */}
      <div
        style={{
          position: "absolute",
          right: GUTTER,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <motion.button
          type="button"
          data-cursor="view"
          data-magnetic
          data-no-advance
          aria-label="Scroll to next section"
          onClick={() =>
            document
              .getElementById("who-bio")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            color: "var(--fg)",
            opacity: 0.55,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "inherit",
          }}
          initial={{ opacity: 0, y: 0 }}
          whileInView={{
            opacity: 0.55,
            y: [0, -5, 0],
          }}
          viewport={{ once: true }}
          transition={{
            opacity: { delay: 1.6, duration: DUR.base, ease: EASE },
            y: {
              delay: 1.6,
              duration: 2.4,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            },
          }}
        >
          <span className="text-sm">[ SCROLL ]</span>
          <MarchingAnts
            direction="down"
            length="2.5rem"
            spacing="0.45rem"
            dotSize="2px"
            speed={1.0}
            color="currentColor"
          />
          {/* Chevron — terminates the dotted line, points down */}
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            style={{ display: "block", marginTop: "-2px" }}
          >
            <path
              d="M1 1 L5 5 L9 1"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </div>
    </section>
  );
}

/* ─── Panel 2: Nathaniel Robert Jones + bio ─────────────────────────────── */

export function NamePanel() {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  // Vertically centre the Select Engagements + CV block in the gap
  // between the [INTRO] paragraph's bottom and the footer's top.
  // Measured (rather than a fixed offset) because the intro block's
  // height shifts with viewport width / font metrics. The relative
  // delta (intro.bottom − section.top) is valid regardless of the
  // panel's current scroll position, so this works even when the
  // panel is off-screen on first mount.
  const [engTopPx, setEngTopPx] = useState<number | null>(null);
  useEffect(() => {
    const compute = () => {
      const section = sectionRef.current;
      const intro = introRef.current;
      if (!section || !intro) return;
      const sectionTop = section.getBoundingClientRect().top;
      const introBottom = intro.getBoundingClientRect().bottom - sectionTop;
      const footer = document.querySelector("footer");
      const footH = footer ? footer.getBoundingClientRect().height : 0;
      const footerTop = section.clientHeight - footH;
      setEngTopPx((introBottom + footerTop) / 2);
    };
    const t = window.setTimeout(compute, 120);
    window.addEventListener("resize", compute);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="who-bio"
      className="snap"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{ color: "var(--fg)", opacity: 0.6 }}>
        <StarField className="w-full h-full" />
      </div>

      {/* Whole composition centred vertically between the nav and footer.
          Inside, Name (left, cols 3-15) and Intro (right, cols 23-30) align
          their tops so Nathaniel's cap sits at the BIO body's x-height; the
          [ INTRO ] eyebrow sits above. Engagements anchor below the centred
          block with breathing room. */}
      <div
        className="content-grid"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `calc(${NAV_H} + 0px)`,
          bottom: `calc(${FOOT_H} + 0px)`,
          // alignItems: start so the Name column and the Intro column
          // share a top edge. The Intro body's first line then reads as
          // top-aligned with Nathaniel; the [ INTRO ] eyebrow sits above
          // that shared top via the negative margin below.
          alignItems: "start",
          paddingTop: "calc((100vh - var(--nav-h) - var(--footer-h)) / 2 - 18vw)",
        }}
      >
        {/* Left column: Name stack */}
        <motion.div
          style={{ gridColumn: COL_NAME }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DUR.base, ease: EASE }}
        >
          <h2 className="text-name" style={{ color: "var(--fg)" }}>
            Nathaniel
          </h2>
          <OutlineName word="Robert" />
          <OutlineName word="Jones" />
        </motion.div>

        {/* Right column: [Intro] paragraphs. Scrolls in with the section
            via whileInView (replaces the previous fixed-position overlay
            that fade-cross-faded between Name and Work). */}
        {/* INTRO column aligned under the "W" of WORK in the top nav so the
            user reads a consistent left edge for the body copy column
            across Name → Work → Contact. */}
        <div ref={introRef} style={{ gridColumn: "21 / 29" }}>
          <IntroBlock />
        </div>
      </div>

      {/* Select Engagements — sits ~6rem below the centred intro paragraph.
          Was 12rem; with the body type now at 16px the intro block ends
          higher up the page, and the engagements module no longer needs
          a big offset to clear it. The .engagements-fade class binds
          opacity to a runtime CSS var so the list fades out in place when
          the colour shifts toward Work (see app/page.tsx). */}
      <div
        className="content-grid engagements-fade"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          // Centred in the gap between the intro paragraph and the
          // footer once measured; falls back to the previous fixed
          // offset before the first measurement settles.
          top: engTopPx != null ? `${engTopPx}px` : "calc(50% + 6rem)",
          transform: engTopPx != null ? "translateY(-50%)" : undefined,
        }}
      >
        <RiseOn
          delay={0.35}
          style={{ gridColumn: COL_RIGHT }}
        >
          <h3
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.875rem", // 30px — Geist Bold 30
              fontWeight: 700,
              color: "var(--fg)",
              marginBottom: "1rem",
              letterSpacing: "-0.01em",
            }}
          >
            Select Engagements
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {ENGAGEMENTS.map(({ label, years }, i) => (
              <motion.div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * STAGGER.item, duration: DUR.base, ease: EASE }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8125rem", // 13px
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--fg)",
                    flexShrink: 0,
                  }}
                >
                  {label}
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: "var(--fg)", opacity: 0.35 }} />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8125rem", // 13px
                    fontWeight: 400,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--fg)",
                    opacity: 0.7,
                    flexShrink: 0,
                  }}
                >
                  {years}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Download CV — bracketed mono link, right-aligned beneath
              the engagements list (mirrors the mobile Name panel),
              with a nav-style hover underline. */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "1.5rem",
            }}
          >
            <DownloadCVLink />
          </div>
        </RiseOn>
      </div>
    </section>
  );
}

/**
 * [ Download my CV ] link with a nav-style hover underline — a 1px
 * var(--fg) line anchored under the text that scales in from the left
 * on hover (scaleX 0 → 1, 0.25s ease-out), matching the nav labels.
 */
function DownloadCVLink() {
  const [hover, setHover] = useState(false);
  return (
    <a
      href="/resume.pdf"
      target="_blank"
      rel="noreferrer"
      data-no-advance
      data-cursor="view"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: "var(--font-mono)",
        fontSize: "0.8125rem", // 13px
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "var(--fg)",
        textDecoration: "none",
        paddingBottom: "0.18em",
      }}
    >
      [ Download my CV ]
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          backgroundColor: "var(--fg)",
          transformOrigin: "left center",
          transform: hover ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </a>
  );
}

/**
 * Outlined name word — uses CSS text-stroke with paint-order: stroke fill.
 * The paint-order rule tells the browser to draw the stroke first and the
 * fill on top, which fixes the artifact where the stroke ends up "inside"
 * complex extra-bold glyphs (the prior bug user reported).
 */
/**
 * Outlined name word — "hollow letter" technique. Two stacked copies of
 * the same text:
 *   - Bottom: solid var(--fg) at full size.
 *   - Top:    solid var(--bg), scaled to ~96% of full size.
 *
 * The 4% size difference leaves a thin band of fg color around each glyph
 * silhouette, reading as a single clean outline. Crucially, counter holes
 * (the inside of an "o", "R" loop, "b" bowl, etc.) get covered by the
 * bg-coloured top layer — so they render as page background, NOT as
 * separately outlined shapes. This sidesteps the -webkit-text-stroke and
 * SVG-stroke artifacts that drew strokes through every glyph sub-path.
 */
/**
 * Outlined name word — fill = page background, stroke = section accent.
 * The stroke morphs from yellow (sage) to blue (sky) when scrolling
 * approaches the Work section because var(--accent) is updated globally.
 */
function OutlineName({ word }: { word: string }) {
  // Manrope ExtraBold's r→t pair collides at heavy display sizes. Wrap a
  // surgical span around the trailing letter of any "rt" sequence and
  // give it a touch of margin-left so the two glyphs clear without
  // loosening the rest of the word's tracking.
  return (
    <div
      className="text-name text-name-outline"
      aria-label={word}
      role="img"
      style={
        {
          color: "var(--bg)",
          WebkitTextStrokeWidth: "1px",
          WebkitTextStrokeColor: "var(--accent)",
          paintOrder: "stroke fill",
          letterSpacing: "-0.04em",
        } as React.CSSProperties
      }
    >
      {kernPairs(word)}
    </div>
  );
}

/** Apply per-pair manual kerning. Currently only handles "rt" — that's
 *  the one collision in "Robert" at this size. Extend if more pairs need
 *  it later. */
function kernPairs(word: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let i = 0;
  let chunkStart = 0;
  while (i < word.length - 1) {
    const pair = word.slice(i, i + 2).toLowerCase();
    if (pair === "rt") {
      parts.push(word.slice(chunkStart, i + 1));
      parts.push(
        <span key={i} style={{ marginLeft: "0.04em" }}>
          {word[i + 1]}
        </span>
      );
      chunkStart = i + 2;
      i += 2;
    } else {
      i += 1;
    }
  }
  if (chunkStart < word.length) parts.push(word.slice(chunkStart));
  return parts.length ? parts : word;
}

/* ─── Composed export ────────────────────────────────────────────────────── */

export default function WhoSection() {
  return (
    <>
      <HelloPanel />
      <NamePanel />
    </>
  );
}

