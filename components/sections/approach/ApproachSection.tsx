"use client";

import { motion } from "framer-motion";
import LetterCascade from "@/components/primitives/LetterCascade";
import StarField from "@/components/starfield/StarField";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import styles from "./approachSection.module.css";

/* ─── Copy (shared with the mobile panel) ───────────────────────────────── */

/** Teaser for the full /approach page: the four process steps, one line
 *  each. Keep in step with the Process section of app/approach/page.tsx. */
export const APPROACH_INTRO =
  "A problem solver with a strong eye. I apply my taste with judgment, let research lead, and do my best work in close collaboration.";

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

      {/* One grid, vertically centred in the panel. Nav and footer are
          both 5rem, so viewport centre = centre of the space between them.
            row 1: hero (cols 3–20) + teaser (cols 21–28), teaser
                   bottom-aligned to the hero like Contact's CTA
            row 2: the four process steps as a row of outlined cards
                   spanning cols 3–28 */}
      <div
        className="content-grid"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          rowGap: "clamp(1.75rem, 5vh, 3rem)",
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
          {/* Rises in word by word on scroll-in (whileInView) — not on
              page load, which would finish long before the panel is seen.
              Words step at STAGGER.section (0.12s): How 0.10 → I 0.22 →
              work. 0.34. */}
          <LetterCascade text="How I" as="div" by="word" animate={false} delay={0.1} />
          <LetterCascade text="work." as="div" by="word" animate={false} delay={0.34} />
        </div>

        <motion.div
          style={{ gridColumn: COL_BODY, alignSelf: "end" }}
          // RiseOn pattern (Select Engagements / Work [Intro]): rises in
          // as the headline's second line lands.
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: DUR.base, ease: EASE }}
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
            style={{ color: "var(--fg)", marginBottom: "1.25rem", lineHeight: 1.5 }}
          >
            {APPROACH_INTRO}
          </p>
          <motion.a
            href={APPROACH_HREF}
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
              textTransform: "uppercase",
              cursor: "inherit",
              textDecoration: "none",
              lineHeight: 1.2,
            }}
          >
            Read the full approach
          </motion.a>
        </motion.div>

        {/* Same cards as the /approach Process section (styles mirror
            app/approach/approach.module.css): 22px padding, 16px gutters,
            muted step number, Geist 700 title, hover invert with the
            cursor taking the card's local --fg. */}
        <ol className={styles.steps} style={{ gridColumn: "3 / 29" }}>
          {APPROACH_STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              className={styles.step}
              data-cursor-color="local"
              // Select Engagements pattern: opacity-only fade, one item
              // after another at STAGGER.item, following the teaser.
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.0 + i * STAGGER.item, duration: DUR.base, ease: EASE }}
            >
              <span className={styles.num}>[ 0{i + 1} ]</span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={`text-body ${styles.body}`}>{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
