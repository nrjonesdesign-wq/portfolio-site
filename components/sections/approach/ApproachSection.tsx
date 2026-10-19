"use client";

import { motion } from "framer-motion";
import LetterCascade from "@/components/primitives/LetterCascade";
import StarField from "@/components/starfield/StarField";
import { DUR, EASE, STAGGER } from "@/lib/motion";

/* ─── Copy (shared with the mobile panel) ───────────────────────────────── */

/** Teaser for the full /approach page: the four process steps, one line
 *  each. Keep in step with the Process section of app/approach/page.tsx. */
export const APPROACH_INTRO =
  "A problem solver first. Style serves the goal, research leads the way, and the best work comes from close collaboration.";

export const APPROACH_STEPS = [
  { title: "Define the problem", body: "Listen, take notes, and align stakeholders on goals and limits." },
  { title: "Research", body: "Front-load deep study so every recommendation is informed." },
  { title: "Sketch and share", body: "Think visually, and vet directions early with the team." },
  { title: "Experiment and refine", body: "Prototype, iterate, and refine through rounds of feedback." },
];

export const APPROACH_HREF = "/approach";

/* ─── Layout constants (same columns as Contact) ────────────────────────── */

const COL_HERO = "3 / 21";
const COL_BODY = "21 / 29"; // universal body-copy column

/* ─── Section ───────────────────────────────────────────────────────────── */

export default function ApproachSection() {
  return (
    <section
      id="approach"
      className="snap"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Star field — same low-opacity overlay as WHO / Contact. */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{ color: "var(--fg)", opacity: 0.4 }}
      >
        <StarField className="w-full h-full" />
      </div>

      {/* Hero left, teaser right. Bottoms align (align-items: end) the
          same way Contact's headline and CTA share a bottom edge. */}
      <div
        className="content-grid"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "30%",
          alignItems: "end",
        }}
      >
        <div
          style={{
            gridColumn: COL_HERO,
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "88px",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            color: "var(--fg)",
          }}
        >
          <LetterCascade text="How I" as="div" animate delay={0.2} />
          <LetterCascade text="work." as="div" animate delay={0.55} />
        </div>

        <motion.div
          style={{ gridColumn: COL_BODY }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: DUR.base, ease: EASE }}
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
            [ Approach ]
          </span>
          <p
            className="text-body"
            style={{ color: "var(--fg)", marginBottom: "1.5rem", lineHeight: 1.5 }}
          >
            {APPROACH_INTRO}
          </p>

          <ol style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--fg)" }}>
            {APPROACH_STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * STAGGER.item, duration: DUR.base, ease: EASE }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.75rem 1fr",
                  gap: "0.75rem",
                  padding: "0.65rem 0",
                  borderBottom: "1px solid var(--fg)",
                }}
              >
                <span className="text-label" style={{ color: "var(--fg)" }}>
                  [ 0{i + 1} ]
                </span>
                <span className="text-body" style={{ color: "var(--fg)", lineHeight: 1.45 }}>
                  <strong style={{ fontWeight: 500 }}>{step.title}.</strong>{" "}
                  {step.body}
                </span>
              </motion.li>
            ))}
          </ol>

          <motion.a
            href={APPROACH_HREF}
            data-cursor="view"
            data-magnetic
            data-no-advance
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            style={{
              display: "inline-block",
              marginTop: "1.5rem",
              backgroundColor: "var(--fg)",
              color: "var(--bg)",
              padding: "0.35rem 0.6rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: "inherit",
              textDecoration: "none",
              lineHeight: 1.2,
            }}
          >
            Read the full approach
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
