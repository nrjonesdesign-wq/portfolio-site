"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { DUR, EASE } from "@/lib/motion";

/**
 * Mobile shared chrome: fixed top nav + fixed bottom footer.
 *
 * - Nav: NRJ planet mark (orbit ring rotates with the user's scroll),
 *   hairline rule, and a bracketed Geist-Bold section label that
 *   opens the menu overlay on tap.
 * - Footer: SENIOR DESIGNER ─── AVAILABLE FOR WORK.
 *
 * Both bands sit above a backdrop-blurred glass layer that tints with
 * the current section bg (matches the desktop nav/footer pattern).
 */

const NAV_H = "var(--m-nav-h)";
const FOOT_H = "var(--m-foot-h)";
const GUTTER = "var(--m-gutter)";

type Props = {
  activeSection: "who" | "work" | "approach" | "contact";
  visible: boolean;
  onOpenMenu?: () => void;
  /** Planet tap. When set, replaces the native #loading anchor jump so
   *  the page can suspend snapping around the scroll (see MobileHome). */
  onHome?: () => void;
  children: ReactNode;
};

export default function MobileChrome({
  activeSection,
  visible,
  onOpenMenu,
  onHome,
  children,
}: Props) {
  const label =
    activeSection === "work"
      ? "WORK"
      : activeSection === "approach"
        ? "APPROACH"
        : activeSection === "contact"
          ? "CONTACT"
          : "WHO";

  return (
    <>
      {children}

      {/* Top nav. Positioned with `top: env(safe-area-inset-top)` so it
          sits BELOW the iOS status bar — leaving the safe-area band
          transparent so it picks up the html bg (which follows --bg
          per useColorScheme) instead of the chrome's gradient (whose
          CSS-variable transitions can lag during scheme swaps). */}
      <motion.header
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -8 }}
        transition={{ duration: DUR.base, ease: EASE }}
        style={{
          position: "fixed",
          top: "env(safe-area-inset-top, 0px)",
          left: 0,
          right: 0,
          height: NAV_H,
          zIndex: 60,
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        {/* Glass tint layer — sits behind the chrome content so the
            section underneath softens through the nav. */}
        <ChromeBackdrop edge="top" bleed />

        {/* Content row — flex centred so the planet and the bracket
            label sit on the same vertical axis. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            paddingLeft: GUTTER,
            paddingRight: GUTTER,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          {/* Planet — tappable, scrolls back to top. 3.75rem so the
              NRJ wordmark reads clearly. The negative marginLeft pulls
              the SVG left so the INNER CIRCLE's left edge lands on the
              grid's left edge (the gutter): the disc left sits at
              viewBox x=8.5 of 36, so shift left by 8.5/36 of the width.
              The orbit ring then overshoots into the outer margin. */}
          <a
            href="#loading"
            aria-label="Back to top"
            data-no-advance
            onClick={(e) => {
              if (!onHome) return;
              e.preventDefault();
              onHome();
            }}
            style={{
              width: "3.75rem",
              height: "3.75rem",
              flex: "0 0 auto",
              marginLeft: "calc(-3.75rem * 8.5 / 36)",
              color: "var(--fg)",
              display: "block",
            }}
          >
            <PlanetMark />
          </a>

          {/* Hairline rule between planet and bracket label. */}
          <div
            style={{
              flex: 1,
              height: 1,
              backgroundColor: "var(--fg)",
              opacity: 0.7,
            }}
          />

          {/* Section bracket label — tap to open menu overlay. Geist
              Bold so it reads as the page indicator, not a mono tag. */}
          <button
            type="button"
            onClick={onOpenMenu}
            data-no-advance
            aria-label="Open menu"
            style={{
              background: "none",
              border: "none",
              padding: "0.5rem 0.25rem",
              margin: "-0.5rem -0.25rem",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "1.125rem",
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              color: "var(--fg)",
              cursor: "pointer",
            }}
          >
            [ {label} ]
          </button>
        </div>
      </motion.header>

      {/* Bottom footer. Positioned with `bottom: env(safe-area-inset-bottom)`
          so it sits ABOVE the iOS home-indicator strip — leaving the
          safe-area band transparent to pick up html bg. */}
      <motion.footer
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
        transition={{ duration: DUR.base, ease: EASE }}
        style={{
          position: "fixed",
          bottom: "env(safe-area-inset-bottom, 0px)",
          left: 0,
          right: 0,
          height: FOOT_H,
          zIndex: 60,
          pointerEvents: "none",
        }}
      >
        <ChromeBackdrop edge="bottom" bleed />
        <div
          style={{
            position: "absolute",
            inset: 0,
            paddingLeft: GUTTER,
            paddingRight: GUTTER,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-sm)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--fg)",
          }}
        >
          <span style={{ flexShrink: 0 }}>Senior Designer</span>
          <div
            style={{
              flex: 1,
              height: 1,
              backgroundColor: "var(--fg)",
              opacity: 0.7,
            }}
          />
          <span style={{ flexShrink: 0 }}>Available for Work</span>
          <div
            style={{
              flex: 1,
              height: 1,
              backgroundColor: "var(--fg)",
              opacity: 0.7,
            }}
          />
          <span style={{ flexShrink: 0 }}>© 2026</span>
        </div>
      </motion.footer>
    </>
  );
}

