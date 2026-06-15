"use client";

import { motion } from "framer-motion";
import StarField from "@/components/starfield/StarField";
import LetterCascade from "@/components/primitives/LetterCascade";
import MarchingAnts from "@/components/primitives/MarchingAnts";
import { DUR, EASE, STAGGER } from "@/lib/motion";

/**
 * Mobile WHO — two stacked snap panels:
 *
 *   HelloPanel: large "Hello" headline, intro paragraph below, vertical
 *               [ SCROLL ] dotted cue at the bottom centre.
 *   NamePanel:  "Nathaniel / Robert / Jones" stack (filled + outline),
 *               [INTRO] paragraphs, Select Engagements list,
 *               [ DOWNLOAD MY CV ] cue.
 */

const INTRO_LEAD =
  "I'm Nathaniel Robert Jones, an artist / designer with nearly 20 years of crafting compelling experiences.";

const INTRO_PARA_1 =
  "Senior Visual Designer with nearly 20 years of experience combining creativity with technical skill and a refined aesthetic sensibility—informed by a personal artistic practice as a painter and musician, and fueled by an insatiable curiosity and love of culture.";

const INTRO_PARA_2 =
  "Specialized in helping organizations translate complex ideas into clear, compelling visual narratives, designing and applying brand systems, and creating polished, high-fidelity visual assets that bridge user experience with brand identity.";

const ENGAGEMENTS = [
  { label: "Freelance Services", years: "2008 — Present" },
  { label: "Liquid Agency", years: "2024 — 2025" },
  { label: "Nifty's", years: "2021 — 2022" },
  { label: "Bloomberg LP", years: "2015 — 2021" },
];

/* ─── Hello panel ────────────────────────────────────────────────────── */

export function MobileHelloPanel() {
  return (
    <section
      id="who"
      className="snap"
      style={{
        backgroundColor: "var(--bg)",
        position: "relative",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      {/* Stars */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ color: "var(--fg)", opacity: 0.55 }}
      >
        <StarField className="w-full h-full" count={14} size={22} />
      </div>

      {/* Hello content — headline, intro paragraph, scroll cue — as
          one centred block.
          Snap places this section's top at viewport y = m-nav-h
          (scroll-padding-top), so the section's own coord 0 already
          maps to the bottom of the visible nav. Anchoring the wrapper
          at top: 0 with height = (100dvh − nav − foot) lays it
          exactly over the visible viewport area, and the 1fr/auto/1fr
          grid centres content within. */}
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
          <LetterCascade
            text="Hello"
            as="h1"
            animate={false}
            delay={0.1}
            className="text-hero"
            style={{
              color: "var(--fg)",
              marginLeft: "-0.07em",
              // Larger per the design grid — Hello spans most of
              // the page width with substantial visual weight.
              fontSize: "clamp(5rem, 32vw, 9rem)",
            }}
          />
        </div>

        <motion.p
          className="text-body"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: DUR.base, ease: EASE }}
          style={{ gridColumn: "1 / 8", color: "var(--fg)" }}
        >
          I&apos;m{" "}
          <strong style={{ fontWeight: 700 }}>
            Nathaniel Robert Jones
          </strong>
          , an artist / designer with nearly 20 years of crafting
          compelling experiences.
        </motion.p>

        {/* Scroll cue — part of the same centred group, with a bit of
            extra top margin so it reads as a separate beat below the
            headline + paragraph. */}
        <div
          style={{
            gridColumn: "1 / 9",
            display: "flex",
            justifyContent: "center",
            marginTop: "1.5rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55, y: [0, -4, 0] }}
            transition={{
              opacity: { delay: 2.3, duration: DUR.base, ease: EASE },
              y: {
                delay: 2.3,
                duration: 2.2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
              },
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--fg)",
              pointerEvents: "none",
            }}
          >
            <span className="text-sm">[ Scroll ]</span>
            <MarchingAnts
              direction="down"
              length="2.25rem"
              spacing="0.4rem"
              dotSize="2px"
              speed={1.0}
              color="currentColor"
            />
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
          </motion.div>
        </div>
        </div>
        <div />
      </div>
    </section>
  );
}

/* ─── Name panel ─────────────────────────────────────────────────────── */

/**
 * WHO panel — second screen of the Who section (Hello is the first).
 * Holds name stack, intro paragraphs, Select Engagements, and the CV
 * link. Grows naturally past 100dvh on shorter phones so all content
 * stays reachable via the main page scroll (no nested overflow — that
 * caused snap-glitch transitions on iOS where Name and Work could
 * render simultaneously mid-scroll).
 */
