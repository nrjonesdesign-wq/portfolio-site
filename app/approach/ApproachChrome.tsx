"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useInView, useReducedMotion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion";
import NRJPlanet from "@/components/nav/NRJPlanet";
import { NAV_PLANET_PX } from "@/components/nav/Nav";
import { renderMarqueeSegment } from "@/components/sections/work/WorkSection";
import { ChromeBackdrop, PlanetMark } from "@/components/mobile/MobileChrome";
import MobileMenuOverlay, { type ChromeSection } from "@/components/mobile/MobileMenuOverlay";
import styles from "./approach.module.css";

const LAVENDER = "#c4b6f2";
const INK = "#151515";

/** Root colours per section scheme — the same pair the homepage's
 *  "approach" / "approachIntro" schemes use (lib/colors.ts). */
const SCHEMES = {
  light: { bg: LAVENDER, fg: INK },
  dark: { bg: INK, fg: LAVENDER },
} as const;

/**
 * Drives the root --bg / --fg / --accent (and the iOS theme colour) from
 * whichever [data-scheme] band sits under the middle of the viewport —
 * the Approach-page version of the homepage's useColorScheme. Anything
 * outside the page tree that reads the root tokens (the custom cursor,
 * the mobile nav bar, overscroll, the status bar) then matches the
 * section on screen. Restores the previous values on unmount.
 */
export function ApproachTint() {
  useEffect(() => {
    const root = document.documentElement;
    const prev = {
      bg: root.style.getPropertyValue("--bg"),
      fg: root.style.getPropertyValue("--fg"),
      accent: root.style.getPropertyValue("--accent"),
      htmlBg: root.style.backgroundColor,
      bodyBg: document.body.style.backgroundColor,
    };
    let current: keyof typeof SCHEMES | null = null;

    const apply = (scheme: keyof typeof SCHEMES) => {
      if (scheme === current) return;
      current = scheme;
      const { bg, fg } = SCHEMES[scheme];
      root.style.setProperty("--bg", bg);
      root.style.setProperty("--fg", fg);
      root.style.setProperty("--accent", fg);
      root.style.backgroundColor = bg;
      document.body.style.backgroundColor = bg;
      // Same remove-and-re-append trick as useColorScheme so iOS Safari
      // re-reads the status-bar tint.
      document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = bg;
      document.head.appendChild(meta);
    };

    const update = () => {
      const mid = window.innerHeight / 2;
      const bands = document.querySelectorAll<HTMLElement>("[data-scheme]");
      for (const band of bands) {
        const r = band.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          apply(band.dataset.scheme === "dark" ? "dark" : "light");
          return;
        }
      }
    };

    apply("light");
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      root.style.setProperty("--bg", prev.bg);
      root.style.setProperty("--fg", prev.fg);
      root.style.setProperty("--accent", prev.accent);
      root.style.backgroundColor = prev.htmlBg;
      document.body.style.backgroundColor = prev.bodyBg;
    };
  }, []);
  return null;
}

/**
 * Phone nav — the homepage's mobile bar (MobileChrome): SVG planet mark
 * with a scroll-driven ring, hairline rule, and a Geist Bold
 * "[ APPROACH ]" label that opens the same full-screen MobileMenuOverlay.
 * Picking WHO / WORK / CONTACT loads the homepage at that section;
 * picking APPROACH just closes the menu. Fixed under the iOS status bar,
 * tinted by the root --bg / --fg that ApproachTint keeps in sync.
 * Shown only under 768px (CSS module).
 */
