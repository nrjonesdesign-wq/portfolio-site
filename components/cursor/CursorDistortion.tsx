"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-following liquid distortion. A small fixed-position circular
 * element that follows the pointer and applies an SVG <feDisplacementMap>
 * via backdrop-filter to whatever is rendered beneath it. The displacement
 * map is driven by a slowly-shifting <feTurbulence> seed so the warp keeps
 * flowing without repeating, and the scale parameter eases in/out when the
 * cursor enters/leaves an interactive element (links, buttons,
 * [data-magnetic]).
 *
 * Note: this trades the OGL/Three.js GLSL pipeline for the browser's native
 * SVG-filter compositor — same visual effect (cursor-centred elastic
 * displacement of underlying content), zero added libraries, far cheaper at
 * runtime. Drop in an OGL shader implementation later if a more bespoke
 * liquid behaviour becomes a design need.
 */

const RADIUS = 110;            // px — half-width of distortion zone
const MAX_SCALE = 24;          // displacement strength when fully active
const EASE = 0.12;             // per-frame lerp toward target scale
const SEED_SPEED = 0.35;       // how fast the noise seed advances

export default function CursorDistortion() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const mouse = { x: -9999, y: -9999 };
    const pos = { x: -9999, y: -9999 };
    let scale = 0;
    let target = 0;
    let seed = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Test what's under the cursor — same heuristic as MagneticCursor.
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const interactive = el?.closest(
        "a, button, [data-magnetic], [data-cursor]"
      );
      target = interactive ? MAX_SCALE : 0;
    };

    const tick = () => {
      // Eased follow on position so the warp lags slightly behind the cursor
      // (gives the elastic/liquid feel rather than a stiff clamp).
      pos.x += (mouse.x - pos.x) * 0.22;
      pos.y += (mouse.y - pos.y) * 0.22;

      // Eased scale in/out
      scale += (target - scale) * EASE;

      // Slowly shift the noise seed so the displacement keeps morphing
      seed += SEED_SPEED;

      wrapper.style.transform = `translate3d(${pos.x - RADIUS}px, ${pos.y - RADIUS}px, 0)`;
      wrapper.style.opacity = String(Math.min(1, scale / 4));

      if (filterRef.current) {
        filterRef.current.setAttribute("scale", scale.toFixed(2));
      }
      if (turbRef.current) {
        turbRef.current.setAttribute("seed", seed.toFixed(2));
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* SVG filter definition. Width/height 0 + position fixed keeps it
          out of layout while still being referenceable from CSS. */}
      <svg
        aria-hidden
        style={{ position: "fixed", width: 0, height: 0, pointerEvents: "none" }}
      >
        <defs>
          <filter
            id="cursor-liquid"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves="2"
              seed="0"
              result="noise"
            />
            <feDisplacementMap
              ref={filterRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div
        ref={wrapperRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: RADIUS * 2,
          height: RADIUS * 2,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          // The mask shapes the distortion zone into a soft circle so the
          // displaced area has feathered edges instead of a hard circle cut.
          maskImage:
            "radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%)",
          backdropFilter: "url(#cursor-liquid)",
          WebkitBackdropFilter: "url(#cursor-liquid)",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      />
    </>
  );
}
