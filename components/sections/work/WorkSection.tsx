"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RiseOn from "@/components/primitives/RiseOn";
import {
  HIRED,
  INSPIRED,
  ALL_PROJECTS,
  WORK_SLUGS,
  INSPIRED_SLUGS,
  type Project,
  type ProjectItem,
  type ReelItem,
} from "@/content/projects";

// Re-export the slug lists so page.tsx can continue to import them
// directly from this module (existing call sites unaffected).
export { WORK_SLUGS, INSPIRED_SLUGS };
/* ─── Right-column "EXPLORE" block ─────────────────────────────────────── */

// Styled to mirror the Hello panel's [ SCROLL ] prompt: the [ EXPLORE ]
// tooltip itself is Geist Mono 11 (via .text-sm) at opacity 0.55, and the
// whole cluster runs the same gentle vertical bounce loop. Body copy
// underneath uses the regular --fs-body (14 px Geist Normal).
function ExploreBlock() {
  return (
    <motion.div
      // Separate opacity (one-shot fade-in) from y (continuous bounce
      // loop). Starting opacity at 1 in the animate target means the
      // tooltip lands at full intensity; the y keyframes start moving
      // immediately, so the bounce reads from the first frame.
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: [0, -5, 0] }}
      transition={{
        opacity: { delay: 0.35, duration: DUR.base, ease: EASE },
        y: {
          delay: 0.35,
          duration: 2.4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        },
      }}
      style={{
        color: "var(--fg)",
        // Narrow column so the first sentence wraps after "at" — "the
        // work," lands on a new line — without needing word-specific <br>s.
        maxWidth: "12rem",
      }}
    >
      <span
        className="text-sm"
        style={{
          display: "block",
          marginBottom: "0.5rem",
          transition: "color 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        [ Explore ]
      </span>
      <p className="text-body" style={{ marginBottom: "0.875rem" }}>
        Click any row to peek at the work, or scroll to step through each
        project in sequence.
      </p>
      <p className="text-body">
        Click <strong style={{ fontWeight: 600 }}>View Work</strong> on a
        project to open its case study.
      </p>
    </motion.div>
  );
}
import { DUR, EASE, STAGGER } from "@/lib/motion";

/* ─── Copy ──────────────────────────────────────────────────────────────── */

// Right-column [Intro] fallback copy lives in app/page.tsx's persistent
// overlay so it carries from Name → Work without re-rendering. This
// section owns project-specific items (shown when a row is expanded) and
// the case-study tray (slides in from the right when VIEW WORK or the
// project copy is clicked).

// Project / case-study data lives under `content/projects/` — one file
// per project, plus `content/projects/types.ts` for shared shapes.
// HIRED, INSPIRED, ALL_PROJECTS, WORK_SLUGS, INSPIRED_SLUGS are imported
// from `@/content/projects` at the top of this file.

/* ─── Layout constants ──────────────────────────────────────────────────── */

const NAV_H  = "var(--nav-h)";
const FOOT_H = "var(--footer-h)";
// One unit of accordion-row vertical rhythm — must match ROW_HEIGHT below.
// Kept as a number (px) too so the right column can derive its offset
// arithmetically from the open project's index in WORK_SLUGS.
const ROW_HEIGHT_PX = 52;
// Vertical anchor for both columns. The closed accordion (SW header +
// 7 list items = 416 px ≈ 26 rem; half ≈ 13 rem) centres around
// 50% of the viewport. `max()` clamps the top so the accordion never
// rides above NAV_H + 2vh on very short viewports.
const WORK_CONTENT_TOP = "max(calc(var(--nav-h) + 2vh), calc(50% - 13rem))";
// Fixed height for the Select Work h2 so it occupies exactly one
// accordion-row rhythm — keeps the right column's per-project offset
// computation purely a function of row count.
const SELECT_WORK_HEADER_PX = ROW_HEIGHT_PX;
// Per-slug preview-top offset, measured from the top of the ProjectList
// (the rule above the HIRED group label). Equals (rows + group labels)
// stacked above the open row's preview area * ROW_HEIGHT.
//   HIRED idx i    → HIRED label + (i+1) tabs = (i + 2) rows
//   INSPIRED idx j → HIRED label + 3 HIRED tabs + INSPIRED label + (j+1) tabs
//                  = (j + 5) rows = (absIdx + 3) rows
function previewOffsetInListPx(slug: string): number {
  const idx = WORK_SLUGS.indexOf(slug);
  if (idx < 0) return 0;
  return idx < HIRED.length
    ? (idx + 2) * ROW_HEIGHT_PX
    : (idx + 3) * ROW_HEIGHT_PX;
}
const COL_WORK_LEFT  = "3 / 18";  // cols 3–17 — Select Work + project rows + expanded preview
// Both EXPLORE and project items live in the same column now, aligned
// with [INTRO] on the Name screen and the "W" of WORK in the top nav —
// the user's single body-copy column across the whole site.
// Project items sit at cols 21-28 (the universal body-copy column). The
// [PROJECT] eyebrow is absolutely positioned to hang off the left of
// each block — it lives outside the column, tucked just to the left
// of the description's first line, so it reads as a margin label
// rather than its own column. EXPLORE uses the same column.
const COL_RIGHT_ITEMS   = "21 / 29";
const COL_RIGHT_EXPLORE = "21 / 29";

// Case-study tray layout — rail extends to the 10th column per the latest
// reference, with the reel filling cols 11-32 flush to the right edge.
// 1 col of left negative space (col 1 as gutter) matches the 3vh top/
// bottom padding, giving the rail content a roughly uniform inset on three
// sides. No gap between rail and reel — the reel sits flush against the
// rail so there's no black padding on either side of the media.
const COL_CASE_RAIL = "2 / 11";   // outer cols 2-10 (9 cols)
const COL_CASE_REEL = "11 / 33";  // outer cols 11-32 (22 cols, flush right)

/* ─── Section ───────────────────────────────────────────────────────────── */

type WorkSectionProps = {
  /** Controlled: which row is currently expanded. `null` = closed. Driven
   *  from page.tsx so wheel events at the page level can step through
   *  projects in sequence. Click-to-toggle inside the section also updates
   *  this via onOpenSlugChange. */
  openSlug?: string | null;
  /** Called when an internal click-to-toggle would change the open slug.
   *  Page.tsx applies it to the controlled state. */
  onOpenSlugChange?: (slug: string | null) => void;
  /** Reports whether the case-study tray is open — page.tsx uses this to
   *  freeze auto-advance scroll/click handlers while the tray covers Work. */
  onCaseStudyOpenChange?: (open: boolean) => void;
  /** Reports the slug of the open case-study tray (or null). Page.tsx
   *  feeds this into its workAccent derivation so the mint scheme is
   *  applied while an INSPIRED case study is on screen — even if the
   *  accordion row beneath has been closed in the meantime. */
  onCaseStudySlugChange?: (slug: string | null) => void;
};