/* ─── Glass-blur backdrop for nav + footer ──────────────────────────── */

/**
 * Sits behind the chrome content as an absolutely-positioned sibling.
 * backdrop-filter blurs whatever section is underneath; the tint pulls
 * a translucent version of the current section bg so the chrome feels
 * cohesive across the colour-scheme swaps. Same pattern as desktop's
 * two-layer Nav.
 */
export function ChromeBackdrop({
  edge,
  bleed = false,
}: {
  edge: "top" | "bottom";
  /** Extend the glass out through the iOS safe area to the screen edge,
   *  solid there (matching Safari's bar tint, which the home page's edge
   *  strips set) and fading softly across the bar — so the solid status
   *  bar / toolbar flows into the glass instead of ending in a hard line
   *  at the safe-area boundary. */
  bleed?: boolean;
}) {
  if (bleed) return <BleedBackdrop edge={edge} />;
  // Two-layer composition so the chrome reads as a soft gradient even
  // when the page content behind it is a uniform colour (e.g. the sky
  // bg of WORK):
  //   - blur layer fills the whole band uniformly (no mask, so no hard
  //     edge — backdrop-filter just softens whatever is behind it),
  //   - tint layer fades from a subtle bg-tinted band near the outer
  //     edge to fully transparent at the inner edge, so the chrome
  //     fades into the page rather than reading as a solid band.
  // The tint MUST stay a gradient `background`, never a solid
  // background-color. iOS Safari 26 tints its status bar / toolbar from
  // a fixed element touching the screen edge when that element has a
  // solid background-color — and it reads that colour once (on first
  // paint, or when a fixed overlay such as the case-study tray mounts or
  // unmounts), so the bars froze on whatever colour was current then.
  // With a gradient, Safari ignores the chrome and tints from html/body,
  // which follow the section. Gradients can't transition, but phones cut
  // colours (no fades) anyway, so nothing is lost.
  const tint =
    edge === "top"
      ? "linear-gradient(to bottom, color-mix(in srgb, var(--bg) 55%, transparent) 0%, color-mix(in srgb, var(--bg) 30%, transparent) 55%, transparent 100%)"
      : "linear-gradient(to top, color-mix(in srgb, var(--bg) 55%, transparent) 0%, color-mix(in srgb, var(--bg) 30%, transparent) 55%, transparent 100%)";
  // Fade the whole backdrop (blur + tint) toward the inner edge so it
  // doesn't end in a hard horizontal cut. The mask lives on a WRAPPER,
  // and the backdrop-filter on a CHILD — putting `backdrop-filter` and
  // `mask` on the SAME element triggers a browser bug where the filter
  // renders as a solid opaque fill (notably after a fixed-position
  // overlay like the case-study tray unmounts). Masking the parent
  // still clips the child's blurred output, giving the gradient edge
  // without the bug.
  const mask =
    edge === "top"
      ? "linear-gradient(to bottom, black 0%, black 45%, transparent 100%)"
      : "linear-gradient(to top, black 0%, black 45%, transparent 100%)";
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        maskImage: mask,
        WebkitMaskImage: mask,
        pointerEvents: "none",
      }}
    >
      <div
        data-chrome-tint
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(14px) saturate(1.2)",
          WebkitBackdropFilter: "blur(14px) saturate(1.2)",
          background: tint,
        }}
      />
    </div>
  );
}

