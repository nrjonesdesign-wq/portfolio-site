"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type CursorState = "default" | "view" | "link" | "text";

// Higher LERP = tighter follow. 0.28 gives a ~33ms half-life (vs.
// 0.12's ~83ms), which feels responsive without losing the easing
// against the magnetic-pull adjustments below.
const LERP = 0.28;
const MAGNETIC_RADIUS = 52;
const MAGNETIC_STRENGTH = 0.25;

export default function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -200, y: -200 });
  const posRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);
  const [state, setState] = useState<CursorState>("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setVisible(true);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      const cursorAttr = el.closest("[data-cursor]")?.getAttribute("data-cursor");
      if (cursorAttr === "view") setState("view");
      else if (cursorAttr === "link") setState("link");
      else if (cursorAttr === "text") setState("text");
      else setState("default");

      // Per-element cursor color override. Any ancestor with
      // `data-cursor-color="<token>"` (e.g. "ink", "sky", "bg", "fg")
      // tells the cursor to render in that token while it's over the
      // element. Use this for surfaces where the section's --fg matches
      // the local backdrop colour and the cursor would otherwise be
      // invisible (project preview area, inverted tab boxes, etc).
      const colorAttr = el
        .closest("[data-cursor-color]")
        ?.getAttribute("data-cursor-color");
      const root = document.documentElement;
      if (colorAttr) {
        root.style.setProperty("--cursor-fg", `var(--${colorAttr})`);
      } else {
        root.style.removeProperty("--cursor-fg");
      }
    };

    const loop = () => {
      const target = { ...mouseRef.current };

      const magnets = document.querySelectorAll<HTMLElement>("[data-magnetic]");
      magnets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouseRef.current.x - cx;
        const dy = mouseRef.current.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAGNETIC_RADIUS) {
          const pull = (1 - dist / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH;
          target.x -= dx * pull;
          target.y -= dy * pull;
        }
      });

      posRef.current.x += (target.x - posRef.current.x) * LERP;
      posRef.current.y += (target.y - posRef.current.y) * LERP;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!visible) return null;

  const isView = state === "view";
  const isLink = state === "link";
  const isText = state === "text";

  // Each visual element is sized via animated width/height + matching
  // negative margin (= -size/2). This keeps the element centred on the
  // wrapper's (0,0) without using transform — which would clash with
  // framer-motion's transform pipeline and silently zero things out.
  //
  // Default (inactive) is a MINI lens (~1/3 of the 96px active lens) —
  // same warp + chromatic split, just smaller. Link / text hide the
  // lens entirely; the ring / I-beam carry those states. No centre dot
  // in either lens size.
  const lensSize = isView ? 96 : isLink || isText ? 0 : 32;
  const linkSize = isLink ? 18 : 0;

  const spring = { type: "spring" as const, stiffness: 320, damping: 26, mass: 0.7 };

  return (
    <div
      ref={cursorRef}
      aria-hidden
      data-cursor-state={state}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        willChange: "transform",
      }}
    >
      {/* SVG filter — slight low-frequency warp on the backdrop plus a tiny
          R/B channel offset for chromatic aberration. No brightness, no
          saturation boost; channels are summed back via arithmetic feComposite
          (not screen blend) so the lens preserves the source luminance. */}
      <svg
        aria-hidden
        style={{ position: "fixed", width: 0, height: 0, pointerEvents: "none" }}
      >
        <defs>
          <filter id="cursor-lens" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014"
              numOctaves="2"
              seed="5"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="14"
              xChannelSelector="R"
              yChannelSelector="G"
              result="warped"
            />
            {/* Extract R, offset left ~2px */}
            <feColorMatrix
              in="warped"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="r"
            />
            <feOffset in="r" dx="-2" dy="0" result="rOff" />
            {/* G stays in place */}
            <feColorMatrix
              in="warped"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="g"
            />
            {/* Extract B, offset right ~2px */}
            <feColorMatrix
              in="warped"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="b"
            />
            <feOffset in="b" dx="2" dy="0" result="bOff" />
            {/* Additive recomposition — preserves source luminance unlike
                screen blend, so the lens reads as a clean warp + RGB split
                without the highlights blowing out. */}
            <feComposite
              in="rOff"
              in2="g"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
              result="rg"
            />
            <feComposite
              in="rg"
              in2="bOff"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
            />
          </filter>
        </defs>
      </svg>

      {isText ? (
        <div
          style={{
            position: "absolute",
            top: -11,
            left: -1,
            width: 2,
            height: 22,
            backgroundColor: "var(--cursor-fg, var(--cursor-default-fg, var(--fg)))",
            borderRadius: 1,
          }}
        />
      ) : (
        <>
          {/* LINK ring — outline circle that takes over when the cursor sits
              on a [data-cursor="link"] target. */}
          <motion.div
            initial={false}
            animate={{
              width: linkSize,
              height: linkSize,
              marginLeft: -linkSize / 2,
              marginTop: -linkSize / 2,
              opacity: isLink ? 1 : 0,
            }}
            transition={spring}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              borderRadius: "50%",
              border: "1px solid var(--cursor-fg, var(--cursor-default-fg, var(--fg)))",
            }}
          />

          {/* Lens — outline circle whose backdrop is run through the SVG
              filter (slight warp + chromatic R/B split). Visible in both
              default (mini, 32px) and view (full, 96px) states; size
              animates between them. No saturation / contrast / brightness
              boost — the lens reads as pure distorting glass over the
              actual content. */}
          <motion.div
            initial={false}
            animate={{
              width: lensSize,
              height: lensSize,
              marginLeft: -lensSize / 2,
              marginTop: -lensSize / 2,
              opacity: lensSize > 0 ? 1 : 0,
            }}
            transition={spring}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              borderRadius: "50%",
              border:
                "1px solid var(--cursor-fg, var(--cursor-default-fg, var(--fg)))",
              backgroundColor: "transparent",
              backdropFilter: "url(#cursor-lens)",
              WebkitBackdropFilter: "url(#cursor-lens)",
              overflow: "hidden",
            }}
          />
        </>
      )}
    </div>
  );
}