export function ApproachMobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelect = (section: ChromeSection) => {
    setMenuOpen(false);
    if (section === "approach") return;
    const id = section === "who" ? "who-bio" : section;
    window.location.href = `/#${id}`;
  };

  return (
    <>
      <header className={styles.mobileNav}>
        <ChromeBackdrop edge="top" />
        <div className={styles.mobileNavRow}>
          {/* Full page load on purpose — see the note on links home in page.tsx. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" aria-label="Nathaniel Robert Jones — home" className={styles.mobilePlanet}>
            <PlanetMark scrollSource="window" />
          </a>
          <div className={styles.mobileNavRule} />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className={styles.mobileNavLabel}
          >
            [ APPROACH ]
          </button>
        </div>
      </header>
      <MobileMenuOverlay
        open={menuOpen}
        activeSection="approach"
        onSelect={handleSelect}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}

export function CopyEmail({ email }: { email: string }) {
  const [label, setLabel] = useState("Copy email");
  return (
    <button
      type="button"
      data-cursor="view"
      data-magnetic
      className={styles.copy}
      onClick={() => {
        navigator.clipboard
          ?.writeText(email)
          .then(() => {
            setLabel("Copied");
            setTimeout(() => setLabel("Copy email"), 1800);
          })
          .catch(() => setLabel("Copy failed"));
      }}
    >
      {label}
    </button>
  );
}

/**
 * Nav planet mark — rendered exactly the way the homepage docks its
 * planet (DesktopHome MorphingPlanet): a full loading-size NRJPlanet box
 * (min(60vw, 60vh, 720px)) scaled down with a CSS transform to the 113px
 * nav size (NAV_PLANET_PX), clipped to its circle. NRJPlanet derives its
 * stroke weights and canvas detail from that on-screen scale, so drawing
 * it natively at 113px gave heavier strokes than the homepage; scaling
 * the same box down reproduces the homepage mark exactly. Same NRJ
 * wordmark cascade, scroll-linked rotation and 1.18× hover swell. The
 * visible circle (39% of the box) sits on a 44px slot. Links home.
 */
export function NavPlanet() {
  const [rotation, setRotation] = useState(0);
  const [boxPx, setBoxPx] = useState(540);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setRotation(max > 0 ? (window.scrollY / max) * 360 : 0);
    };
    const onResize = () =>
      setBoxPx(Math.min(window.innerWidth * 0.6, window.innerHeight * 0.6, 720));
    onScroll();
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <motion.a
      href="/"
      aria-label="Nathaniel Robert Jones — home"
      data-magnetic
      data-cursor="view"
      className={styles.planetSlot}
      whileHover={{ scale: 1.18 }}
      transition={{ type: "spring", stiffness: 200, damping: 22, mass: 1 }}
    >
      <span
        className={styles.planetBox}
        style={{
          width: boxPx,
          height: boxPx,
          marginLeft: -boxPx / 2,
          marginTop: -boxPx / 2,
          transform: `scale(${NAV_PLANET_PX / boxPx})`,
        }}
      >
        <span style={{ display: "block", width: "100%", height: "100%", transform: `rotate(${rotation}deg)` }}>
          <NRJPlanet cascadeWordmark wordmarkDelay={0.55} />
        </span>
      </span>
    </motion.a>
  );
}

/**
 * Footer — the homepage's fixed meta row, both versions:
 *  - desktop (DesktopHome footer): 5rem bar on the 32-col grid, masked
 *    blur + 45% --bg tint backdrop; SENIOR VISUAL DESIGNER — rule —
 *    AVAILABLE FOR WORK across cols 3–17, (c) 2026 right-aligned at
 *    cols 29–30; labels .text-label at 60%, rule at 35%.
 *  - phones (MobileChrome footer): --m-foot-h bar with ChromeBackdrop;
 *    SENIOR DESIGNER — AVAILABLE FOR WORK — © 2026 in mono --fs-sm,
 *    rules at 70%.
 * Fixed to the viewport bottom and coloured by the root --bg / --fg that
 * ApproachTint switches per section, exactly as on the homepage.
 */
export function ApproachFooter() {
  return (
    <>
      <footer className={styles.footDesk}>
        <div aria-hidden className={styles.footDeskBackdrop} />
        <div className="content-grid w-full" style={{ position: "relative", zIndex: 1 }}>
          <div className={styles.footDeskLead}>
            <span className="text-label" style={{ opacity: 0.6, flex: "0 0 auto" }}>
              Senior Visual Designer
            </span>
            <div className={styles.footDeskRule} />
            <span className="text-label" style={{ opacity: 0.6, flex: "0 0 auto" }}>
              Available for Work
            </span>
          </div>
          <span className={`text-label ${styles.footDeskEnd}`}>(c) 2026</span>
        </div>
      </footer>

      <footer className={styles.footMobile}>
        <ChromeBackdrop edge="bottom" />
        <div className={styles.footMobileRow}>
          <span>Senior Designer</span>
          <div className={styles.footMobileRule} />
          <span>Available for Work</span>
          <div className={styles.footMobileRule} />
          <span>© 2026</span>
        </div>
      </footer>
    </>
  );
}