/* ─── Mini NRJ planet (mobile nav mark) ──────────────────────────────── */

/**
 * SVG planet — orbit ring rotation is wired to the scroll position so
 * the ring spins as the user scrolls through the page. All strokes
 * share the same weight (1.1) so the mark reads as a single
 * consistent linework.
 */
export function PlanetMark({
  scrollSource = "main",
}: {
  /** Which scroller drives the ring: the home page's <main> scroll
   *  container (default), or the window (plain-scrolling pages such as
   *  /approach). */
  scrollSource?: "main" | "window";
} = {}) {
  const ellipseRef = useRef<SVGEllipseElement>(null);
  // Drive the ring rotation from the scroll position. Updates the
  // transform attribute directly to avoid re-rendering on every frame.
  useEffect(() => {
    const main = scrollSource === "main" ? document.querySelector("main") : null;
    if (scrollSource === "main" && !main) return;
    const target: HTMLElement | Window = main ?? window;
    const readTop = () => (main ? main.scrollTop : window.scrollY);
    const onScroll = () => {
      const el = ellipseRef.current;
      if (!el) return;
      // Base tilt is -18°. Scroll progress maps to ~360° per 4000px
      // scrolled — slow enough that a phone-height nudge reads as a
      // gentle drift rather than a spin.
      const rotation = -18 + (readTop() * 360) / 4000;
      el.setAttribute("transform", `rotate(${rotation} 18 18)`);
    };
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [scrollSource]);

  return (
    <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden>
      {/* Tilted orbit ring — rotates with scroll. Same stroke width
          as the planet body. */}
      <ellipse
        ref={ellipseRef}
        cx="18"
        cy="18"
        rx="16"
        ry="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        transform="rotate(-18 18 18)"
      />
      {/* Planet body */}
      <circle
        cx="18"
        cy="18"
        r="9.5"
        fill="var(--bg)"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      {/* NRJ wordmark */}
      <text
        x="18"
        y="21.4"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="800"
        fontSize="8.75"
        fill="currentColor"
        letterSpacing="0.01em"
      >
        NRJ
      </text>
    </svg>
  );
}

/** How far the glass's blur fades out past the bar's inner edge. */
const GLASS_RUNOUT = "1.5rem";

function BleedBackdrop({ edge }: { edge: "top" | "bottom" }) {
  const safe = `env(safe-area-inset-${edge}, 0px)`;
  const dir = edge === "top" ? "to bottom" : "to top";
  const bg = (pct: number) =>
    `color-mix(in srgb, var(--bg) ${pct}%, transparent)`;
  // Solid through the safe area, then a long ease-out fade across the bar.
  const tint = `linear-gradient(${dir}, var(--bg) 0, var(--bg) ${safe}, ${bg(70)} calc(${safe} + 0.2 * var(--m-${edge === "top" ? "nav" : "foot"}-h)), ${bg(38)} calc(${safe} + 0.5 * var(--m-${edge === "top" ? "nav" : "foot"}-h)), ${bg(12)} calc(${safe} + 0.8 * var(--m-${edge === "top" ? "nav" : "foot"}-h)), transparent 100%)`;
  // Blur at full strength behind the whole bar (safe area + nav/footer),
  // then fades out over a short run-out past its inner edge so there's
  // no hard line where the glass ends.
  const mask = `linear-gradient(${dir}, black 0, black calc(${safe} + var(--m-${edge === "top" ? "nav" : "foot"}-h)), transparent 100%)`;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        [edge]: `calc(-1 * ${safe})`,
        [edge === "top" ? "bottom" : "top"]: `-${GLASS_RUNOUT}`,
        maskImage: mask,
        WebkitMaskImage: mask,
        pointerEvents: "none",
      }}
    >
      <div
        data-chrome-tint
        style={{
          position: "absolute",
          inset: 0,
          // Gradient background, never a solid background-color (Safari
          // bar-tint rule — see ChromeBackdrop above).
          backdropFilter: "blur(14px) saturate(1.2)",
          WebkitBackdropFilter: "blur(14px) saturate(1.2)",
          background: tint,
        }}
      />
    </div>
  );
}
