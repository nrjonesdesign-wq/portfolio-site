"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

type Props = {
  size?: "large" | "nav";
  /** Stagger the wordmark in via per-letter cascade (used on Loading entrance) */
  cascadeWordmark?: boolean;
  /** Delay (s) before the wordmark cascade starts. */
  wordmarkDelay?: number;
  className?: string;
  /** Force the comet trail to use the same stroke width as the planet
   *  circle. Used on the mobile loading screen so all strokes read as
   *  a single uniform weight. Defaults to false (desktop keeps its
   *  thinner-comet, heavier-circle balance). */
  equalStrokes?: boolean;
  /** @deprecated retained for call-site compatibility — no longer used internally. */
  uid?: string;
};

/* ────────────────────────────────────────────────────────────────────────────
   Single electron orbit
   ────────────────────────────────────────────────────────────────────────────
   One bright comet head traces an ellipse. Each frame a translucent layer of
   the current background colour is painted over the canvas, so the trail
   gradient-fades behind the head. The ellipse rotates by a fixed number of
   degrees per orbit, so successive laps trace at slightly different angles —
   over time, overlapping fading trails accumulate into the spirograph weave.

   The orbit is rendered onto two stacked canvases — one behind the planet
   circle, one in front — and which canvas receives the current frame's stroke
   is decided by the orbit phase (the "near" half of the local ellipse goes
   on the front canvas; the "far" half on the back canvas). The result reads
   as one continuous orbit weaving through the nucleus.
*/

const ORBIT_DURATION_SEC = 1.8;          // one full lap — slower, ambient drift
const DRIFT_DEG_PER_ORBIT = 7;           // ellipse tilt advance per orbit
// Sub-steps per frame: smooths the rendered chord into a smoother curve.
const SUBSTEPS = 5;
// Trail covers this many full orbits. >1 keeps older laps around as
// faded ghosts so the rotation drift accumulates into a visible
// spirograph pattern.
const TRAIL_ORBITS = 3.0;
// Derived: one frame of trail = 60fps × SUBSTEPS sub-samples per second.
const TRAIL_LEN = Math.round(60 * SUBSTEPS * ORBIT_DURATION_SEC * TRAIL_ORBITS);
// Power curve for trail alpha decay. 1.0 = linear; >1 = sharper head.
// Lower (closer to 1) keeps more of the trail visible at meaningful alpha
// so older laps build the spirograph weave before fading out.
const TRAIL_DECAY_POWER = 1.6;

const RING = {
  rxFrac: 0.42,            // ellipse semi-major axis as fraction of canvas dim
  ryFrac: 0.160,           // ~80% of planet radius so the orbit weaves in/out of the nucleus
  swFrac: 0.0040,          // comet stroke width — thinner than the planet outline (0.0050 viewBox units)
  rotateDeg: -15,          // initial rotation
};

const PLANET_R_FRAC = 0.195;
const PLANET_STROKE_FRAC = 0.0050;
const FONT_SIZE_FRAC = 0.13;
const VB = 200; // SVG viewBox dim

