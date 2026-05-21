"use client";

import { motion } from "framer-motion";
import LetterCascade from "@/components/primitives/LetterCascade";
import StarField from "@/components/starfield/StarField";
import { DUR, EASE } from "@/lib/motion";

/* ─── Copy ──────────────────────────────────────────────────────────────── */

const CTA_LINES = ["Have a project in mind?", "Want to hire me? Let's talk!"];
const EMAIL = "nrjones.design@gmail.com";
const INSTAGRAM_HANDLE = "subtlefish";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

/* ─── Layout constants ──────────────────────────────────────────────────── */

const COL_HERO = "3 / 21";  // hero spans 18 outer cols — ends where the body-copy column begins
const COL_CTA  = "21 / 29"; // CTA aligned with the universal body-copy column (Hello intro / Name [INTRO] / Work EXPLORE all sit at 21–28)

/* ─── Section ───────────────────────────────────────────────────────────── */

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="snap"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Star field — same low-opacity overlay as the WHO panels. The
          coral background reads bright enough that the stars register as
          subtle "winks" rather than dominating the surface. */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{ color: "var(--fg)", opacity: 0.4 }}
      >
        <StarField className="w-full h-full" />
      </div>

      {/* Hero — "Let's make things happen!" as two letter-cascade lines.
          Rendered as two separate cascades so the line break happens at a
          word boundary rather than wherever flex-wrap decides. Sized down
          from 117px so the headline doesn't crowd the right-column copy;
          the gap between headline and CTA reads as deliberate negative
          space rather than packed type. */}
      <div
        className="content-grid"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "42%",
        }}
      >
        <div
          style={{
            gridColumn: COL_HERO,
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            // Manrope ExtraBold 88px / 90% line-height.
            fontSize: "88px",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            color: "var(--fg)",
          }}
        >
          <LetterCascade text="Let's make" as="div" animate delay={0.2} />
          <LetterCascade text="things happen!" as="div" animate delay={0.7} />
        </div>
      </div>

      {/* Right column — CTA copy + email/Instagram row. The BUTTON's
          BOTTOM aligns with the headline's bottom (last line "things
          happen!" baseline). Stack heights:
            copy block       ≈ 42 px  (2 lines × 14 × 1.5)
            copy ↔ button gap = 28 px  (marginBottom 1.75rem)
            button row       ≈ 28 px  (1.75rem IG icon dominates)
            total            ≈ 98 px
          Headline bottom    = 42% + 158 px. Container top = bottom −
          height = 42% + 60 px. */}
      <div
        className="content-grid"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "calc(42% + 60px)",
        }}
      >
        <motion.div
          style={{ gridColumn: COL_CTA }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: DUR.base, ease: EASE }}
        >
          <p
            className="text-body"
            style={{
              color: "var(--fg)",
              marginBottom: "1.75rem",
              lineHeight: 1.5,
            }}
          >
            {CTA_LINES.map((line, i) => (
              <span key={i} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </p>

          {/* Email + Instagram row — the email reads as the primary
              contact channel (mailto link), the Instagram icon is a
              secondary social handle to the right. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <motion.a
              href={`mailto:${EMAIL}`}
              data-cursor="view"
              data-magnetic
              data-no-advance
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{
                display: "inline-block",
                backgroundColor: "var(--fg)",
                color: "var(--bg)",
                padding: "0.35rem 0.6rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
                cursor: "inherit",
                textDecoration: "none",
                lineHeight: 1.2,
              }}
            >
              {EMAIL}
            </motion.a>

            <motion.a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram — @${INSTAGRAM_HANDLE}`}
              data-cursor="view"
              data-magnetic
              data-no-advance
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "1.75rem",
                height: "1.75rem",
                color: "var(--fg)",
                cursor: "inherit",
                textDecoration: "none",
              }}
            >
              {/* Inline Instagram glyph — a single rounded square with the
                  centred circle and top-right dot, all in currentColor so
                  it inherits the section's --fg (ink on coral when the
                  scheme settles, sky/mint while the cascade plays). */}
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                width="100%"
                height="100%"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