/**
 * Scrubbable marquee — same type and ★ separators as the homepage Work
 * rows (renderMarqueeSegment), driven by the same rAF pattern as the
 * site's other scrubbable strips:
 *  - drifts left at a constant 56px/s (desktop DisciplineMarquee speed);
 *  - pauses while hovered, like the desktop case-study reels;
 *  - horizontal wheel / trackpad swipe scrubs it, like the reels' wheel
 *    scrub (vertical wheel is left to the page so scrolling past the
 *    band never gets stuck);
 *  - touch-drag scrubs with flick inertia, like the mobile Work marquee
 *    (DRAG_GAIN 1.4, 8px tap threshold, exp(-2.6·t) decay).
 */
export function ScrubMarquee({ text }: { text: string }) {
  const tags = text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const SPEED_PX_PER_SEC = 56;

  const hostRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const hoveredRef = useRef(false);
  const interactingRef = useRef(false);
  const velocityRef = useRef(0);
  const segRef = useRef<HTMLSpanElement>(null);
  // Enough copies to fill the band's width plus one spare segment, so
  // wide screens never see the end of the strip. Recomputed on resize.
  const [copies, setCopies] = useState(3);

  useEffect(() => {
    const host = hostRef.current;
    const seg = segRef.current;
    if (!host || !seg) return;
    const measure = () => {
      const segW = seg.offsetWidth;
      if (segW <= 0) return;
      const needed = Math.ceil(host.offsetWidth / segW) + 1;
      setCopies((c) => (c === Math.max(2, needed) ? c : Math.max(2, needed)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    ro.observe(seg);
    return () => ro.disconnect();
  }, []);

  // Drift + inertia loop.
  useEffect(() => {
    let raf = 0;
    let lastT = performance.now();
    const tick = (t: number) => {
      const dt = Math.max(0, Math.min(0.1, (t - lastT) / 1000));
      lastT = t;
      const inner = innerRef.current;
      const seg = segRef.current;
      if (inner && seg) {
        // Wrap by exactly one segment's width. There are always enough
        // copies to cover the band plus one segment (see `copies`), so
        // the strip never shows blank space at any offset in [-seg, 0].
        const halfStack = seg.offsetWidth;
        if (halfStack > 0) {
          if (!interactingRef.current) {
            if (Math.abs(velocityRef.current) > 8) {
              offsetRef.current += velocityRef.current * dt;
              velocityRef.current *= Math.exp(-2.6 * dt);
              if (Math.abs(velocityRef.current) <= 8) velocityRef.current = 0;
            } else if (!hoveredRef.current) {
              offsetRef.current -= SPEED_PX_PER_SEC * dt;
            }
          }
          // Wrap so the doubled segment loops seamlessly in both directions.
          if (offsetRef.current <= -halfStack) offsetRef.current += halfStack;
          else if (offsetRef.current > 0) offsetRef.current -= halfStack;
          inner.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Wheel scrub (horizontal intent only) + touch scrub with inertia.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!horizontal) return;
      e.preventDefault();
      offsetRef.current -= e.shiftKey && e.deltaX === 0 ? e.deltaY : e.deltaX;
      velocityRef.current = 0;
    };

    let lastX = 0;
    let lastT = 0;
    let totalAbsDx = 0;
    let active = false;
    const DRAG_GAIN = 1.4;
    const TAP_VS_DRAG_PX = 8;
    const start = (e: TouchEvent) => {
      lastX = e.touches[0]?.clientX ?? 0;
      lastT = performance.now();
      totalAbsDx = 0;
      active = true;
      interactingRef.current = true;
      velocityRef.current = 0;
    };
    const move = (e: TouchEvent) => {
      if (!active) return;
      const x = e.touches[0]?.clientX ?? 0;
      const now = performance.now();
      const rawDx = x - lastX;
      totalAbsDx += Math.abs(rawDx);
      if (totalAbsDx > TAP_VS_DRAG_PX) {
        e.preventDefault();
        const dx = rawDx * DRAG_GAIN;
        const dt = Math.max(1, now - lastT) / 1000;
        velocityRef.current = velocityRef.current * 0.4 + (dx / dt) * 0.6;
        offsetRef.current += dx;
      }
      lastX = x;
      lastT = now;
    };
    const end = () => {
      active = false;
      interactingRef.current = false;
      if (totalAbsDx <= TAP_VS_DRAG_PX) velocityRef.current = 0;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        // Vertical swipes still scroll the page; horizontal ones scrub.
        touchAction: "pan-y",
      }}
    >
      <div
        ref={innerRef}
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          width: "max-content",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8125rem", // 13px
          fontWeight: 400,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "inherit",
          willChange: "transform",
        }}
      >
        {Array.from({ length: copies }, (_, i) => (
          <span key={i} ref={i === 0 ? segRef : undefined} style={{ display: "inline-flex", flex: "0 0 auto" }}>
            {renderMarqueeSegment(tags, i)}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Scroll-in entrance for Approach page elements, using the homepage's two
 * patterns so the page animates like the rest of the site:
 *  - kind="rise" (default): RiseOn — opacity 0 → 1 + 20px rise. Used for
 *    labels, section heads, the hero lede, the toolbox, contact copy.
 *  - kind="fade": Select Engagements — opacity only. Used for cards, with
 *    an index-based delay so each group cascades in one after another.
 * Keeps the element's own tag and className, so layout CSS is unchanged.
 * Plays once per element (viewport once, -8% margin like RiseOn).
 */
type RevealTag = "div" | "li" | "article" | "span" | "p";
const MOTION_TAGS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  span: motion.span,
  p: motion.p,
};
/* Entry batching. Card delays are written for a whole group entering
   together (0.15 + i * STAGGER.item). When a later card scrolls in on its
   own it shouldn't sit through the stagger of siblings that are already
   visible, so delays are re-based on the smallest delay among elements
   that enter within the same ~120ms window: the first one in starts at
   up to 0.15s, the rest keep their relative cascade. */
let batchAt = -Infinity;
let batchBase = 0;
function batchDelay(delay: number) {
  const now = performance.now();
  if (now - batchAt > 120) {
    batchAt = now;
    batchBase = delay;
  } else {
    batchBase = Math.min(batchBase, delay);
  }
  return Math.min(delay, 0.15 + Math.max(0, delay - batchBase));
}

export function Reveal({
  as = "div",
  kind = "rise",
  delay = 0,
  className,
  cursorColor,
  children,
}: {
  as?: RevealTag;
  kind?: "rise" | "fade";
  delay?: number;
  className?: string;
  /** Passed through as data-cursor-color (MagneticCursor token). */
  cursorColor?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const M = MOTION_TAGS[as] as typeof motion.div;
  const ref = useRef<HTMLElement>(null);
  const controls = useAnimationControls();
  // Fires on the first pixel entering the viewport (amount "some", no
  // inset). The +24px bottom margin offsets the pre-entrance y shift, so
  // it triggers when the element's resting top edge reaches the fold.
  const inView = useInView(ref, { once: true, amount: "some", margin: "0px 0px 24px 0px" });
  const mobileRef = useRef(false);
  const rise = kind === "rise" && !reduce;

  // Phones: every element (cards included) fades in AND rises, over a
  // longer, softer ease — opacity-only steps read as blunt pop-ins when
  // the cards are stacked one per row. Desktop keeps the Select
  // Engagements opacity fade for card groups. Set after mount (the
  // element is still at opacity 0) so SSR markup stays identical.
  useEffect(() => {
    if (reduce) return;
    mobileRef.current = window.matchMedia("(max-width: 767px)").matches;
    if (mobileRef.current) controls.set({ y: 24 });
  }, [controls, reduce]);

  useEffect(() => {
    if (!inView) return;
    controls.start({
      opacity: 1,
      y: 0,
      transition: {
        delay: batchDelay(delay),
        duration: mobileRef.current ? DUR.slow : DUR.base,
        ease: EASE,
      },
    });
  }, [inView, controls, delay]);

  return (
    <M
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      data-cursor-color={cursorColor}
      initial={rise ? { opacity: 0, y: 20 } : { opacity: 0 }}
      animate={controls}
    >
      {children}
    </M>
  );
}
