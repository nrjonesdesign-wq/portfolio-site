"use client";

import { motion } from "framer-motion";
import LetterCascade from "@/components/primitives/LetterCascade";
import StarField from "@/components/starfield/StarField";
import { DUR, EASE } from "@/lib/motion";
import {
  APPROACH_HREF,
  APPROACH_INTRO,
  APPROACH_STEPS,
} from "@/components/sections/approach/ApproachSection";

/**
 * Mobile Approach panel — sits between Work and Contact. Lavender bg /
 * ink text (the "approach" scheme). Same structure as the mobile Contact
 * panel: centred block between nav and footer, letter-cascade hero, then
 * a short teaser and a link to the full /approach page.
 */
export default function MobileApproachSection() {
  const heroStyle: React.CSSProperties = {
    color: "var(--fg)",
    marginLeft: "-0.06em",
    fontSize: "clamp(2.75rem, 13vw, 4.25rem)",
    lineHeight: 0.92,
  };

  return (
    <section
      id="approach"
      className="snap"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        position: "relative",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ color: "var(--fg)", opacity: 0.5 }}
      >
        <StarField className="w-full h-full" count={14} size={22} />
      </div>

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

        <div className="m-content-grid" style={{ rowGap: "2rem" }}>
          <div style={{ gridColumn: "1 / 9" }}>
            {/* Cascades on scroll-in, like the mobile "Hello". */}
            <LetterCascade text="How I" as="div" animate={false} delay={0.1} className="text-hero" style={heroStyle} />
            <LetterCascade text="work." as="div" animate={false} delay={0.4} className="text-hero" style={heroStyle} />
          </div>

          <motion.div
            style={{
              gridColumn: "3 / 9",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "1rem",
            }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: DUR.base, ease: EASE }}
          >
            <p className="text-body" style={{ color: "var(--fg)", margin: 0 }}>
              {APPROACH_INTRO}
            </p>

            <ol style={{ listStyle: "none", margin: 0, padding: 0, width: "100%", borderTop: "1px solid var(--fg)" }}>
              {APPROACH_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  style={{
                    display: "flex",
                    gap: "0.6rem",
                    alignItems: "baseline",
                    padding: "0.45rem 0",
                    borderBottom: "1px solid var(--fg)",
                  }}
                >
                  <span className="text-label" style={{ color: "var(--fg)", flex: "0 0 auto" }}>
                    [ 0{i + 1} ]
                  </span>
                  <span className="text-body" style={{ color: "var(--fg)", fontWeight: 500 }}>
                    {step.title}
                  </span>
                </li>
              ))}
            </ol>

            <a
              href={APPROACH_HREF}
              data-no-advance
              style={{
                display: "inline-block",
                backgroundColor: "var(--fg)",
                color: "var(--bg)",
                padding: "0.6rem 0.85rem",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--fs-label)",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Read the full approach
            </a>
          </motion.div>
        </div>

        <div />
      </div>
    </section>
  );
}