/* ────────────────────────────────────────────────────────────────────────────
   PlanetCircle — SVG layer 2 (between back and front canvases)
*/
function PlanetCircle() {
  return (
    <svg
      viewBox={`-${VB / 2} -${VB / 2} ${VB} ${VB}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 2,
        overflow: "visible",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      {/* Stroke width is driven by --planet-stroke (set on the wrapper
          each frame by the tick loop). The custom property interpolates
          between 3 css px at loading scale and 1 css px at nav scale,
          following the rendered scale of the parent element. */}
      <circle
        cx="0"
        cy="0"
        r={PLANET_R_FRAC * VB}
        fill="var(--bg)"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
        style={{ strokeWidth: "var(--planet-stroke, 1px)" }}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Wordmark — SVG layer 4 (always on top so the orbit never hides "NRJ")
*/
type WordmarkProps = {
  cascadeWordmark?: boolean;
  wordmarkDelay?: number;
};

function Wordmark({ cascadeWordmark = false, wordmarkDelay = 0 }: WordmarkProps) {
  const fontSize = FONT_SIZE_FRAC * VB;
  // Render NRJ as a single <text> element with natural font kerning +
  // explicit letter-spacing. The previous per-letter approach used manual
  // x-offsets tuned for large display sizes; at the smaller nav-scale
  // (NAV_PLANET_PX 113 → 14.7px font) those offsets read as crowded /
  // overlapping ("smooshed together"). A single text element lets the
  // font's own glyph metrics drive the spacing, which renders cleanly at
  // every scale the morph passes through.
  return (
    <svg
      viewBox={`-${VB / 2} -${VB / 2} ${VB} ${VB}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 4,
        overflow: "visible",
        pointerEvents: "none",
      }}
      aria-label="NRJ"
      role="img"
    >
      <motion.text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="800"
        // Slight positive tracking matches the case-study NRJ mark's
        // letterSpacing 0.02em — keeps the glyphs visually separated even
        // when the wordmark scales down with the morph.
        letterSpacing={fontSize * 0.02}
        style={{
          fontFamily: "var(--font-manrope, 'Manrope', sans-serif)",
          fill: "currentColor",
          userSelect: "none",
        }}
        initial={cascadeWordmark ? { opacity: 0, y: fontSize * 0.4 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: wordmarkDelay,
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        NRJ
      </motion.text>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   NRJPlanet — public wrapper
*/
export default function NRJPlanet({
  cascadeWordmark = false,
  wordmarkDelay = 0,
  className,
  equalStrokes = false,
}: Props) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const back = backRef.current;
    const front = frontRef.current;
    if (!back || !front) return;
    const backCtx = back.getContext("2d");
    const frontCtx = front.getContext("2d");
    if (!backCtx || !frontCtx) return;

    const dpr = window.devicePixelRatio || 1;
    let cssW = 0;
    let cssH = 0;

    const resize = () => {
      // Use offsetWidth/Height (layout box, unaffected by CSS transforms)
      // instead of getBoundingClientRect() — the parent runs a scale spring
      // on entrance, and getBoundingClientRect would return ~0 mid-animation,
      // sizing the canvas backing buffer to 1px (which then stays that way
      // forever because ResizeObserver doesn't fire on transform changes).
      const w = back.offsetWidth || back.clientWidth;
      const h = back.offsetHeight || back.clientHeight;
      cssW = w;
      cssH = h;
      const bw = Math.max(1, Math.round(cssW * dpr));
      const bh = Math.max(1, Math.round(cssH * dpr));
      for (const c of [back, front]) {
        c.width = bw;
        c.height = bh;
      }
      const sx = bw / Math.max(1, cssW);
      const sy = bh / Math.max(1, cssH);
      backCtx.setTransform(sx, 0, 0, sy, 0, 0);
      frontCtx.setTransform(sx, 0, 0, sy, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(back);

    const omega = (2 * Math.PI) / ORBIT_DURATION_SEC; // rad / sec
    const driftRadPerSec =
      ((DRIFT_DEG_PER_ORBIT / 360) * 2 * Math.PI) / ORBIT_DURATION_SEC;

    let phase = 0;
    let rotation = (RING.rotateDeg * Math.PI) / 180;
    let lastT = performance.now();
    let raf = 0;

    // Circular buffer of trail positions. Index 0 = oldest, last = newest head.
    type Sample = { x: number; y: number; isFront: boolean };
    const trail: Sample[] = [];

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;

      // Live foreground colour pickup so the comet inverts with the section.
      const styles = getComputedStyle(back);
      const fg = styles.color;

      // Live spin-rate multiplier — the loading→who transition bumps
      // this via html.spin-boost so the planet visibly winds up before
      // the warp. Default 1 (normal orbit). NaN-guarded for the case
      // where the var isn't set on this element's cascade.
      const spinRaw = parseFloat(styles.getPropertyValue("--planet-spin-mult"));
      const spinMult = Number.isFinite(spinRaw) && spinRaw > 0 ? spinRaw : 1;

      const cx = cssW / 2;
      const cy = cssH / 2;
      const dim = Math.min(cssW, cssH);
      const rx = RING.rxFrac * dim;
      const ry = RING.ryFrac * dim;
      // Stroke width interpolates between 3 visual css px at loading
      // scale (visualScale ≈ 1) and ~1.5 visual css px at nav scale
      // (visualScale ≈ 0.17). The 1.5px floor (was 1px) keeps the
      // outline + comet readable at nav size — a flat 1px line ends up
      // sub-pixel after subpixel rounding + anti-aliasing and reads as
      // a faint hairline rather than a stroke. The canvas-internal sw
      // is then visualStroke / visualScale so the post-transform
      // on-screen stroke matches the target. The same target px value
      // is exposed to the planet circle via the --planet-stroke CSS
      // variable (set on the wrapper) so the SVG's non-scaling-stroke
      // renders identically thick.
      const rect = back.getBoundingClientRect();
      const visualScale = rect.width > 0 ? rect.width / cssW : 1;
      const morphT = Math.max(0, Math.min(1, (visualScale - 0.21) / 0.79));
      // SVG planet circle outline + canvas comet trail use DIFFERENT
      // stroke widths so the static outline reads as the visual anchor
      // while the orbiting comet is a lighter accent. Both interpolate
      // up to a slightly heavier weight in the large loading state.
      const circleStrokePx = 3.5 + 0.5 * morphT;
      const cometStrokePx = equalStrokes
        ? circleStrokePx
        : 2 + 0.5 * morphT;
      // Kept under the original name for the SVG var below.
      const visualStrokePx = circleStrokePx;
      // Comet uses its own (thinner) target stroke; circle uses
      // visualStrokePx via the --planet-stroke CSS var.
      const sw = cometStrokePx / Math.max(0.05, visualScale);
      if (wrapperRef.current) {
        wrapperRef.current.style.setProperty(
          "--planet-stroke",
          `${visualStrokePx}px`
        );
      }

      // Advance physics across SUBSTEPS smaller intervals so the rendered
      // path is a smooth polygon instead of ~30 chords/orbit.
      const startPhase = phase;
      const startRot = rotation;
      phase += omega * spinMult * dt;
      rotation += driftRadPerSec * spinMult * dt;
      const phaseStep = (phase - startPhase) / SUBSTEPS;
      const rotStep = (rotation - startRot) / SUBSTEPS;

      for (let s = 1; s <= SUBSTEPS; s++) {
        const ph = startPhase + phaseStep * s;
        const rt = startRot + rotStep * s;
        const localX = rx * Math.cos(ph);
        const localY = ry * Math.sin(ph);
        const cosR = Math.cos(rt);
        const sinR = Math.sin(rt);
        const x = cx + localX * cosR - localY * sinR;
        const y = cy + localX * sinR + localY * cosR;

        // "Front" half of the orbit = phase in (π, 2π), where the local-frame
        // y is above centre. With viewer-above perspective this is the half
        // nearer the viewer, so it draws on top of the planet circle.
        const isFront = Math.sin(ph) < 0;

        trail.push({ x, y, isFront });
        if (trail.length > TRAIL_LEN) trail.shift();
      }

      // Clear-and-redraw approach: wipe both canvases, then redraw the entire
      // trail with per-segment alpha. Avoids any per-frame compositing
      // accumulation that produced the boxy halo with destination-out.
      backCtx.clearRect(0, 0, cssW, cssH);
      frontCtx.clearRect(0, 0, cssW, cssH);

      backCtx.strokeStyle = fg;
      frontCtx.strokeStyle = fg;
      backCtx.lineWidth = sw;
      frontCtx.lineWidth = sw;
      // Butt + miter so adjacent chord segments butt cleanly against one
      // another rather than each round cap registering as a visible dot.
      backCtx.lineCap = "butt";
      frontCtx.lineCap = "butt";
      backCtx.lineJoin = "miter";
      frontCtx.lineJoin = "miter";

      const N = trail.length;
      for (let i = 1; i < N; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        // Always draw the chord, even when it straddles the front/back
        // boundary — drawing on the new sample's canvas means the chord
        // briefly extends one tiny segment onto that canvas, which closes
        // the visible "pixel gap" at the orbit's apex/nadir without any
        // visible artifact (consecutive sub-step samples are < 2° apart).
        const ctx = b.isFront ? frontCtx : backCtx;
        const t01 = i / (N - 1);
        const alpha = Math.pow(t01, TRAIL_DECAY_POWER);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      backCtx.globalAlpha = 1;
      frontCtx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [equalStrokes]);

  // Sizing: large fills its container; nav uses 100% so callers can size it
  // explicitly via the wrapping element (Nav passes a 60px box).
  const sizeStyle: React.CSSProperties = { width: "100%", height: "100%" };

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ position: "relative", ...sizeStyle }}
      aria-label="NRJ"
    >
      <canvas
        ref={backRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
        }}
        aria-hidden
      />

      {/* Planet circle */}
      <PlanetCircle />

      <canvas
        ref={frontRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 3,
          pointerEvents: "none",
        }}
        aria-hidden
      />

      {/* NRJ wordmark — always on top */}
      <Wordmark cascadeWordmark={cascadeWordmark} wordmarkDelay={wordmarkDelay} />
    </div>
  );
}
