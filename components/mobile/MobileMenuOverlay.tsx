"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { COLORS } from "@/lib/colors";
import { DUR, EASE, STAGGER } from "@/lib/motion";

export type ChromeSection = "who" | "work" | "contact";

type Section = { key: ChromeSection; label: string; targetId: string };

const SECTIONS: Section[] = [
  { key: "who", label: "WHO", targetId: "who" },
  { key: "work", label: "WORK", targetId: "work" },
  { key: "contact", label: "CONTACT", targetId: "contact" },
];

// Each section's signature highlight colour. The whole menu wears the
// highlighted section's colour and transitions to the tapped section's
// colour before the parent scrolls there.
const SECTION_HIGHLIGHT: Record<ChromeSection, string> = {
  who: COLORS.sage,
  work: COLORS.sky,
  contact: COLORS.coral,
};

type Props = {
  open: boolean;
  /** The section the user is currently in — gets bracketed on open. */
  activeSection: ChromeSection;
  /** User picked a section (or tapped the active one). Parent should
   *  smooth-scroll to that section and call onClose. */
  onSelect: (section: ChromeSection) => void;
  /** Close without scrolling (e.g. backdrop tap). */
  onClose: () => void;
};

/**
 * Tap-the-bracket fullscreen menu.
 *
 * Choreography:
 *   1. Backdrop fades in + applies blur to whatever section is behind.
 *   2. Labels rise on sequentially (WHO → WORK → CONTACT).
 *   3. Once labels are in, the brackets snap-close around the current
 *      section's label.
 *   4. Tap a different label: brackets morph (spring) to the new label
 *      via shared layoutId; ~350 ms later the overlay fades out and
 *      the parent scrolls to that section.
 *   5. Tap the current label: overlay closes with no scroll.
 *
 * Colour scheme is forced to light-on-dark (sage on ink) regardless of
 * which section is underneath, by locally redefining --bg / --fg /
 * --accent on the overlay root.
 */
export default function MobileMenuOverlay({
  open,
  activeSection,
  onSelect,
  onClose,
}: Props) {
  // Locally-tracked highlight — drives which label is bracketed.
  // Starts at activeSection on open; tapping a different section
  // updates it (triggers the bracket morph) before the parent fires
  // onSelect.
  const [highlighted, setHighlighted] =
    useState<ChromeSection>(activeSection);
  // Whether the bracket pair is visible. Held false until the labels
  // have finished rising, then flipped true so the brackets "snap into
  // place" around the active section as the final beat.
  const [bracketsShown, setBracketsShown] = useState(false);

  // Re-sync local state whenever the overlay opens.
  useEffect(() => {
    if (!open) {
      setBracketsShown(false);
      return;
    }
    setHighlighted(activeSection);
    // Brackets land after the last label (delay ≈ labels stagger).
    const t = window.setTimeout(() => setBracketsShown(true), 700);
    return () => window.clearTimeout(t);
  }, [open, activeSection]);

  const handleTap = (key: ChromeSection) => {
    if (key === highlighted) {
      onClose();
      return;
    }
    // Move the brackets + transition the menu colour to the tapped
    // section's highlight first; let that play before we ask the
    // parent to fade us out + scroll into the section.
    setHighlighted(key);
    window.setTimeout(() => onSelect(key), 450);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE }}
          // Local colour scheme — light text on dark surface regardless
          // of the section underneath. The locally re-declared CSS vars
          // cascade through every child via `var(--fg)` etc., so the
          // labels read sage even when the page below is sky / mint /
          // coral.
          style={
            {
              position: "fixed",
              inset: 0,
              zIndex: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2.25rem",
              // Tinted ink with backdrop blur so the underlying section
              // reads through but is dim + softened.
              backgroundColor: "color-mix(in srgb, var(--ink) 78%, transparent)",
              backdropFilter: "blur(14px) saturate(1.1)",
              WebkitBackdropFilter: "blur(14px) saturate(1.1)",
              ["--bg" as string]: "var(--ink)",
              ["--fg" as string]: "var(--sage)",
              ["--accent" as string]: "var(--sage)",
              color: "var(--fg)",
            } as React.CSSProperties
          }
          onClick={(e) => {
            // Backdrop tap closes; taps on labels stopPropagate below.
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <LayoutGroup id="mobile-menu">
            {SECTIONS.map((s, i) => {
              const isActive = highlighted === s.key;
              return (
                <motion.button
                  key={s.key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTap(s.key);
                  }}
                  aria-label={`Go to ${s.label} section`}
                  aria-current={isActive ? "page" : undefined}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    delay: 0.18 + i * (STAGGER.item + 0.05),
                    duration: 0.45,
                    ease: EASE,
                  }}
                  style={{
                    position: "relative",
                    background: "none",
                    border: "none",
                    padding: "0.5rem 1.5rem",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "clamp(3rem, 14vw, 5rem)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    // Whole menu wears the highlighted section's colour;
                    // tapping a different label updates `highlighted`,
                    // which transitions the colour here before the
                    // parent scrolls to that section. Brackets inherit
                    // this colour too (they use currentColor).
                    color: SECTION_HIGHLIGHT[highlighted],
                    transition:
                      "color 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                    cursor: "pointer",
                  }}
                >
                  <AnimatePresence>
                    {isActive && bracketsShown && (
                      <MenuBracket side="left" />
                    )}
                  </AnimatePresence>
                  {s.label}
                  <AnimatePresence>
                    {isActive && bracketsShown && (
                      <MenuBracket side="right" />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </LayoutGroup>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Bracket character, side-positioned around the label.
 *
 * The `layoutId` is shared between every instance on each side, so
 * framer-motion morphs the bracket between labels when `highlighted`
 * changes (the previous one unmounts, the new one mounts — layout
 * delta drives the snap-spring).
 *
 * On first appearance (when the menu opens), the entry comes from an
 * outward offset + slight up-scale so the brackets read as "closing
 * in" on the active label.
 */
function MenuBracket({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <motion.span
      layoutId={`menu-bracket-${side}`}
      initial={{
        opacity: 0,
        x: isLeft ? -18 : 18,
        scale: 1.35,
      }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        layout: { type: "spring", stiffness: 480, damping: 26 },
        x: { type: "spring", stiffness: 520, damping: 22 },
        scale: { type: "spring", stiffness: 520, damping: 22 },
        opacity: { duration: 0.2, ease: EASE },
      }}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        // Sit just outside the label with a small gap.
        ...(isLeft ? { right: "100%", paddingRight: "0.18em" } : { left: "100%", paddingLeft: "0.18em" }),
        pointerEvents: "none",
      }}
    >
      {isLeft ? "[" : "]"}
    </motion.span>
  );
}