export function MobileNamePanel() {
  return (
    <section
      id="who-bio"
      className="snap"
      style={{
        backgroundColor: "var(--bg)",
        position: "relative",
        // min-height instead of fixed height — section grows with
        // content on short phones; centred layout on tall ones.
        minHeight: "100dvh",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ color: "var(--fg)", opacity: 0.4 }}
      >
        <StarField className="w-full h-full" count={12} size={20} />
      </div>

      <div
        style={{
          position: "relative",
          minHeight: "100dvh",
          // Inset for the mobile nav (top) and footer (bottom).
          paddingTop: "calc(var(--m-nav-h) + 1rem)",
          paddingBottom: "calc(var(--m-foot-h) + 2.5rem)",
          display: "flex",
          flexDirection: "column",
          // Centre content vertically when it fits in the viewport;
          // on shorter phones content grows past min-height and the
          // user scrolls main to see the rest.
          justifyContent: "center",
        }}
      >
        <div
          className="m-content-grid"
          style={{ rowGap: "2rem" }}
        >
          {/* Name stack — full 8-col span */}
          <div style={{ gridColumn: "1 / 9" }}>
            <motion.h2
              className="text-name"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.base, ease: EASE }}
              style={{
                color: "var(--fg)",
                fontSize: "clamp(3rem, 14vw, 5.25rem)",
                marginLeft: "-0.04em",
              }}
            >
              Nathaniel
            </motion.h2>
            <OutlineName word="Robert" delay={0.12} />
            <OutlineName word="Jones" delay={0.24} />
          </div>

          {/* [ INTRO ] eyebrow + paragraphs. Shares the Hello intro
              paragraph's column width (1 / 8) so the body copy reads
              with a consistent measure across both WHO screens. */}
          <div style={{ gridColumn: "1 / 8" }}>
            <motion.span
              className="text-label"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.base, ease: EASE, delay: 0.1 }}
              style={{
                color: "var(--accent)",
                display: "block",
                marginBottom: "0.65rem",
              }}
            >
              [ Intro ]
            </motion.span>
            <motion.p
              className="text-body"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.base, ease: EASE, delay: 0.18 }}
              style={{ color: "var(--fg)", marginBottom: "0.75rem" }}
            >
              {INTRO_PARA_1}
            </motion.p>
            <motion.p
              className="text-body"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.base, ease: EASE, delay: 0.28 }}
              style={{ color: "var(--fg)", opacity: 0.85 }}
            >
              {INTRO_PARA_2}
            </motion.p>
          </div>

          {/* Select Engagements */}
          <div style={{ gridColumn: "1 / 9" }}>
            <motion.h3
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DUR.base, ease: EASE }}
              style={{
                fontFamily: "var(--font-body)",
                // 34px — paired with Select Work; smaller than before
                // so the Download CV cue stays clear of the footer
                // chrome on shorter phones.
                fontSize: "2.125rem",
                fontWeight: 700,
                // Tight leading on the two wrapped lines so it reads
                // with the same proportional rhythm as the display
                // headlines (text-name = 0.95).
                lineHeight: 0.95,
                color: "var(--fg)",
                letterSpacing: "-0.01em",
                marginBottom: "0.875rem",
              }}
            >
              Select Engagements
            </motion.h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.55rem",
              }}
            >
              {ENGAGEMENTS.map(({ label, years }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.15 + i * STAGGER.item,
                    duration: DUR.base,
                    ease: EASE,
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--fs-label)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "var(--fg)",
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: "var(--fg)",
                      opacity: 0.4,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--fs-label)",
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
          </div>

          {/* Download CV cue — bracketed mono link aligned right.
              Sits in its own grid row so it follows the same rowGap
              rhythm as Name / Intro / Engagements. */}
          <div
            style={{
              gridColumn: "1 / 9",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              data-no-advance
              className="text-label"
              style={{
                color: "var(--fg)",
                textDecoration: "none",
                padding: "0.25rem 0",
              }}
            >
              [ Download my CV ]
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function OutlineName({ word, delay = 0 }: { word: string; delay?: number }) {
  return (
    <motion.h2
      className="text-name text-name-outline"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: DUR.base, ease: EASE, delay }}
      style={{
        color: "var(--bg)",
        WebkitTextStroke: "1.25px var(--accent)",
        paintOrder: "stroke fill",
        fontSize: "clamp(3rem, 14vw, 5.25rem)",
        marginLeft: "-0.04em",
        marginTop: "-0.05em",
      }}
    >
      {word}
    </motion.h2>
  );
}

