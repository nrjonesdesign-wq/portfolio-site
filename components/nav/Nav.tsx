"use client";

import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { EASE } from "@/lib/motion";

export type ActiveSection = "loading" | "who" | "name" | "work" | "approach" | "contact";

type Props = {
  activeSection: ActiveSection;
  /** Hide the nav while the loading panel is active. */
  chromeVisible?: boolean;
  /** Page-level ref so the singleton MorphingPlanet can measure where to
   *  land when it shrinks out of the loading screen. */
  planetSlotRef?: React.Ref<HTMLDivElement>;
};

// Nav planet "box" size. The visible planet *circle* inside NRJPlanet is
// 39% of this box (PLANET_R_FRAC=0.195 → diameter=39% of viewBox); 113px
// gives a 44px visible circle, matching the case-study NRJ mark exactly.
// The NRJ wordmark at this scale renders at 0.13 × 113 = ~14.7px, also
// matching the case-study mark's 14px label. With the orbit's swFrac
// clamped to 1.0 and the planet circle using vector-effect:
// non-scaling-stroke + strokeWidth=1, every stroke at nav size is 1 css px.
export const NAV_PLANET_PX = 113;

/* ─── Reveal variants ─────────────────────────────────────────────────────
   Sequential left-to-right entry: the container staggers its direct
   children, each rule draws on with scaleX from its left edge, each label
   rises in. Per spec §2 ("each step waits for the previous to complete or
   near-complete with a small overlap").
*/
const containerVariants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.3, ease: EASE },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: EASE,
      staggerChildren: 0.18,
      delayChildren: 0.15,
    },
  },
};

const labelVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

const ruleVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 0.35,
    transition: { duration: 0.5, ease: EASE },
  },
};

const planetVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