export default function WorkSection({
  openSlug = null,
  onOpenSlugChange,
  onCaseStudyOpenChange,
  onCaseStudySlugChange,
}: WorkSectionProps = {}) {
  // Case-study tray slug. Set by VIEW WORK click only. Stores the OPEN
  // item's `number` (e.g., "01") rather than a project slug — Bloomberg
  // and Liquid Agency each have multiple items with their own case
  // studies, so we identify the tray by item, not project. Item numbers
  // are unique across the whole site (01-07).
  const [caseStudySlug, setCaseStudySlug] = useState<string | null>(null);

  const openCaseStudy = (itemNumber: string) => {
    setCaseStudySlug(itemNumber);
  };
  const closeCaseStudy = () => setCaseStudySlug(null);
  /** Click toggle. If the clicked row is already open, close it. If a
   *  different row is open (or none), open this one. Per the latest
   *  direction, clicks on a row no longer open the case study — only
   *  VIEW WORK does. */
  const toggle = (slug: string) =>
    onOpenSlugChange?.(openSlug === slug ? null : slug);
  useEffect(() => {
    onCaseStudyOpenChange?.(caseStudySlug !== null);
  }, [caseStudySlug, onCaseStudyOpenChange]);

  // Sticky-row positioning is handled by a CSS transform on the left
  // column (see `accordionShiftPx` below) rather than internal scroll.
  // The Work section's overflow is locked to hidden so wheel events
  // always route through the page-level handler.

  // Report case-study PROJECT slug changes upward so page.tsx can
  // include it in its workAccent derivation. The internal caseStudySlug
  // stores an item.number ("01"…"07"), so map it back to the owning
  // project's slug for accent purposes (INSPIRED_SLUGS check in
  // page.tsx is by project slug).
  useEffect(() => {
    const projectSlug = caseStudySlug
      ? (ALL_PROJECTS.find((p) =>
          p.items.some((it) => it.number === caseStudySlug)
        )?.slug ?? null)
      : null;
    onCaseStudySlugChange?.(projectSlug);
  }, [caseStudySlug, onCaseStudySlugChange]);

  // Escape closes the case-study tray. Tab/project arrow-key cycling
  // happens inside CaseStudyPanel itself (same logic as the wheel
  // handler there).
  useEffect(() => {
    if (!caseStudySlug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setCaseStudySlug(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [caseStudySlug]);

  const openProject = ALL_PROJECTS.find((p) => p.slug === openSlug) ?? null;
  const caseStudyMatch = caseStudySlug
    ? (() => {
        for (const p of ALL_PROJECTS) {
          const item = p.items.find((it) => it.number === caseStudySlug);
          if (item) return { project: p, item };
        }
        return null;
      })()
    : null;
  const caseStudyProject = caseStudyMatch?.project ?? null;
  const caseStudyItem = caseStudyMatch?.item ?? null;

  // While the case-study tray is open, the regular Work columns translate
  // off to the left as the tray slides in from the right (spec §3 — card
  // swap horizontal). Both share the same EASE for a single coordinated
  // motion.
  const slideTransition = { duration: 0.55, ease: EASE };

  // Sticky-row lock: the left column's accordion translates upward by
  // exactly the open row's offset from the top of the list, so the open
  // row always lands at the Select Work header's Y. Closed = 0.
  const accordionShiftPx = openSlug
    ? -previewOffsetInListPx(openSlug)
    : 0;

  const caseStudyOpen = caseStudyProject !== null;

  return (
    <section
      id="work"
      className="snap"
      style={{
        backgroundColor: "var(--bg)",
        position: "relative",
        // Both axes locked to hidden — the accordion no longer scrolls
        // internally. Each project step shifts the left column up via a
        // CSS transform so the open row always lands at the Select Work
        // Y. The case-study tray (absolute inset:0, z 40) slides over
        // the whole section.
        overflow: "hidden",
      }}
    >
      {/* Work content (right column + accordion). Translates left when
          the case-study tray opens; slides back from the left when it
          closes. The translation is purely visual — pointer events are
          still gated by the absolute layering. */}
      <motion.div
        animate={{ x: caseStudyOpen ? "-100%" : 0 }}
        transition={slideTransition}
        style={{ position: "absolute", inset: 0 }}
      >
      {/* ── Right column — project items ──────────────────────────────────
          Top-anchored. Animates in top-to-bottom in spec order: 01 →
          [ PROJECT ] → description → VIEW WORK. z-index 35 keeps items
          above the persistent intro overlay during its fade-out.

          Wrapper has pointer-events:none so empty grid space doesn't
          intercept clicks meant for the left-column accordion underneath;
          the inner content block re-enables pointer events. */}
      <motion.div
        className="content-grid"
        animate={{ opacity: 1 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: WORK_CONTENT_TOP,
          alignItems: "start",
          zIndex: 35,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {openProject ? (
            <motion.div
              key={`items-${openProject.slug}`}
              style={{
                gridColumn: COL_RIGHT_ITEMS,
                pointerEvents: "auto",
                // Drop the items column down so the [ Project ] eyebrow
                // shares a baseline with the discipline-tag marquee in
                // the open row's header (both are 13 px mono; row text
                // is vertically centred in a 52 px row, so ~1 rem down
                // brings the eyebrow onto that baseline).
                marginTop: "1rem",
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={itemListVariants}
            >
              {openProject.items.map((it, i) => (
                <ProjectItemBlock
                  key={it.number}
                  item={it}
                  last={i === openProject.items.length - 1}
                  onOpenCaseStudy={() => openCaseStudy(it.number)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="explore-fallback"
              style={{
                gridColumn: COL_RIGHT_EXPLORE,
                pointerEvents: "auto",
                // When no project is open, EXPLORE sits one row below the
                // top (level with the HIRED group label), so it doesn't
                // float above Select Work's baseline.
                marginTop: `${SELECT_WORK_HEADER_PX}px`,
              }}
            >
              <ExploreBlock />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Left column — Select Work + accordion ──────────────────────────
          Top-anchored: Select Work sits just below the nav and the
          accordion stacks downward from there. If the list extends below
          the fold (e.g., when an INSPIRED row's preview opens deep in the
          stack), it overflows the section rather than crushing upward.

          Same pointer-events trick as the right column — the wrapper
          spans the full viewport so empty grid columns mustn't intercept
          clicks. The inner content block (where the accordion lives)
          re-enables them. */}
      <motion.div
        className="content-grid"
        animate={{ opacity: 1 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: WORK_CONTENT_TOP,
          alignItems: "start",
          pointerEvents: "none",
        }}
      >
        <motion.div
          data-work-accordion
          // Sticky-row lock: shift the whole accordion upward by exactly
          // the open row's offset from the Select Work header. When
          // openSlug is null the shift is 0 and SW sits at Y1; once a
          // project opens, that row takes SW's seat. Lower projects use
          // larger shifts so they always land at the same Y, with the
          // preview tray opening in view below.
          animate={{ y: accordionShiftPx }}
          transition={slideTransition}
          style={{ gridColumn: COL_WORK_LEFT, pointerEvents: "auto" }}
        >
          <RiseOn delay={0.15}>
            <h2
              data-select-work-header
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.875rem", // 30px — Geist Bold 30
                fontWeight: 700,
                color: "var(--fg)",
                // Fixed height matching ROW_HEIGHT so the project list's
                // first rule sits exactly one row below the header top —
                // makes the right column's preview-aligned offset purely a
                // function of row count (see previewOffsetInListPx).
                height: `${SELECT_WORK_HEADER_PX}px`,
                display: "flex",
                alignItems: "center",
                marginBottom: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Select Work
            </h2>

            <ProjectList
              hired={HIRED}
              inspired={INSPIRED}
              openSlug={openSlug}
              onToggle={toggle}
              onOpenCaseStudy={openCaseStudy}
            />
          </RiseOn>
        </motion.div>
      </motion.div>

      </motion.div>

      {/* ── Case-study tray ─────────────────────────────────────────────
          Two-layer transition:
            • Outer (mount/unmount): slide in from the right on first
              open, slide back to the right on close. Pairs with the
              Work content's leftward translate so the screen reads as
              a horizontal page turn.
            • Inner (slug-keyed): seamless crossfade between project
              cards when the user navigates between case studies via
              arrow keys / wheel — no horizontal motion in this case. */}
      <AnimatePresence>
        {caseStudyProject && caseStudyItem && (
          <motion.div
            key="tray"
            // Synchronous "is the tray live?" marker. The page-level
            // wheel handler checks for this attribute (via
            // querySelector) before firing advance/retreat, so wheel
            // events during the tray's entry / exit animations can't
            // race ahead of React state propagation and push the user
            // off to Contact.
            data-case-study-tray
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={slideTransition}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "var(--bg)",
              zIndex: 40,
              overflow: "hidden",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={caseStudyItem.number}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                style={{ position: "absolute", inset: 0 }}
              >
                <CaseStudyPanel
                  project={caseStudyProject}
                  item={caseStudyItem}
                  onClose={closeCaseStudy}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ─── Project list ──────────────────────────────────────────────────────── */

/**
 * Combined list — HIRED group + INSPIRED group share one continuous rule
 * rhythm so every rule sits at an equal vertical step regardless of group
 * boundaries. Each "slot" (group label or project row) has the same fixed
 * height and ends in a 1px rule.
 */
function ProjectList({
  hired,
  inspired,
  openSlug,
  onToggle,
  onOpenCaseStudy,
}: {
  hired: Project[];
  inspired: Project[];
  openSlug: string | null;
  onToggle: (slug: string) => void;
  onOpenCaseStudy: (slug: string) => void;
}) {
  return (
    <div style={{ borderTop: "1px solid var(--fg)" }}>
      <GroupLabel label="Hired" />
      {hired.map((p, i) => (
        <ProjectRow
          key={p.slug}
          project={p}
          delay={0.25 + i * STAGGER.item}
          open={openSlug === p.slug}
          onToggle={() => onToggle(p.slug)}
          // Preview-reel click opens the case study of the item whose
          // asset is currently visible in the cross-fade (so clicking
          // Bloomberg's UX/UI screenshot opens item 02, not the default
          // item 01). ProjectRow tracks the active entry internally.
          onOpenCaseStudy={onOpenCaseStudy}
        />
      ))}
      <GroupLabel label="Inspired" />
      {inspired.map((p, i) => (
        <ProjectRow
          key={p.slug}
          project={p}
          delay={0.45 + i * STAGGER.item}
          open={openSlug === p.slug}
          onToggle={() => onToggle(p.slug)}
          onOpenCaseStudy={onOpenCaseStudy}
        />
      ))}
    </div>
  );
}

/** Compute marquee loop duration so every project's disciplines tag
 *  scrolls at the same on-screen speed (≈ 28 px/sec) regardless of how
 *  many tags it carries. Bloomberg's long list cycles slower (covers
 *  more ground per loop); Paintings' short list cycles faster, both
 *  passing glyphs by the viewport at the same constant rate. */
function marqueeDurationSec(segment: string): number {
  const TARGET_PX_PER_SEC = 56;
  const APPROX_PX_PER_CHAR = 7.5; // Geist Mono 13 px, eyeballed
  const cycleDistancePx = segment.length * APPROX_PX_PER_CHAR;
  return Math.max(6, cycleDistancePx / TARGET_PX_PER_SEC);
}

/**
 * Infinitely scrolling marquee for the per-project discipline tags
 * (Geist Mono 13 uppercase). The animation is driven by framer-motion's
 * x-keyframe loop (not a CSS @keyframes rule, which previously failed
 * to render on production builds), translating the inner track from
 * 0 → -50% so the second copy of the text lands where the first one
 * started — perfectly seamless. Each project's text is rendered as a
 * comma-suffixed segment so the wrap reads as one continuous string
 * ("Branding, Motion, Branding, Motion, …") with no empty gap between
 * iterations. The parent grid cell sets a fixed viewport width so the
 * marquee occupies the same column block across every row. */
// Each separator is rendered as a span around a black star glyph,
// shifted slightly up so it shares an optical baseline with the
// uppercase tag text (the bare glyph sits low relative to cap-height).
function StarSep() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        // Equal breathing room on either side of the glyph; the
        // leading copy in each rendered segment gives the first tag
        // the same gap-before-text as every other tag.
        margin: "0 0.55em",
        // Optical centring: the ★ hangs low relative to the cap
        // height of the uppercase tags; lift it ~12% of em.
        transform: "translateY(-0.12em)",
      }}
    >
      ★
    </span>
  );
}

function renderMarqueeSegment(tags: string[], copyIdx: number) {
  const out: ReactNode[] = [
    <StarSep key={`${copyIdx}-lead`} />,
  ];
  tags.forEach((tag, i) => {
    out.push(<span key={`${copyIdx}-tag-${i}`}>{tag}</span>);
    out.push(<StarSep key={`${copyIdx}-sep-${i}`} />);
  });
  // Drop the trailing separator so the seam between two copies has
  // exactly one star (matching every other in-segment gap).
  out.pop();
  return out;
}

function DisciplineMarquee({ text }: { text: string }) {
  const tags = text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // Constant on-screen drift speed (px/s) — matches the previous
  // framer-motion timing target.
  const baseSpeedPxPerSec = 56;

  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const interactingRef = useRef(false);
  const velocityRef = useRef(0);

  // raf-driven auto-drift + flick inertia. Mirror of the mobile
  // marquee — pause auto-drift while a pointer is dragging, decay
  // residual velocity exponentially on release.
  useEffect(() => {
    let raf = 0;
    let lastT = performance.now();
    const tick = (t: number) => {
      const dt = Math.max(0, Math.min(0.1, (t - lastT) / 1000));
      lastT = t;
      const inner = innerRef.current;
      if (inner) {
        const halfStack = inner.scrollWidth / 2;
        if (halfStack > 0) {
          if (!interactingRef.current) {
            if (Math.abs(velocityRef.current) > 8) {
              offsetRef.current += velocityRef.current * dt;
              velocityRef.current *= Math.exp(-2.6 * dt);
              if (Math.abs(velocityRef.current) <= 8) {
                velocityRef.current = 0;
              }
            } else {
              offsetRef.current -= baseSpeedPxPerSec * dt;
            }
          }
          if (offsetRef.current <= -halfStack) {
            offsetRef.current += halfStack;
          } else if (offsetRef.current > 0) {
            offsetRef.current -= halfStack;
          }
          inner.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [baseSpeedPxPerSec]);

  // Pointer scrub. Pointer events unify mouse + touch + pen. Drag-vs-
  // tap detection at 8 px so a stationary click on the marquee still
  // falls through to the row's onClick (open / close the accordion).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastX = 0;
    let lastT = 0;
    let totalAbsDx = 0;
    let active = false;
    let activeId = -1;
    const DRAG_GAIN = 1.4;
    const TAP_VS_DRAG_PX = 8;
    const start = (e: PointerEvent) => {
      if (e.button !== 0) return;
      lastX = e.clientX;
      lastT = performance.now();
      totalAbsDx = 0;
      active = true;
      activeId = e.pointerId;
      interactingRef.current = true;
      velocityRef.current = 0;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // Some browsers refuse capture on non-touch pointers — fine,
        // we still get move/up via the global listeners.
      }
    };
    const move = (e: PointerEvent) => {
      if (!active || e.pointerId !== activeId) return;
      const x = e.clientX;
      const now = performance.now();
      const rawDx = x - lastX;
      totalAbsDx += Math.abs(rawDx);
      if (totalAbsDx > TAP_VS_DRAG_PX) {
        const dx = rawDx * DRAG_GAIN;
        const dt = Math.max(1, now - lastT) / 1000;
        const instVel = dx / dt;
        velocityRef.current =
          velocityRef.current * 0.4 + instVel * 0.6;
        offsetRef.current += dx;
      }
      lastX = x;
      lastT = now;
    };
    const end = (e: PointerEvent) => {
      if (!active || e.pointerId !== activeId) return;
      active = false;
      interactingRef.current = false;
      const wasDrag = totalAbsDx > TAP_VS_DRAG_PX;
      if (!wasDrag) {
        velocityRef.current = 0;
      } else {
        // Swallow the synthetic click that fires after pointerup so
        // the row's onClick doesn't toggle the accordion at the end
        // of a drag. Capture-phase listener lasts one event.
        const swallow = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
          window.removeEventListener("click", swallow, true);
        };
        window.addEventListener("click", swallow, true);
        window.setTimeout(
          () => window.removeEventListener("click", swallow, true),
          80,
        );
      }
      try {
        el.releasePointerCapture(activeId);
      } catch {
        /* noop */
      }
      activeId = -1;
    };
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    return () => {
      el.removeEventListener("pointerdown", start);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
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
        <span>{renderMarqueeSegment(tags, 0)}</span>
        <span>{renderMarqueeSegment(tags, 1)}</span>
      </div>
    </div>
  );
}

function GroupLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "relative",
        height: ROW_HEIGHT,
        display: "flex",
        alignItems: "center",
        // Same 1rem inset as the project row headers in their open
        // state, so HIRED / INSPIRED align with the project name
        // column rather than sitting flush left.
        paddingLeft: "1rem",
        paddingRight: "1rem",
        borderBottom: "1px solid var(--fg)",
      }}
    >
      {/* Dot-matrix lives on its OWN absolute layer with mix-blend
          multiply so the text in front isn't multiplied with it. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(var(--ink) 0.4px, transparent 0.65px)",
          backgroundSize: "2.25px 2.25px",
          mixBlendMode: "multiply",
        }}
      />
      <span
        className="text-label"
        style={{
          position: "relative",
          // Match the rest of the accordion text — project names use
          // var(--fg).
          color: "var(--fg)",
          opacity: 0.95,
          fontWeight: 700,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Row ───────────────────────────────────────────────────────────────── */

const ROW_HEIGHT = "3.25rem"; // ~52px — single rhythm unit for the list

function ProjectRow({
  project,
  delay,
  open,
  onToggle,
  onOpenCaseStudy,
}: {
  project: Project;
  delay: number;
  open: boolean;
  /** Header click toggles the accordion open/closed. */
  onToggle: () => void;
  /** Click on the expanded preview (reel) opens the case study for the
   *  item whose asset is currently visible in the preview cross-fade. */
  onOpenCaseStudy: (itemNumber: string) => void;
}) {
  // Build the interleaved preview reel + track which entry is active so
  // a click on the preview opens the matching item's case study.
  const previewEntries = useMemo(
    () => interleaveReels(project.items),
    [project.items]
  );
  const [activePreviewEntry, setActivePreviewEntry] =
    useState<PreviewReelEntry | null>(null);
  const activeItemNumber =
    activePreviewEntry?.itemNumber ?? project.items[0]?.number;
  const handlePreviewClick = () => {
    if (activeItemNumber) onOpenCaseStudy(activeItemNumber);
  };

  // Preview reel uses cover by default; projects whose assets read as
  // intentional compositions (flyer / painting) use contain so they
  // letterbox rather than crop. Mirrors the case-study reelFit setting
  // on the first item.
  const previewFit: "cover" | "contain" =
    project.items[0]?.caseStudy.reelFit ?? "cover";
  const previewBg = project.items[0]?.caseStudy.reelBg ?? "var(--ink)";

  return (
    <motion.div
      data-no-advance
      data-project-row={project.slug}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: DUR.base, ease: EASE }}
      style={{
        borderBottom: "1px solid var(--fg)",
        cursor: "default",
      }}
    >
      {/* Header row — clickable tab. Click toggles open/close. */}
      <div
        role="button"
        tabIndex={0}
        data-cursor="view"
        data-magnetic
        data-no-advance
        aria-expanded={open}
        aria-label={`${open ? "Close" : "Open"} ${project.name}`}
        data-cursor-color={open ? "bg" : undefined}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        style={{
          // Grid keeps the discipline marquee anchored to the same
          // columns across every row regardless of project-name length.
          // Left track = name, right track = fixed-width marquee viewport.
          display: "grid",
          gridTemplateColumns: "1fr 18rem",
          alignItems: "center",
          gap: "1rem",
          width: "100%",
          height: ROW_HEIGHT,
          // Always inset 1rem so the row content holds its position
          // when the drawer opens/closes (was shifting left → right
          // on open). Matches the GroupLabel and the open-drawer
          // content's left edge.
          padding: "0 1rem",
          background: open ? "var(--fg)" : "none",
          color: open ? "var(--bg)" : "var(--fg)",
          textAlign: "left",
          cursor: "inherit",
          transition:
            "background-color 0.35s cubic-bezier(0.22, 1, 0.36, 1), color 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.1875rem", // 19px
            fontWeight: 700,
            letterSpacing: "0.01em",
            color: "inherit",
          }}
        >
          {project.name}
        </span>
        <DisciplineMarquee text={project.disciplines} />
      </div>

      {/* Preview area — when the accordion is open, plays the project's
          reel (first item) inline. Clicking the preview opens the full
          case study. When no reel is supplied, falls back to the
          previous dotted-grid placeholder so unfinished projects still
          have something legible. 16:9 aspect so YouTube videos sit flush
          edge-to-edge with no letterboxing. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="preview"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div
              role="button"
              tabIndex={0}
              data-cursor="view"
              // Preview area carries a per-project background colour —
              // without this hint the cursor renders in --fg (ink in
              // hired/inspired schemes) and disappears against the
              // panel. Force the bg token so the cursor lens stays
              // visible (sky over ink in hired, mint over ink in
              // inspired, ink over coral in Contact, etc.).
              data-cursor-color="bg"
              data-magnetic
              data-no-advance
              aria-label={`Open ${project.name} case study`}
              onClick={(e) => {
                e.stopPropagation();
                handlePreviewClick();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePreviewClick();
                }
              }}
              style={{
                position: "relative",
                aspectRatio: "16 / 9",
                width: "100%",
                backgroundColor: previewBg,
                overflow: "hidden",
                cursor: "inherit",
              }}
            >
              {previewEntries.length === 0 ? (
                <>
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage:
                        "radial-gradient(color-mix(in srgb, var(--bg) 25%, transparent) 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                      opacity: 0.4,
                    }}
                  />
                  <span
                    className="text-label"
                    style={{
                      position: "absolute",
                      left: "1rem",
                      bottom: "1rem",
                      color: "var(--bg)",
                      opacity: 0.7,
                    }}
                  >
                    {project.previewLabel ?? project.name}
                  </span>
                </>
              ) : (
                <>
                  <AccordionPreviewReel
                    entries={previewEntries}
                    fit={previewFit}
                    onActiveChange={setActivePreviewEntry}
                  />
                  {/* Project-number overlay — bottom-left, follows
                      whichever item's asset is currently visible in the
                      cross-fade. Renders above the reel via z-index. */}
                  {activeItemNumber && (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: "1rem",
                        bottom: "1rem",
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        letterSpacing: "-0.01em",
                        // Per-project accent (sky on HIRED, mint on
                        // INSPIRED). var(--fg) is ink in the HIRED
                        // scheme (bg=sky / fg=ink), so it can't carry
                        // this — read straight from the project.
                        color: `var(--${project.accent})`,
                        zIndex: 2,
                        pointerEvents: "none",
                      }}
                    >
                      {activeItemNumber}
                    </span>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Accordion preview reel ────────────────────────────────────────────── */

/**
 * Build a flat reel that interleaves the assets from every item in the
 * project, in round-robin order (item 0's first asset, item 1's first
 * asset, item 0's second asset, item 1's second asset, …). For
 * single-item projects this is just that item's reel.
 */
type PreviewReelEntry = { itemNumber: string; asset: ReelItem };

function interleaveReels(items: ProjectItem[]): PreviewReelEntry[] {
  const reels = items.map((it) => ({
    number: it.number,
    reel: it.caseStudy.reel ?? [],
  }));
  const maxLen = reels.reduce((m, r) => Math.max(m, r.reel.length), 0);
  const result: PreviewReelEntry[] = [];
  for (let i = 0; i < maxLen; i++) {
    for (const r of reels) {
      if (r.reel[i]) result.push({ itemNumber: r.number, asset: r.reel[i] });
    }
  }
  return result;
}

/**
 * 16:9 accordion preview that cycles through a project's interleaved
 * reel via cross-fade. Per-asset dwell can be overridden by
 * asset.previewDwellMs (used e.g. so Revolutionary Change's intro
 * animation can fully resolve before the slide moves on). The reel
 * reports its active entry up via onActiveChange so the surrounding
 * row can (a) display the current project number, and (b) open the
 * matching item's case study when the user clicks.
 */
function AccordionPreviewReel({
  entries,
  fit,
  onActiveChange,
}: {
  entries: PreviewReelEntry[];
  fit: "cover" | "contain";
  onActiveChange?: (entry: PreviewReelEntry) => void;
}) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (entries.length <= 1) return;
    const dwell = entries[idx]?.asset.previewDwellMs ?? 3200;
    const t = window.setTimeout(() => {
      setIdx((i) => (i + 1) % entries.length);
    }, dwell);
    return () => window.clearTimeout(t);
  }, [idx, entries]);

  useEffect(() => {
    const entry = entries[idx];
    if (entry) onActiveChange?.(entry);
  }, [idx, entries, onActiveChange]);

  return (
    <>
      {entries.map((entry, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === idx ? 1 : 0,
            transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <ReelTileContent item={entry.asset} fit={fit} />
        </div>
      ))}
    </>
  );
}

/* ─── Right-column item block ───────────────────────────────────────────── */

// Sequential reveal: spec §3 ("text animates up and on, top-to-bottom,
// left-to-right"). Number first, eyebrow next, then description, then
// VIEW WORK button. Each child rises on with a stagger.
const itemListVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};
const itemPieceVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

function ProjectItemBlock({
  item,
  last,
  onOpenCaseStudy,
}: {
  item: ProjectItem;
  last: boolean;
  onOpenCaseStudy: () => void;
}) {
  return (
    <motion.div
      style={{
        position: "relative",
        marginBottom: last ? 0 : "3rem",
      }}
      variants={itemListVariants}
      initial="hidden"
      animate="visible"
    >
      {/* [ PROJECT ] eyebrow — absolutely positioned just left of the
          description's first line so the eyebrow reads on the same
          horizontal guideline as the disciplines marquee in the row
          header (and the description text it's labelling). */}
      <motion.span
        variants={itemPieceVariants}
        className="text-label"
        style={{
          position: "absolute",
          right: "100%",
          marginRight: "0.75rem",
          top: 0,
          // Match the description body's line-height so the eyebrow's
          // cap-line and the description's first-line cap-line park
          // on the same baseline.
          lineHeight: 1.5,
          whiteSpace: "nowrap",
          color: "var(--accent)",
        }}
      >
        [ Project ]
      </motion.span>

      {/* Project number — sits at the TOP, parallel with the
          [ Project ] eyebrow on its left margin. */}
      <motion.div
        variants={itemPieceVariants}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "var(--fg)",
          marginTop: 0,
          marginBottom: "0.75rem",
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
        }}
      >
        {item.number}
      </motion.div>

      {/* Description — clickable surface, below the number. */}
      <motion.p
        variants={itemPieceVariants}
        className="text-body"
        role="button"
        tabIndex={0}
        data-cursor="view"
        data-no-advance
        aria-label="Open case study"
        onClick={onOpenCaseStudy}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenCaseStudy();
          }
        }}
        style={{
          color: "var(--fg)",
          opacity: 0.9,
          marginTop: 0,
          marginBottom: "1rem",
          cursor: "inherit",
        }}
      >
        {item.description}
      </motion.p>

      {/* VIEW WORK button — body column, below number */}
      <motion.div
        variants={itemPieceVariants}
      >
        <motion.button
          type="button"
          data-cursor="view"
          data-no-advance
          onClick={onOpenCaseStudy}
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.8125rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--bg)",
            backgroundColor: "var(--fg)",
            padding: "0.3rem 0.55rem",
            border: "none",
            cursor: "inherit",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          View Work
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Case-study tray ───────────────────────────────────────────────────── */

const TAB_DEFS: Array<{ key: "brief" | "challenge" | "solution"; label: string }> = [
  { key: "brief", label: "BRIEF" },
  { key: "challenge", label: "CHALLENGE" },
  { key: "solution", label: "SOLUTION" },
];

function CaseStudyPanel({
  project,
  item,
  onClose,
  initialTabIdx = 0,
}: {
  project: Project;
  item: ProjectItem;
  initialTabIdx?: number;
  onClose: () => void;
}) {
  const cs = item.caseStudy;
  const [tabIdx, setTabIdx] = useState(initialTabIdx);
  const tab = TAB_DEFS[tabIdx];
  const accentVar = `var(--${project.accent})`;
  // Click-to-zoom lightbox for reel images (paintings / flyers / extra-
  // tall page screenshots). Null = closed.
  const [zoomedImage, setZoomedImage] = useState<{
    src: string;
    alt?: string;
  } | null>(null);
  // Wheel-gesture lock state lives in refs so it survives re-renders
  // and tab changes. Previously these were locals inside the wheel
  // useEffect — every cycle re-attached a fresh listener with a
  // zeroed-out lock, which let trackpad inertia rip through all three
  // tabs (and then close the tray) in a single gesture.
  const wheelLockedUntilRef = useRef(0);
  const wheelLockMaxRef = useRef(0);
  const wheelLockDirRef = useRef(0);
  const tabBody =
    tab.key === "brief"
      ? cs.brief
      : tab.key === "challenge"
        ? cs.challenge
        : cs.solution.join("\n\n");
  const showMeta = tab.key === "brief";

  // Wheel inside the case-study tray cycles tabs (BRIEF → CHALLENGE →
  // SOLUTION). Wheeling forward past SOLUTION (or back past BRIEF)
  // closes the tray and returns the user to the WORK screen — feels
  // less confusing than auto-advancing into the next project's case
  // study with no visible navigation. Reel-wheel events bail so they
  // scroll the reel itself instead.
  //
  // The lock is intentionally generous (1600ms initial, refresh-on-same-
  // direction inertia events, max 2400ms) so trackpad coast doesn't blow
  // past a tab. Each gesture = one tab step. Opposite-direction wheels
  // break the lock immediately so the user can reverse without waiting.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // Trackpad pinch fires wheel events with ctrlKey true. Bail so
      // the browser's native zoom takes over instead of us cycling
      // tabs / closing the tray.
      if (e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      // Wheel over the reel drives the reel's own vertical/horizontal
      // scroll (handled by the reel's React onWheel below). Bail here
      // so it doesn't also cycle tabs.
      if (target?.closest("[data-reel-scroll]")) return;
      // Every other wheel event in the tray cycles tabs — page is
      // locked from advancing/retreating while the tray's in the DOM.
      e.preventDefault();
      const now = performance.now();
      const dir = Math.sign(e.deltaY);
      if (now < wheelLockedUntilRef.current) {
        if (dir === wheelLockDirRef.current) {
          // Same-direction trackpad inertia: extend the lock but do
          // not advance another tab.
          if (Math.abs(e.deltaY) >= 2) {
            wheelLockedUntilRef.current = Math.min(
              wheelLockMaxRef.current,
              Math.max(wheelLockedUntilRef.current, now + 600),
            );
          }
          return;
        }
        // Opposite direction starts a new gesture immediately.
        if (Math.abs(e.deltaY) < 4) return;
      }
      if (Math.abs(e.deltaY) < 8) return;
      wheelLockedUntilRef.current = now + 900;
      wheelLockMaxRef.current = now + 1500;
      wheelLockDirRef.current = dir;
      if (e.deltaY > 0) {
        // Forward: BRIEF → CHALLENGE → SOLUTION → back to WORK.
        if (tabIdx < TAB_DEFS.length - 1) {
          setTabIdx(tabIdx + 1);
        } else {
          onClose();
        }
      } else {
        // Backward: SOLUTION → CHALLENGE → BRIEF → back to WORK.
        // Mirrors the forward path so a scroll-up on BRIEF closes the
        // tray instead of dead-ending.
        if (tabIdx > 0) {
          setTabIdx(tabIdx - 1);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [tabIdx, onClose]);

  // Arrow keys mirror the wheel: ↓/→ advance through BRIEF → CHALLENGE →
  // SOLUTION, and ↑/← walk back. Past either end closes the tray and
  // returns the user to the WORK screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
      const back = e.key === "ArrowUp" || e.key === "ArrowLeft";
      if (!forward && !back) return;
      e.preventDefault();
      if (forward) {
        if (tabIdx < TAB_DEFS.length - 1) {
          setTabIdx(tabIdx + 1);
        } else {
          onClose();
        }
      } else {
        if (tabIdx > 0) {
          setTabIdx(tabIdx - 1);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tabIdx, onClose]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "var(--ink)",
        color: accentVar,
      }}
    >
      <div
        className="content-grid"
        style={{
          position: "absolute",
          inset: 0,
          alignItems: "stretch",
        }}
      >
        {/* Left rail — centred in the left half of the viewport with equal
            negative space (cols 1-2 gutter on the left, cols 15-16 gap on
            the right before the reel starts). Inner content grid is 12 cols
            with 1-col padding on either side so the body paragraph (cols
            3-11 of the nested grid) is 9 outer cols wide — same width as
            the previous layout, just shifted into a balanced frame. */}
        <div
          data-case-study-info
          style={{
            gridColumn: COL_CASE_RAIL,
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            height: "100vh",
            // Padding lives on the rail itself (not the outer content-grid)
            // so the reel beside it can run full-bleed top-to-bottom.
            paddingTop: "3vh",
            paddingBottom: "3vh",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* Top row: NRJ icon + project number. Project number is Geist
              Bold 19 (per the latest direction — replaces the small mono
              label that previously sat here). Pulled left by 1.5rem so
              the NRJ disc aligns with the rule edges below. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginLeft: "-1.5rem",
            }}
          >
            <CaseStudyMark accentVar={accentVar} onClick={onClose} />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "1.1875rem",
                color: accentVar,
              }}
            >
              {item.number}
            </span>
          </div>

          {/* Project headline — Geist Bold 31, sky/mint accent. Capped
              at 22rem so titles like "Liquid Agency Flagship White
              Paper Design and Promotion" wrap after "Flagship" rather
              than running all the way out to the rail edge before the
              explicit \n forces a break. Same constraint applies to
              every case-study title for consistent rhythm. */}
          <h1
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "1.9375rem", // 31px Geist Bold
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: accentVar,
              margin: 0,
              marginLeft: "-1.5rem",
              maxWidth: "24rem",
              whiteSpace: "pre-line",
            }}
          >
            {cs.title}
          </h1>

          {/* Tabs row — three TabBoxes spread evenly across the rail.
              Pulled left by 1.5rem so BRIEF's number box aligns with
              the rule below it, while SOLUTION's right bracket stays
              flush with the rule's right edge. No explicit
              marginTop/marginBottom — the rail's 1.25rem flex gap
              handles the spacing above and below uniformly. */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginLeft: "-1.5rem",
            }}
          >
            {TAB_DEFS.map((t, i) => (
              <TabBox
                key={t.key}
                index={i + 1}
                label={t.label}
                active={tabIdx === i}
                accentVar={accentVar}
                onClick={() => setTabIdx(i)}
              />
            ))}
          </div>

          {/* Rule under tabs */}
          <Rule accentVar={accentVar} />

          {/* Body block + meta wrapped in AnimatePresence keyed by tab so
              the chip / body paragraphs / meta crossfade as the user
              cycles BRIEF ↔ CHALLENGE ↔ SOLUTION. mode="wait" keeps the
              transitions sequential (old fades out before new fades in)
              so the layout doesn't briefly double up. */}
          <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
          <div
            style={{
              // Pull the whole chip + body row left to align with the
              // case-study rules above and below (each rule extends
              // -1.5rem into the col-1 gutter). Result: chip's left
              // edge, rule's left edge, and CLIENT/SERVICES/CREDITS
              // value blocks all share a single vertical guideline.
              marginLeft: "-1.5rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "1.5rem",
            }}
          >
            <div
              data-cursor-color="ink"
              style={{
                writingMode: "vertical-rl",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                backgroundColor: accentVar,
                color: "var(--ink)",
                width: "1.5rem",
                flex: "0 0 auto",
                fontFamily: "var(--font-mono)",
                fontWeight: 400,
                fontSize: "0.6875rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                padding: "0.5rem 0",
              }}
            >
              {tab.label}
            </div>
            <div style={{ flex: 1 }}>
              {tabBody.split("\n\n").map((para, i, arr) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "var(--fs-body)",
                    lineHeight: 1.55,
                    color: accentVar,
                    marginBottom: i === arr.length - 1 ? 0 : "0.9rem",
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Meta blocks — only on the BRIEF slide. Each block is preceded
              by a rule, so the spacing flows from the parent flex column's
              uniform 1.5rem gap (rule sits at equal distance from the
              section above and below it). */}
          {showMeta && (
            <>
              {(cs.client || cs.clientLogo) && (
                <>
                  <Rule accentVar={accentVar} />
                  <MetaBlock label="CLIENT" accentVar={accentVar}>
                    {cs.clientLogo ? (
                      // Project-specific logo SVG. The wrapper spans
                      // the rule's full width (marginLeft: -1.5rem +
                      // no right margin) and centres the logo within
                      // that span — so the logo lands at the visual
                      // midpoint of the strokes above and below it,
                      // not biased toward the body-copy column. Equal
                      // top/bottom padding gives matching breathing
                      // room above and below the logo.
                      <div
                        style={{
                          marginLeft: "-1.5rem",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          paddingTop: "0.6rem",
                          paddingBottom: "0.6rem",
                        }}
                      >
                        <img
                          src={cs.clientLogo}
                          alt={cs.client ?? ""}
                          style={{
                            // Per-project box size:
                            //   bloomberg-lp  → 1.05× baseline
                            //   liquid-agency → 1.7× baseline
                            //   everyone else → 2.1× baseline
                            width:
                              project.slug === "bloomberg-lp"
                                ? "9.45rem"
                                : project.slug === "liquid-agency"
                                  ? "15.12rem"
                                  : "18.9rem",
                            height:
                              project.slug === "bloomberg-lp"
                                ? "2.625rem"
                                : project.slug === "liquid-agency"
                                  ? "4.2rem"
                                  : "5.25rem",
                            maxWidth: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </div>
                    ) : (
                      <IndentedToBodyCopy>
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 400,
                            fontSize: "var(--fs-body)",
                            lineHeight: 1.55,
                            color: accentVar,
                          }}
                        >
                          {cs.client}
                        </span>
                      </IndentedToBodyCopy>
                    )}
                  </MetaBlock>
                </>
              )}
              <Rule accentVar={accentVar} />
              <MetaBlock
                label={cs.servicesLabel ?? "SERVICES"}
                accentVar={accentVar}
              >
                <IndentedToBodyCopy>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      fontSize: "var(--fs-body)",
                      lineHeight: 1.55,
                      color: accentVar,
                      margin: 0,
                    }}
                  >
                    {cs.services}
                  </p>
                </IndentedToBodyCopy>
              </MetaBlock>
              {cs.credits.length > 0 && (
                <>
                  <Rule accentVar={accentVar} />
                  <MetaBlock label="CREDITS" accentVar={accentVar}>
                    <IndentedToBodyCopy>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.25rem",
                        }}
                      >
                        {cs.credits.map((c) => (
                          <li
                            key={`${c.role}-${c.person}`}
                            style={{
                              fontFamily: "var(--font-body)",
                              fontWeight: 400,
                              fontSize: "var(--fs-body)",
                              lineHeight: 1.55,
                              color: accentVar,
                            }}
                          >
                            {c.role} —{" "}
                            {c.href ? (
                              <a
                                href={c.href}
                                data-cursor="view"
                                data-no-advance
                                style={{
                                  color: accentVar,
                                  textDecoration: "underline",
                                }}
                              >
                                {c.person}
                              </a>
                            ) : (
                              <span style={{ textDecoration: "underline" }}>
                                {c.person}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </IndentedToBodyCopy>
                  </MetaBlock>
                </>
              )}
            </>
          )}
          </motion.div>
          </AnimatePresence>

          {/* Tab progress dots — active tab filled, others outlined.
              Sits at the bottom of the rail, centred, showing all 3
              tabs at a glance. */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "auto",
              paddingTop: "1.5rem",
            }}
          >
            {TAB_DEFS.map((_, i) => (
              <span
                key={i}
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor:
                    i === tabIdx ? accentVar : "transparent",
                  border: `1px solid ${accentVar}`,
                }}
              />
            ))}
          </div>

        </div>

        {/* Right reel — cols 17-32 (was 13-32). Two cols of negative space
            (15-16) now sit between the centred rail and the reel so the
            two slabs feel deliberately spaced rather than pressed together.
            Auto-scrolling stills + video stack; real assets replace the
            placeholder tiles once they exist (spec §4 "auto-scrolling reel"). */}
        <div
          style={{
            gridColumn: COL_CASE_REEL,
            height: "100vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CaseStudyReel
            slug={`${project.slug}-${item.number}`}
            direction={project.accent === "mint" ? "horizontal" : "vertical"}
            accentVar={accentVar}
            items={cs.reel}
            fit={cs.reelFit ?? "cover"}
            bg={cs.reelBg}
            onZoomImage={setZoomedImage}
          />
        </div>
      </div>

      {/* Back arrow — pinned to the bottom-left of the viewport with
          equal 1.5rem offsets from the left and bottom edges. Lives
          outside the rail's flex column so its position is anchored to
          the section (which fills the viewport) rather than the rail. */}
      <button
        type="button"
        data-cursor="view"
        data-magnetic
        data-no-advance
        aria-label="Back to Select Work"
        onClick={onClose}
        style={{
          position: "absolute",
          left: "1.5rem",
          bottom: "1.5rem",
          background: "none",
          border: "none",
          cursor: "inherit",
          padding: "0.25rem",
          color: accentVar,
          fontSize: "1.5rem",
          lineHeight: 1,
          zIndex: 5,
        }}
      >
        <span aria-hidden>↙</span>
      </button>

      {/* Click-to-zoom lightbox for reel images. Sits at the panel
          level so it can layer over the rail and reel together. */}
      <AnimatePresence>
        {zoomedImage && (
          <CaseStudyImageLightbox
            image={zoomedImage}
            onClose={() => setZoomedImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Image lightbox ──────────────────────────────────────────────────── */

function CaseStudyImageLightbox({
  image,
  onClose,
}: {
  image: { src: string; alt?: string };
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div
      key="case-study-lightbox"
      role="dialog"
      aria-modal="true"
      data-no-advance
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0, 0, 0, 0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        cursor: "zoom-out",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt ?? ""}
        onClick={(e) => e.stopPropagation()}
        style={{
          // Intrinsic sizing within the viewport bounds — the <img>
          // element box matches the rendered image, so background clicks
          // around it reliably hit the wrapper. (objectFit: contain
          // would letterbox the pixels INSIDE the img element, making
          // those letterbox bands swallow the close click via the
          // stopPropagation below.)
          width: "auto",
          height: "auto",
          maxWidth: "100%",
          maxHeight: "100%",
          display: "block",
        }}
      />
    </motion.div>
  );
}

/* ─── Case-study sub-components ────────────────────────────────────────── */

function TabBox({
  index,
  label,
  active,
  accentVar,
  onClick,
}: {
  index: number;
  label: string;
  active: boolean;
  accentVar: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-cursor="view"
      data-no-advance
      aria-pressed={active}
      onClick={onClick}
      style={{
        // Button sizes naturally to its widest child — that's the label,
        // since it's wider than the 2rem number box. Both children stack
        // top-aligned and left-aligned via flex column / align-items
        // flex-start, so the box always sits directly above its label's
        // left edge. Combined with justify-content: space-between in the
        // parent row, BRIEF anchors flush left, SOLUTION anchors flush
        // right (label right edge = rule right edge), and the box rides
        // along with the label — no overflow off the rail.
        position: "relative",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "inherit",
        opacity: active ? 1 : 0.55,
        transition: "opacity 0.25s cubic-bezier(0.22,1,0.36,1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.5rem",
      }}
    >
      <div
        data-cursor-color={active ? "ink" : undefined}
        style={{
          width: "1.5rem",
          height: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${accentVar}`,
          backgroundColor: active ? accentVar : "transparent",
          color: active ? "var(--ink)" : accentVar,
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "0.9375rem", // 15px
          transition:
            "background-color 0.25s cubic-bezier(0.22,1,0.36,1), color 0.25s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {index}
      </div>
      <span
        className="text-label"
        style={{
          whiteSpace: "nowrap",
          color: accentVar,
        }}
      >
        [ {label} ]
      </span>
    </button>
  );
}

/** Horizontal accent rule used between every section in the case-study
 *  left rail. Lives inside the parent flex column so the surrounding gap
 *  yields equal vertical distance above and below. */
function Rule({ accentVar }: { accentVar: string }) {
  return (
    <div
      aria-hidden
      style={{
        height: 1,
        // Pin the 1px height — without flex-shrink:0 the rail's flex
        // column would collapse this to 0 when content (notably BRIEF's
        // body + 3 meta blocks + dots) exceeds the 100vh rail height,
        // which is why the under-tabs rule was vanishing on BRIEF.
        flexShrink: 0,
        // Left overflow into the col-1 gutter so the rule reads as if it
        // belongs to the ink block. Right edge stays flush with the rail
        // so the line doesn't run onto the reel media.
        marginLeft: "-1.5rem",
        backgroundColor: accentVar,
        opacity: 0.4,
      }}
    />
  );
}

/** Offsets its child to cols 2-8 of the rail's nested 9-col grid — same
 *  cells as the body paragraph in BRIEF, so client/services/credits
 *  content lines up vertically with the body copy above. */
/**
 * Wraps meta-block content (CLIENT / SERVICES / CREDITS values). Aligns
 * the value's left edge with the BRIEF body copy on the tab above —
 * the BRIEF row has `marginLeft: -1.5rem` and its body text starts
 * after the rotated chip (1.5rem wide) + gap (1.5rem), so the body
 * text effectively lives at `+1.5rem` from the rail's natural left.
 * Mirroring that offset here keeps the page's information column on a
 * single vertical guideline.
 */
function IndentedToBodyCopy({ children }: { children: React.ReactNode }) {
  return <div style={{ marginLeft: "1.5rem" }}>{children}</div>;
}

function MetaBlock({
  label,
  accentVar,
  children,
}: {
  label: string;
  accentVar: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span
        className="text-label"
        style={{
          color: accentVar,
          display: "block",
          // Pull the [CLIENT]/[SERVICES]/[CREDITS] label left so it
          // aligns with the surrounding rules (which extend -1.5rem
          // into the rail's col-1 gutter).
          marginLeft: "-1.5rem",
          marginBottom: "0.5rem",
          opacity: 0.9,
        }}
      >
        [ {label} ]
      </span>
      {children}
    </div>
  );
}

/**
 * Auto-scrolling stills + video reel placeholder. Renders a stack of
 * placeholder tiles that translate vertically on a seamless loop. When
 * real assets arrive, replace each tile with an <img> or <video autoPlay
 * loop muted playsInline />. Per spec §4, INSPIRED projects scroll
 * horizontally (right-to-left) instead of vertically (bottom-to-top).
 */
function CaseStudyReel({
  slug,
  direction,
  accentVar,
  items,
  fit = "cover",
  bg,
  onZoomImage,
}: {
  slug: string;
  direction: "vertical" | "horizontal";
  accentVar: string;
  items?: ReelItem[];
  /** How each tile's media fills the 16:9 frame. "cover" crops to fill;
   *  "contain" letterboxes the asset against the ink frame. */
  fit?: "cover" | "contain";
  /** CSS color override for the tile / container background. */
  bg?: string;
  /** Image tiles call this to open the click-to-zoom lightbox. */
  onZoomImage?: (img: { src: string; alt?: string }) => void;
}) {
  const isVertical = direction === "vertical";
  const innerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const hoveredRef = useRef(false);
  // When a user clicks a video tile to play it with audio, this pauses
  // the auto-scroll so the video stays in view while audible. Toggled
  // back to false when the user clicks again to re-mute. Lifted to the
  // reel so any of its tiles can drive the pause state.
  const audioPausedRef = useRef(false);
  // Real items if supplied, otherwise placeholder tiles. Duplicated stack
  // gives a seamless animation loop — when the offset hits -halfStackPx,
  // we wrap back to 0 and the second copy is already in position.
  const tiles: ReelTile[] =
    items && items.length > 0
      ? items.map((it, i) => ({ key: `${i}`, content: it }))
      : Array.from({ length: 4 }, (_, i) => ({
          key: `placeholder-${i}`,
          content: null,
          shade: i % 2,
        }));
  // ~9s of dwell-pass per tile — slow, ambient drift. The auto-trigger
  // bug was about the rAF not running, not the speed itself.
  const dwellSecPerTile = 9;
  // Auto-scroll speed in CSS px per second. Computed so each tile takes
  // dwellSecPerTile to scroll past at the dominant axis size.
  // We measure halfStackPx on first paint and bake it into the animation
  // tick. JS-driven so we can pause on hover and let the user manually
  // scrub via wheel.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    let raf = 0;
    let lastT = performance.now();
    const tick = (t: number) => {
      const dt = Math.max(0, Math.min(0.1, (t - lastT) / 1000));
      lastT = t;
      const halfStack = isVertical
        ? inner.scrollHeight / 2
        : inner.scrollWidth / 2;
      if (halfStack > 0) {
        if (!hoveredRef.current && !audioPausedRef.current) {
          const pxPerSec = halfStack / (tiles.length * dwellSecPerTile);
          offsetRef.current -= pxPerSec * dt;
        }
        // Wrap so the offset stays in [-halfStack, 0]. Either end shows
        // the seam joining the duplicated stack to its original copy.
        if (offsetRef.current <= -halfStack) {
          offsetRef.current += halfStack;
        } else if (offsetRef.current > 0) {
          offsetRef.current -= halfStack;
        }
        inner.style.transform = isVertical
          ? `translate3d(0, ${offsetRef.current}px, 0)`
          : `translate3d(${offsetRef.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isVertical, tiles.length]);

  // Wheel over the reel moves the reel manually. React's inline
  // `onWheel` is registered at the root with `passive: true` by
  // default, which silently drops preventDefault — leaving the page
  // handler to advance/close the case study. We attach the listener
  // directly to the reel node with `{ passive: false }` so
  // preventDefault + stopPropagation actually fire, and the native
  // event never bubbles up to the case-study or page window listeners.
  const reelHostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = reelHostRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Pinch-to-zoom: let the browser's native zoom run.
      if (e.ctrlKey) return;
      e.preventDefault();
      e.stopPropagation();
      offsetRef.current -= e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={reelHostRef}
      key={slug}
      data-reel-scroll
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: bg ?? "var(--ink)",
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          willChange: "transform",
        }}
      >
        {[...tiles, ...tiles].map((tile, i) => {
          // Horizontal "contain" reels (TUESGAY flyers, Paintings) drop
          // the 16:9 aspect ratio and let each tile size to its image's
          // natural aspect at full reel height. The result: adjacent
          // posters butt up against each other instead of sitting
          // letterboxed inside an oversized 16:9 box.
          const isHorizontalContain =
            !isVertical &&
            fit === "contain" &&
            tile.content !== null &&
            tile.content.kind !== "youtube";
          return (
            <div
              key={i}
              style={{
                flex: "0 0 auto",
                width: isVertical
                  ? "100%"
                  : isHorizontalContain
                    ? "auto"
                    : "min(70vw, 980px)",
                aspectRatio: isHorizontalContain ? undefined : "16 / 9",
                height: isVertical ? undefined : "100%",
                position: "relative",
                overflow: "hidden",
                backgroundColor:
                  tile.content === null
                    ? tile.shade === 0
                      ? `color-mix(in srgb, var(--ink) 92%, ${accentVar})`
                      : `color-mix(in srgb, var(--ink) 96%, ${accentVar})`
                    : (bg ?? "var(--ink)"),
              }}
            >
              {tile.content && (
                <ReelTileContent
                  item={tile.content}
                  fit={fit}
                  sizingMode={isHorizontalContain ? "natural" : "fixed"}
                  enableAudio
                  onAudioActiveChange={(active) => {
                    audioPausedRef.current = active;
                  }}
                  onZoomImage={onZoomImage}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type ReelTile = {
  key: string;
  content: ReelItem | null;
  shade?: number;
};

/** Renders a single reel item's media. Self-hosted videos use a native
 *  <video> tag with autoplay + muted + loop + playsinline — zero player
 *  chrome. YouTube embeds (legacy) use the privacy-enhanced
 *  youtube-nocookie domain with every chrome-hiding param the API
 *  supports; some UI (title overlay, watch-on-youtube link) is still
 *  baked in — prefer the "video" kind for clean playback.
 *
 *  `fit` selects object-fit for the media — "cover" crops to fill (good
 *  for wide screenshots / videos), "contain" letterboxes against the
 *  ink frame (good for flyers and paintings whose composition would be
 *  ruined by cropping).
 *
 *  `enableAudio` opts the tile into click-to-unmute behaviour: a
 *  "[ click to play audio ]" hint overlays the video while muted; a
 *  click unmutes + restarts from t=0 + tells the parent reel to pause
 *  auto-scroll via `onAudioActiveChange`. A second click re-mutes and
 *  resumes scrolling. */
function ReelTileContent({
  item,
  fit = "cover",
  sizingMode = "fixed",
  enableAudio = false,
  onAudioActiveChange,
  onZoomImage,
}: {
  item: ReelItem;
  fit?: "cover" | "contain";
  /** "fixed" (default) → media renders absolute / inset 0 inside the
   *  parent tile (which carries the aspect-ratio). "natural" → media
   *  renders in flow with height 100%, width auto so it carries its
   *  own intrinsic aspect, and the parent tile auto-sizes to match. */
  sizingMode?: "fixed" | "natural";
  enableAudio?: boolean;
  onAudioActiveChange?: (active: boolean) => void;
  /** Image tiles fire this on click → opens the lightbox. */
  onZoomImage?: (img: { src: string; alt?: string }) => void;
}) {
  if (item.kind === "video") {
    return (
      <VideoReelTile
        item={item}
        fit={fit}
        sizingMode={sizingMode}
        enableAudio={enableAudio}
        onAudioActiveChange={onAudioActiveChange}
      />
    );
  }
  if (item.kind === "youtube") {
    const src =
      `https://www.youtube-nocookie.com/embed/${item.id}` +
      `?autoplay=1&mute=1&loop=1&playlist=${item.id}` +
      `&controls=0&modestbranding=1&rel=0&iv_load_policy=3` +
      `&disablekb=1&playsinline=1&fs=0&cc_load_policy=0` +
      `&showinfo=0`;
    return (
      <iframe
        aria-hidden
        src={src}
        title={item.title ?? "Project video"}
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
          pointerEvents: "none",
        }}
      />
    );
  }
  if (sizingMode === "natural") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.src}
        alt={item.alt}
        onClick={
          onZoomImage
            ? () => onZoomImage({ src: item.src, alt: item.alt })
            : undefined
        }
        style={{
          height: "100%",
          width: "auto",
          display: "block",
          objectFit: fit,
          cursor: onZoomImage ? "zoom-in" : undefined,
        }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.src}
      alt={item.alt}
      onClick={
        onZoomImage
          ? () => onZoomImage({ src: item.src, alt: item.alt })
          : undefined
      }
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: fit,
        display: "block",
        cursor: onZoomImage ? "zoom-in" : undefined,
      }}
    />
  );
}

/** Video tile with optional click-to-play-audio support. When
 *  enableAudio is false the tile renders an unclickable muted-loop
 *  video and stays out of the way of reel-level wheel scrolling.
 *  When true, clicking the tile unmutes and restarts the video,
 *  signals the parent reel to pause its auto-scroll, and swaps the
 *  overlay hint to a "click to mute" indicator. */
function VideoReelTile({
  item,
  fit,
  sizingMode = "fixed",
  enableAudio,
  onAudioActiveChange,
}: {
  item: Extract<ReelItem, { kind: "video" }>;
  fit: "cover" | "contain";
  sizingMode?: "fixed" | "natural";
  enableAudio: boolean;
  onAudioActiveChange?: (active: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioActive, setAudioActive] = useState(false);
  // The "[ click to play audio ]" affordance shows by default for any
  // video in a case-study reel. Silent MP4s opt out by setting
  // hasAudio: false on the ReelItem so they don't promise sound the
  // user won't hear.
  const audioInteractive = enableAudio && item.hasAudio !== false;

  const toggleAudio = (e: React.MouseEvent) => {
    if (!audioInteractive) return;
    e.preventDefault();
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (audioActive) {
      v.muted = true;
      setAudioActive(false);
      onAudioActiveChange?.(false);
    } else {
      v.muted = false;
      v.currentTime = 0;
      void v.play();
      setAudioActive(true);
      onAudioActiveChange?.(true);
    }
  };

  if (sizingMode === "natural") {
    return (
      <div
        style={{ height: "100%", position: "relative", display: "block" }}
        onClick={audioInteractive ? toggleAudio : undefined}
        data-cursor={audioInteractive ? "view" : undefined}
        data-no-advance={audioInteractive ? "" : undefined}
      >
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          src={item.src}
          poster={item.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          style={{
            height: "100%",
            width: "auto",
            display: "block",
            objectFit: fit,
            pointerEvents: "none",
          }}
        />
        {audioInteractive && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: "1rem",
              bottom: "1rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              // White + mix-blend difference inverts against any
              // backdrop, so the hint stays legible across changing
              // video frames.
              color: "#ffffff",
              mixBlendMode: "difference",
              opacity: 0.85,
              pointerEvents: "none",
            }}
          >
            [ {audioActive ? "click to mute" : "click to play audio"} ]
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{ position: "absolute", inset: 0 }}
      onClick={audioInteractive ? toggleAudio : undefined}
      data-cursor={audioInteractive ? "view" : undefined}
      data-no-advance={audioInteractive ? "" : undefined}
      role={audioInteractive ? "button" : undefined}
      tabIndex={audioInteractive ? 0 : undefined}
      onKeyDown={(e) => {
        if (!audioInteractive) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleAudio(e as unknown as React.MouseEvent);
        }
      }}
      aria-label={
        audioInteractive
          ? audioActive
            ? "Mute and resume reel"
            : "Click to play audio"
          : undefined
      }
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={item.src}
        poster={item.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: fit,
          display: "block",
          pointerEvents: "none",
        }}
      />
      {audioInteractive && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: "1rem",
            bottom: "1rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            // White + mix-blend difference inverts against any
            // backdrop so the hint stays legible across changing
            // video frames.
            color: "#ffffff",
            mixBlendMode: "difference",
            opacity: 0.85,
            pointerEvents: "none",
            transition: "opacity 0.25s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          [ {audioActive ? "click to mute" : "click to play audio"} ]
        </span>
      )}
    </div>
  );
}

/**
 * Case-study back control. Mono bracketed "[ ← Back to Work ]" button
 * (matches the mobile tray) — replaces the earlier NRJ disc so the
 * affordance reads as an explicit return action rather than a wordmark
 * badge.
 */
function CaseStudyMark({
  accentVar,
  onClick,
}: {
  accentVar: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      data-cursor="view"
      data-no-advance
      onClick={onClick}
      aria-label="Back to Select Work"
      style={{
        background: "none",
        border: "none",
        padding: "0.4rem 0",
        margin: 0,
        fontFamily: "var(--font-mono)",
        fontSize: "0.8125rem",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: accentVar,
        cursor: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      [ ← Back to Work ]
    </button>
  );
}
