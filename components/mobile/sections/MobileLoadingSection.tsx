"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import StarField from "@/components/starfield/StarField";
import NRJPlanet from "@/components/nav/NRJPlanet";
import { EASE_SPRING } from "@/lib/motion";

/**
 * Mobile loading panel.
 *
 * Same beats as desktop:
 *   1. Sage background, ink-stroked planet centred-ish, NRJ rises in.
 *   2. After ~2.4s, scheme flips to ink/sage (loadingInverted state
 *      is owned by the parent and toggles via the `inverted` prop).
 *   3. First scroll / tap advances out, triggering the planet shrink
 *      + nav reveal handled in MobileHome.
 */

type Props = {
  /** Driven from MobileHome's loadingInverted state. */
  inverted: boolean;
  /** Fires the warp + smooth-scroll sequence when the planet is tapped. */
  onAdvance?: () => void;
};

export default function MobileLoadingSection({ inverted, onAdvance }: Props) {
  // Local mount flag so the planet only scale-in animates once.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 30);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section
      id="loading"
      className="snap"
      style={{
        backgroundColor: "var(--bg)",
        position: "relative",
        height: "100dvh",
      }}
    >
      {/* Star field — `.star-field` is the hook the warp transition
          latches onto (see html.warping rule in globals.css). */}
      <div
        aria-hidden
        className="star-field"
        style={{
          position: "absolute",
          inset: 0,
          color: "var(--fg)",
          opacity: inverted ? 0.55 : 0.45,
        }}
      >
        <StarField className="w-full h-full" count={16} size={22} />
      </div>

      {/* Centred planet — tappable. Sized to ~38vw with a 14rem max so
          it stays roughly the proportion shown in the mobile PDF
          rather than dominating tall narrow viewports. Tapping
          smooth-scrolls to the WHO panel, matching the [SCROLL] cue's
          intent on the Hello screen. */}
      <motion.button
        type="button"
        aria-label="Continue to bio"
        onClick={() => {
          if (onAdvance) {
            onAdvance();
          } else {
            document
              .getElementById("who")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: mounted ? 1 : 0, opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.85, ease: EASE_SPRING }}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          // ~3× the previous mobile loading size — the planet now
          // dominates the viewport like the desktop loading screen.
          width: "min(90vw, 36rem)",
          aspectRatio: "1 / 1",
          translate: "-50% -50%",
          color: "var(--fg)",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {/* cascadeWordmark stays true for the entire lifetime — passing
            it as `mounted` (false → true on first effect) caused framer
            to apply the new initial state (opacity 0) without firing
            the animate, leaving the wordmark stuck invisible until a
            subsequent re-render. With the constant `true`, the wordmark
            mounts with opacity 0 and animates to 1 once after the
            delay, which is the intent. The outer button's opacity
            spring still gates the entire planet's reveal. */}
        <NRJPlanet
          cascadeWordmark
          wordmarkDelay={0.55}
          equalStrokes
          strokeScale={0.55}
        />
      </motion.button>
    </section>
  );
}