export default function Nav({
  activeSection,
  chromeVisible = true,
  planetSlotRef,
}: Props) {
  return (
    <motion.header
      // Two layers: a masked backdrop (blur + gradient fade) BEHIND the nav
      // content. Putting the mask on a separate sibling rather than the
      // header element itself means the planet button can scale on hover
      // past the bottom edge of the nav without being clipped.
      className="fixed top-0 left-0 right-0 z-50 flex items-center"
      // pointerEvents tied to chromeVisible — at opacity 0 the header is
      // still in the DOM at z-50 and would otherwise eat clicks on
      // elements painted under it (e.g. the case-study tabs near the top
      // of the viewport).
      // Header height matches the bottom meta-row (5rem / 80px) so the top
      // and bottom chrome bars have visually symmetric weight. The planet's
      // hit area is bigger than the header (113px circle vs 80px header),
      // but the mask gradient on the backdrop and the clip-path circle on
      // the planet button keep the visible footprint inside the header.
      style={{
        height: "5rem",
        pointerEvents: chromeVisible ? "auto" : "none",
      }}
      initial="hidden"
      animate={chromeVisible ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Backdrop layer — the blur + masked fade lives here */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          backgroundColor: "color-mix(in srgb, var(--bg) 45%, transparent)",
          transition: "background-color 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          maskImage:
            "linear-gradient(to bottom, black 30%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.4) 80%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 30%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.4) 80%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <LayoutGroup id="nav-brackets">
      <div className="content-grid w-full" style={{ position: "relative", zIndex: 1 }}>
        {/* Logo placeholder — the actual planet is a singleton rendered at
            page level so it can morph from the loading screen's centred,
            large-size position into this slot in one continuous motion
            (per spec §3 State B step 2). The placeholder reserves the
            grid slot and gives the singleton a ref'd target rect to land
            on. */}
        <motion.div
          variants={planetVariants}
          style={{
            gridColumn: "3 / 6",
            display: "flex",
            // Top-align so we can offset the slot deliberately rather than
            // letting flex centring put the planet box symmetrically
            // around the nav row's vertical centre. The slot itself is
            // bigger than the row (113 vs 80) — centring it would put the
            // orbit's top edge well above the labels.
            alignItems: "flex-start",
            transformOrigin: "left center",
            pointerEvents: "none",
          }}
        >
          <div
            ref={planetSlotRef}
            aria-hidden
            // marginTop pulls the slot down so the planet circle's centre
            // sits below the labels' baseline, putting the top of the
            // orbit ring at the same y as the top of the WHO/WORK/CONTACT
            // glyphs. Lifts the planet visually out of the labels and
            // gives the rings room to breathe.
            style={{
              width: NAV_PLANET_PX,
              height: NAV_PLANET_PX,
              marginTop: "-0.5rem",
            }}
          />
        </motion.div>

        {/* Nav grid: WHO / WORK / APPROACH / CONTACT centres sit on grid
            lines 8 / 15 / 23 / 30 — the most even split the 32-col grid
            allows (7 / 8 / 7 cols, symmetric about the middle). Rules
            fill the cells between labels. APPROACH and CONTACT are the
            wide labels, so the rules that touch them get a 1.5rem inset
            on that side (start or end) to keep the visible stroke
            centred between the labels' inner edges and clear of the
            active brackets. */}
        <NavLabel
          gridColumn="7 / 9"
          label="WHO"
          active={activeSection === "name"}
          onClick={() => scrollToSection("who-bio")}
          align="center"
        />

        <NavRule gridColumn="9 / 14" />

        <NavLabel
          gridColumn="14 / 16"
          label="WORK"
          active={activeSection === "work"}
          onClick={() => scrollToSection("work")}
          align="center"
        />

        <NavRule gridColumn="16 / 22" endInset="1.5rem" />

        <NavLabel
          gridColumn="22 / 24"
          label="APPROACH"
          active={activeSection === "approach"}
          onClick={() => scrollToSection("approach")}
          align="center"
        />

        <NavRule gridColumn="24 / 29" startInset="1.5rem" endInset="1.5rem" />

        <NavLabel
          gridColumn="29 / 31"
          label="CONTACT"
          active={activeSection === "contact"}
          onClick={() => scrollToSection("contact")}
          align="center"
        />
      </div>
      </LayoutGroup>
    </motion.header>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/** Nav label — Geist 19 medium per the reference design. Brackets are
 *  separate motion.span elements that slide between active labels via
 *  framer-motion's shared layoutId, instead of appearing/disappearing.
 */
function NavLabel({
  gridColumn,
  label,
  active,
  onClick,
  align = "start",
}: {
  gridColumn: string;
  label: string;
  active: boolean;
  onClick: () => void;
  align?: "start" | "center" | "end";
}) {
  const [hovered, setHovered] = useState(false);

  // Generous hit area — visual position is unchanged because the padding is
  // offset by an equal negative margin. The cursor catches the "view" state
  // well before the pointer is on top of the actual glyphs.
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontSize: "1.1875rem",
    fontWeight: 500,
    letterSpacing: 0,
    color: "var(--fg)",
    opacity: active ? 1 : 0.7,
    background: "none",
    border: "none",
    padding: "1.2rem 1.4rem",
    margin: "-1.2rem -1.4rem",
    cursor: "inherit",
    whiteSpace: "nowrap",
    position: "relative",
    display: "inline-block",
    lineHeight: 1,
  };

  // Slinky spring — fast, smooth, with a touch of overshoot.
  const bracketTransition = {
    type: "spring" as const,
    stiffness: 620,
    damping: 22,
    mass: 0.5,
  };

  return (
    <motion.div
      variants={labelVariants}
      style={{
        gridColumn,
        display: "flex",
        alignItems: "center",
        justifyContent: align === "start" ? "flex-start" : align === "center" ? "center" : "flex-end",
      }}
    >
      <button
        type="button"
        className="focus-visible:outline-2 focus-visible:outline-offset-4"
        style={labelStyle}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-cursor="view"
      >
        {/* Inner wrapper sized to the WORD itself. Brackets and underline
            anchor to this wrapper instead of the padded button so the
            distance from the glyphs is consistent regardless of label
            length — [WHO] sits tight, [CONTACT] sits wide, with equal
            space on either side. */}
        <span
          style={{
            position: "relative",
            display: "inline-block",
            whiteSpace: "nowrap",
          }}
        >
          {label}

          {active && (
            <motion.span
              layoutId="nav-bracket-left"
              transition={bracketTransition}
              style={{
                position: "absolute",
                right: "100%",
                top: 0,
                bottom: 0,
                marginRight: "0.3em",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              [
            </motion.span>
          )}
          {active && (
            <motion.span
              layoutId="nav-bracket-right"
              transition={bracketTransition}
              style={{
                position: "absolute",
                left: "100%",
                top: 0,
                bottom: 0,
                marginLeft: "0.3em",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              ]
            </motion.span>
          )}

          {/* Hover underline — flush with the bottom of the WORD wrapper. */}
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "-0.18em",
              height: 1,
              backgroundColor: "var(--fg)",
              transformOrigin: "left center",
              pointerEvents: "none",
            }}
            initial={false}
            animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 0.85 : 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>
      </button>
    </motion.div>
  );
}

function NavRule({
  gridColumn,
  startInset,
  endInset,
}: {
  gridColumn: string;
  /** Same as endInset, for the rule's left edge (a wide label on the left). */
  startInset?: string;
  /** Pixel/CSS-length value to shorten the rule's right edge. Used to
   *  rebalance the gap on either side of a rule when its neighbour
   *  labels have very different widths (e.g., CONTACT vs. WORK). */
  endInset?: string;
}) {
  return (
    <motion.div
      variants={ruleVariants}
      style={{
        gridColumn,
        display: "flex",
        alignItems: "center",
        transformOrigin: "left center",
        marginLeft: startInset,
        marginRight: endInset,
      }}
    >
      <div
        style={{
          width: "100%",
          height: 1,
          backgroundColor: "var(--fg)",
        }}
      />
    </motion.div>
  );
}
