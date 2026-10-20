"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { UAP_SHAPES } from "./uapShapes";

/**
 * Ambient sprite-cycle star field. Each star runs through:
 *   invisible → dot → small → large → small → dot → invisible
 * on a discrete frame timeline (no tween between frames). Stars take the
 * current `--accent` color via `currentColor`, so they invert with the
 * surrounding section when the parent's color updates.
 *
 * Implementation:
 *   - Three SVG <symbol>s define the three visible frames.
 *   - Each star is a single <use> whose href is swapped on a per-star timer.
 *   - Position is randomized on mount and re-randomized at the start of each
 *     full cycle, so the field never feels static.
 *   - All timers run off one rAF loop; we mutate <use> attributes directly
 *     rather than re-rendering React state for every frame swap.
 */

type Frame = "invisible" | "dot" | "small" | "large";

// Visible cycle (the leading "invisible" frame is the gap before the next cycle starts).
const CYCLE: Frame[] = ["invisible", "dot", "small", "large", "small", "dot"];

// Per-frame duration ranges in ms. Invisible has the widest range so the field
// has a natural breathing rhythm rather than a metronome cadence.
const FRAME_MS: Record<Frame, [number, number]> = {
  invisible: [400, 1200],
  dot: [180, 220],
  small: [180, 220],
  large: [260, 340],
};

type Star = {
  step: number;
  nextAt: number;
};

/** Per-shooter state. A shooter sits idle until `nextAt`, then plays a
 *  short diagonal streak across the field over `durationMs`, then
 *  returns to idle for another randomized gap. */
type Shooter = {
  // Geometry of the active streak, expressed as viewport-relative
  // fractions (0-1) so we don't need to know the SVG pixel size.
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  // ms timestamps
  nextAt: number; // when to start the next streak (animating === false)
  startedAt: number; // when this streak began (animating === true)
  durationMs: number;
  animating: boolean;
  /** Peak opacity for THIS streak — randomized per fire so brightness
   *  varies and the field doesn't read as a metronome. */
  peakOpacity: number;
};

