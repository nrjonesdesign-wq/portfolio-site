"use client";

import { motion } from "framer-motion";
import LetterCascade from "@/components/primitives/LetterCascade";
import StarField from "@/components/starfield/StarField";
import { DUR, EASE } from "@/lib/motion";

/**
 * Mobile Contact panel.
 *
 * Coral bg / ink text. "Let's make things happen!" renders as three
 * letter-cascade lines (one per stack line in the PDF). Below, a
 * short CTA paragraph, a tap-to-email button (ink bg / coral text)
 * and an Instagram icon link. Star field provides the same ambient
 * texture as the rest of the page.
 */

const EMAIL = "nrjones.design@gmail.com";
const INSTAGRAM_HANDLE = "subtlefish";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

export default function MobileContactSection() {
  return (
    <section
      id="contact"
      className="snap"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        position: "relative",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      {/* Star field — same low-opacity overlay as Who / Work. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ color: "var(--fg)", opacity: 0.5 }}
      >
        <StarField className="w-full h-full" count={14} size={22} />
      </div>

      {/* 3-row grid: spacer / centred content / spacer — keeps the
          hero block vertically centred between the nav and the
          footer chrome regardless of phone height. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "calc(100dvh - var(--m-nav-h) - var(--m-foot-h))",
          display: "grid",
          gridTemplateRows: "1fr auto 1fr",
        }}
      >
        <div />

        <div
          className="m-content-grid"
          style={{ rowGap: "3.5rem" }}
        >
          {/* Hero — three lines of letter cascade so the break points
              land on the words shown in the PDF rather than wherever
              flex-wrap chooses. */}
          <div style={{ gridColumn: "1 / 9" }}>
            <LetterCascade
              text="Let's"
              as="div"
              animate
              delay={0.1}
              className="text-hero"
              style={{
                color: "var(--fg)",
                marginLeft: "-0.06em",
                // Manrope ExtraBold Contact hero. Sized so the longest
                // line ("make things") stays on ONE line within the
                // content span at the wider 2rem gutter — 13vw fits it
                // on common phones; capped at 4.25rem on larger widths.
                fontSize: "clamp(2.75rem, 13vw, 4.25rem)",
                lineHeight: 0.92,
              }}
            />
            <LetterCascade
              text="make things"
              as="div"
              animate
              delay={0.4}
              className="text-hero"
              style={{
                color: "var(--fg)",
                marginLeft: "-0.06em",
                // Manrope ExtraBold Contact hero. Sized so the longest
                // line ("make things") stays on ONE line within the
                // content span at the wider 2rem gutter — 13vw fits it
                // on common phones; capped at 4.25rem on larger widths.
                fontSize: "clamp(2.75rem, 13vw, 4.25rem)",
                lineHeight: 0.92,
              }}
            />
            <LetterCascade
              text="happen!"
              as="div"
              animate
              delay={0.85}
              className="text-hero"
              style={{
                color: "var(--fg)",
                marginLeft: "-0.06em",
                // Manrope ExtraBold Contact hero. Sized so the longest
                // line ("make things") stays on ONE line within the
                // content span at the wider 2rem gutter — 13vw fits it
                // on common phones; capped at 4.25rem on larger widths.
                fontSize: "clamp(2.75rem, 13vw, 4.25rem)",
                lineHeight: 0.92,
              }}
            />
          </div>

          {/* CTA copy + email button + social row. Rises in after the
              headline has finished cascading. Indented to cols 3–9
              per the design grid — the CTA cluster reads as a
              right-hung pull-quote beneath the cols 1–7 hero. */}
          <motion.div
            style={{
              gridColumn: "3 / 9",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "1.25rem",
            }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: DUR.base, ease: EASE }}
          >
            <p
              className="text-body"
              style={{
                color: "var(--fg)",
                textAlign: "left",
                maxWidth: "16rem",
                margin: 0,
              }}
            >
              Have a project in mind?
              <br />
              Want to hire me? Let&apos;s talk!
            </p>

            <a
              href={`mailto:${EMAIL}`}
              data-no-advance
              style={{
                display: "inline-block",
                backgroundColor: "var(--fg)",
                color: "var(--bg)",
                padding: "0.6rem 0.85rem",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--fs-label)",
                letterSpacing: "0.02em",
                textDecoration: "none",
              }}
            >
              {EMAIL}
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              data-no-advance
              aria-label={`Instagram @${INSTAGRAM_HANDLE}`}
              style={{
                color: "var(--fg)",
                display: "inline-flex",
                padding: "0.25rem",
                margin: "-0.25rem",
              }}
            >
              <InstagramGlyph />
            </a>
          </motion.div>
        </div>

        <div />
      </div>
    </section>
  );
}

function InstagramGlyph() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" />
    </svg>
  );
}