type Props = {
  /** Star count. Spec: 30–60; we run lower by default for breathing room. */
  count?: number;
  /** Pixel size of each star (width and height of the <use>). */
  size?: number;
  /** Stroke/fill color. Defaults to currentColor so parents can set via CSS (e.g. var(--accent)). */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Scales the invisible gap between a star's cycles (1 = default).
   *  Lower = stars re-appear more often (a faster twinkle rate). */
  gapScale?: number;
  /** CSS selector for elements stars should not be placed under (e.g.
   *  opaque cards). Matched within the field's parent section; each
   *  placement retries a few times to land outside those boxes. */
  avoid?: string;
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function frameDuration(frame: Frame, gapScale = 1) {
  const [lo, hi] = FRAME_MS[frame];
  return rand(lo, hi) * (frame === "invisible" ? gapScale : 1);
}

export default function StarField({
  count = 14,
  size = 20,
  color = "currentColor",
  className,
  style,
  gapScale = 1,
  avoid,
}: Props) {
  const useRefs = useRef<(SVGUseElement | null)[]>([]);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // Shooting-star streaks. 2 shooters total — they take turns firing,
  // each with a randomized 6–18s idle gap before the next streak.
  const shooterRefs = useRef<(SVGLineElement | null)[]>([]);
  const shootersRef = useRef<Shooter[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Generate randomized initial state inside the effect (Math.random isn't
    // allowed during render under React 19's purity rules).
    const now = performance.now();

    // Random position (as % strings), retried to fall outside any
    // `avoid` element's box. Boxes are read at placement time only, so
    // layout changes (resize, reveal animations) are picked up for free.
    const host = containerRef.current;
    const place = (el: SVGUseElement | null) => {
      if (!el) return;
      let x = Math.random() * 100;
      let y = Math.random() * 100;
      if (avoid && host) {
        const hr = host.getBoundingClientRect();
        const scope = host.closest("section") ?? document;
        const boxes = Array.from(scope.querySelectorAll(avoid)).map((n) =>
          n.getBoundingClientRect()
        );
        const pad = size / 2;
        for (let tries = 0; tries < 12; tries++) {
          const px = hr.left + (x / 100) * hr.width;
          const py = hr.top + (y / 100) * hr.height;
          const hit = boxes.some(
            (b) =>
              px > b.left - pad && px < b.right + pad &&
              py > b.top - pad && py < b.bottom + pad
          );
          if (!hit) break;
          x = Math.random() * 100;
          y = Math.random() * 100;
        }
      }
      el.setAttribute("x", `${x}%`);
      el.setAttribute("y", `${y}%`);
    };

    starsRef.current = Array.from({ length: count }, () => ({
      step: Math.floor(Math.random() * CYCLE.length),
      nextAt: now + rand(0, 800),
    }));

    // Set initial position + frame on each <use>
    for (let i = 0; i < starsRef.current.length; i++) {
      const el = useRefs.current[i];
      place(el);
      applyFrame(el, CYCLE[starsRef.current[i].step], uid);
    }

    if (prefersReduced) return;

    // Seed shooters in idle state with long, random initial gaps so
    // the two streakers don't fire in sync (and they don't fire at
    // all for the first many seconds after a section is shown).
    const shooterCount = shooterRefs.current.length;
    shootersRef.current = Array.from({ length: shooterCount }, () => ({
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      nextAt: now + rand(3000, 12000),
      startedAt: 0,
      durationMs: 0,
      animating: false,
      peakOpacity: 0,
    }));

    const tick = (t: number) => {
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (t < s.nextAt) continue;

        s.step = (s.step + 1) % CYCLE.length;
        const frame = CYCLE[s.step];

        // Re-randomize position when we wrap back to the start of a cycle.
        if (s.step === 0) {
          place(useRefs.current[i]);
        }

        applyFrame(useRefs.current[i], frame, uid);
        s.nextAt = t + frameDuration(frame, gapScale);
      }

      // Shooting stars. Each shooter is either idle (counting down to
      // nextAt) or animating (linear translate across the field). The
      // streak is rendered as a short diagonal <line> via x1/y1/x2/y2
      // updates plus an opacity fade-in / fade-out envelope.
      const shooters = shootersRef.current;
      for (let i = 0; i < shooters.length; i++) {
        const sh = shooters[i];
        const el = shooterRefs.current[i];
        if (!el) continue;
        if (!sh.animating) {
          if (t < sh.nextAt) continue;
          // Kick off a new streak. Direction (signX / signY) and
          // length are fully randomized so streaks cross the field in
          // any direction at any size, not just an upper-left-to-
          // lower-right ramp. Start point sits just outside the
          // viewport on whichever edge the streak originates from.
          const signX = Math.random() < 0.5 ? -1 : 1;
          const signY = Math.random() < 0.5 ? -1 : 1;
          // Length 0.25 → 1.2 of viewport diagonal — wide variance,
          // so some streaks are barely visible and others traverse
          // nearly the whole field.
          const length = rand(0.25, 1.2);
          // Random origin somewhere in or just outside the viewport.
          const sx = rand(-0.1, 1.1);
          const sy = rand(-0.1, 1.1);
          // dx, dy independently scaled — gives slopes ranging from
          // shallow to steep rather than locked near 45°.
          const dx = signX * rand(0.15, 1.0) * length;
          const dy = signY * rand(0.15, 1.0) * length;
          sh.startX = sx;
          sh.startY = sy;
          sh.endX = sx + dx;
          sh.endY = sy + dy;
          sh.durationMs = rand(500, 1400);
          sh.startedAt = t;
          sh.animating = true;
          // Per-streak peak brightness: 0.2 → 0.65 means most are
          // quite subtle, the occasional one reads brighter.
          sh.peakOpacity = rand(0.2, 0.65);
        }
        const elapsed = t - sh.startedAt;
        const progress = Math.min(1, elapsed / sh.durationMs);
        // Head + tail positions: tail trails behind the head by a fixed
        // fraction of the path. Both interpolate from start → end.
        const tailLag = 0.08;
        const headX = sh.startX + (sh.endX - sh.startX) * progress;
        const headY = sh.startY + (sh.endY - sh.startY) * progress;
        const tailProgress = Math.max(0, progress - tailLag);
        const tailX = sh.startX + (sh.endX - sh.startX) * tailProgress;
        const tailY = sh.startY + (sh.endY - sh.startY) * tailProgress;
        // Envelope: fade in over first 20%, hold, fade out over last
        // 20%. Peak opacity intentionally subtle.
        const env =
          progress < 0.2
            ? progress / 0.2
            : progress > 0.8
              ? (1 - progress) / 0.2
              : 1;
        el.setAttribute("x1", `${tailX * 100}%`);
        el.setAttribute("y1", `${tailY * 100}%`);
        el.setAttribute("x2", `${headX * 100}%`);
        el.setAttribute("y2", `${headY * 100}%`);
        el.style.opacity = `${env * sh.peakOpacity}`;
        if (progress >= 1) {
          sh.animating = false;
          // Shorter idle gap between streaks so the field reads as
          // more lively. Still varied enough that flashes don't feel
          // metronomic — just more frequent than the original
          // 15-45 s spacing.
          sh.nextAt = t + rand(5000, 18000);
          el.style.opacity = "0";
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [count, uid, gapScale, avoid, size]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        color,
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        ref={containerRef}
        style={{ display: "block", width: "100%", height: "100%", color }}
      >
      <defs>
        {/* Pixel-art-ish discrete frames. Each symbol uses currentColor so
            the parent's `color` style controls the fill. */}
        <symbol id={`${uid}-dot`} viewBox="-1 -1 2 2" overflow="visible">
          {/* Single small square pixel */}
          <rect x="-0.16" y="-0.16" width="0.32" height="0.32" fill="currentColor" />
        </symbol>

        <symbol id={`${uid}-small`} viewBox="-1 -1 2 2" overflow="visible">
          {/* Plus shape composed of small square pixels */}
          <rect x="-0.10" y="-0.40" width="0.20" height="0.20" fill="currentColor" />
          <rect x="-0.10" y="-0.20" width="0.20" height="0.20" fill="currentColor" />
          <rect x="-0.10" y="0.00"  width="0.20" height="0.20" fill="currentColor" />
          <rect x="-0.10" y="0.20"  width="0.20" height="0.20" fill="currentColor" />
          <rect x="-0.40" y="-0.10" width="0.20" height="0.20" fill="currentColor" />
          <rect x="-0.20" y="-0.10" width="0.20" height="0.20" fill="currentColor" />
          <rect x="0.00"  y="-0.10" width="0.20" height="0.20" fill="currentColor" />
          <rect x="0.20"  y="-0.10" width="0.20" height="0.20" fill="currentColor" />
        </symbol>

        <symbol id={`${uid}-large`} viewBox="-1 -1 2 2" overflow="visible">
          {/* Diamond sparkle — uniform 0.2-unit pixel grid, no gaps.
              5 rows total, 13 cells: a clean pixelated 4-point star with
              a solid centre. No tapered widths or sub-pixel rects (the
              previous version's smooth taper read more like a smoothed
              vector than a 16-bit sprite, and the asymmetric arms left
              visible gaps inside the shape). */}
          {/* Top tip */}
          <rect x="-0.1" y="-0.5" width="0.2" height="0.2" fill="currentColor" />
          {/* Row above middle — 3 cells */}
          <rect x="-0.3" y="-0.3" width="0.2" height="0.2" fill="currentColor" />
          <rect x="-0.1" y="-0.3" width="0.2" height="0.2" fill="currentColor" />
          <rect x="0.1"  y="-0.3" width="0.2" height="0.2" fill="currentColor" />
          {/* Middle row — 5 cells (full horizontal arm + centre) */}
          <rect x="-0.5" y="-0.1" width="0.2" height="0.2" fill="currentColor" />
          <rect x="-0.3" y="-0.1" width="0.2" height="0.2" fill="currentColor" />
          <rect x="-0.1" y="-0.1" width="0.2" height="0.2" fill="currentColor" />
          <rect x="0.1"  y="-0.1" width="0.2" height="0.2" fill="currentColor" />
          <rect x="0.3"  y="-0.1" width="0.2" height="0.2" fill="currentColor" />
          {/* Row below middle — 3 cells */}
          <rect x="-0.3" y="0.1" width="0.2" height="0.2" fill="currentColor" />
          <rect x="-0.1" y="0.1" width="0.2" height="0.2" fill="currentColor" />
          <rect x="0.1"  y="0.1" width="0.2" height="0.2" fill="currentColor" />
          {/* Bottom tip */}
          <rect x="-0.1" y="0.3" width="0.2" height="0.2" fill="currentColor" />
        </symbol>
      </defs>

      {Array.from({ length: count }, (_, i) => (
        <use
          key={i}
          ref={(el) => {
            useRefs.current[i] = el;
          }}
          width={size}
          height={size}
          // x/y/href are set imperatively in the effect + rAF loop.
          style={{ overflow: "visible" }}
        />
      ))}

      {/* Shooting-star streaks. Two lines, both currentColor + thin
          stroke + round line cap, animated imperatively via the tick
          loop (endpoints + opacity rewritten per frame). Default
          opacity 0 so they're invisible until a streak fires. */}
      {[0, 1].map((i) => (
        <line
          key={`shooter-${i}`}
          ref={(el) => {
            shooterRefs.current[i] = el;
          }}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ opacity: 0 }}
        />
      ))}
      </svg>
      <UfoFlyby />
    </div>
  );
}

/* ─── UAP fly-by (random silhouette per appearance) ────────────────────────────────────────────────────────
   Occasional saucer that zooms toward the viewer and zips away. Idle
   most of the time — first appearance 30-90s after mount, then 60-180s
   between subsequent fly-bys. The motion is framer-driven so its own
   spring/keyframe pipeline composes cleanly with the surrounding
   imperative star animations.
*/
function UfoFlyby() {
  const controls = useAnimationControls();
  // Which UAP silhouette this appearance uses — re-rolled before every
  // fly-by (never the same shape twice in a row). See uapShapes.ts.
  const [shape, setShape] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const fly = async () => {
      if (cancelled) return;
      setShape((prev) => {
        const n = UAP_SHAPES.length;
        const next = Math.floor(Math.random() * (n - 1));
        return next >= prev ? next + 1 : next;
      });
      const sx = rand(20, 80);
      const sy = rand(25, 65);
      // Zip-away direction: opposite side of the screen, slightly down.
      const zipX = sx < 50 ? 130 : -30;
      const zipY = sy + rand(15, 45);
      await controls.set({
        left: `${sx}%`,
        top: `${sy}%`,
        scale: 0.08,
        opacity: 0,
        rotate: 0,
      });
      // Approach — slow zoom toward the viewer with slight drift.
      await controls.start({
        scale: 1.4,
        opacity: 1,
        left: `${sx + rand(-7, 7)}%`,
        top: `${sy - 5}%`,
        rotate: rand(-6, 6),
        transition: { duration: 4.5, ease: [0.22, 1, 0.36, 1] },
      });
      if (cancelled) return;
      await new Promise((r) => {
        timer = window.setTimeout(r, 220);
      });
      if (cancelled) return;
      // Zip-away — fast translate off-screen + shrink + tilt.
      await controls.start({
        left: `${zipX}%`,
        top: `${zipY}%`,
        scale: 0.3,
        opacity: 0,
        rotate: 32,
        transition: { duration: 0.7, ease: "easeIn" },
      });
      if (cancelled) return;
      timer = window.setTimeout(fly, rand(60_000, 180_000));
    };
    timer = window.setTimeout(fly, rand(30_000, 90_000));
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [controls]);
  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0, scale: 0.08 }}
      style={{
        position: "absolute",
        width: 48,
        height: 24,
        marginLeft: -24,
        marginTop: -12,
        pointerEvents: "none",
        transformOrigin: "center",
        willChange: "transform, opacity",
      }}
    >
      <svg
        width="48"
        height="24"
        viewBox="0 0 48 24"
        style={{ display: "block", overflow: "visible" }}
        // Static, trusted markup from uapShapes.ts (no user input).
        dangerouslySetInnerHTML={{ __html: UAP_SHAPES[shape].svg }}
      />
    </motion.div>
  );
}

function applyFrame(useEl: SVGUseElement | null, frame: Frame, uid: string) {
  if (!useEl) return;
  if (frame === "invisible") {
    useEl.removeAttribute("href");
    useEl.style.display = "none";
    return;
  }
  useEl.style.display = "";
  useEl.setAttribute("href", `#${uid}-${frame}`);
}
