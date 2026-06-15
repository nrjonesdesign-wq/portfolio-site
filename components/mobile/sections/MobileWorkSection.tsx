"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HIRED,
  INSPIRED,
  type Project,
  type ProjectItem,
  type ReelItem,
} from "@/content/projects";

import { DUR, EASE, STAGGER } from "@/lib/motion";

/**
 * Mobile Work accordion.
 *
 * Vertical stack of project rows, grouped by HIRED and INSPIRED. Tap a
 * row to expand inline → reveals a preview tile (first reel item) plus
 * the project's items as [ PROJECT ] / number / description / VIEW
 * WORK blocks. Tapping the open row again collapses it; tapping a
 * different row swaps which is open.
 *
 * Section background is sky for HIRED. When an INSPIRED row opens, the
 * section bg flips to mint via the `onAccentChange` callback (consumed
 * by MobileHome's useColorScheme). This mirrors the desktop's accent
 * follow-the-open-project behaviour.
 */

type Props = {
  /** Controlled open slug. Lifted to MobileHome so the parent can
   *  reset it on every navigation away from the WORK section. */
  openSlug: string | null;
  onOpenSlugChange: (slug: string | null) => void;
  /** Reports up which accent the section should paint with: "sky"
   *  when no INSPIRED row is open, "mint" when one is. */
  onAccentChange?: (accent: "sky" | "mint") => void;
  /** Tapping VIEW WORK on a project item asks the parent to open the
   *  case-study tray for that item. */
  onOpenCaseStudy?: (itemNumber: string) => void;
};

export default function MobileWorkSection({
  openSlug,
  onOpenSlugChange,
  onAccentChange,
  onOpenCaseStudy,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  const toggle = (slug: string) =>
    onOpenSlugChange(openSlug === slug ? null : slug);

  // Report accent up so MobileHome can flip the page tokens (sky→mint).
  useEffect(() => {
    const inspired = openSlug
      ? INSPIRED.some((p) => p.slug === openSlug)
      : false;
    onAccentChange?.(inspired ? "mint" : "sky");
  }, [openSlug, onAccentChange]);

  // When a row opens, scroll its top to just under the headline so
  // the user immediately sees the drawer expansion (rather than the
  // drawer appearing entirely below the fold of a scrolled section).
  useEffect(() => {
    if (!openSlug) return;
    const section = sectionRef.current;
    if (!section) return;
    const row = section.querySelector<HTMLElement>(
      `[data-project-slug="${openSlug}"]`,
    );
    if (!row) return;
    // Delay so the AnimatePresence open animation begins before we
    // adjust scroll position.
    const t = window.setTimeout(() => {
      const sectionTop = section.getBoundingClientRect().top;
      const rowTop = row.getBoundingClientRect().top;
      const target = section.scrollTop + (rowTop - sectionTop) - 80;
      section.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }, 60);
    return () => window.clearTimeout(t);
  }, [openSlug]);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="snap"
      data-mobile-work-section
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        position: "relative",
        // Free vertical scroll within the section. Accordion content
        // flows naturally from the top of the visible area; when a
        // drawer opens and its content exceeds one viewport, the user
        // scrolls within the section to see all of it.
        // overscroll-behavior: auto (default) so reaching top/bottom
        // chains to main's scroll-snap, letting the user step to the
        // previous / next section.
        height: "100dvh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        boxSizing: "border-box",
        paddingTop: "1.25rem",
        // When a drawer is open, add a bottom spacer so the user can
        // scroll the page up past the last project's content — bringing
        // its VIEW WORK button comfortably into view before the scroll
        // chains to main's snap (→ Contact). Closed accordion stays
        // compact so it doesn't scroll needlessly.
        paddingBottom: openSlug ? "28vh" : "1.5rem",
      }}
    >
      {/* "Select Work" headline — same styling as Name screen's
          "Select Engagements" heading. */}
      <h2
        style={{
          paddingLeft: "var(--m-gutter)",
          paddingRight: "var(--m-gutter)",
          marginTop: 0,
          marginBottom: "1rem",
          fontFamily: "var(--font-body)",
          // 34px — paired with Select Engagements.
          fontSize: "2.125rem",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: "var(--fg)",
        }}
      >
        Select Work
      </h2>

      <div style={{ borderTop: "1px solid var(--fg)" }}>
        <ProjectGroup
          label="Hired"
          projects={HIRED}
          openSlug={openSlug}
          onToggle={toggle}
          onOpenCaseStudy={onOpenCaseStudy}
        />
        <ProjectGroup
          label="Inspired"
          projects={INSPIRED}
          openSlug={openSlug}
          onToggle={toggle}
          onOpenCaseStudy={onOpenCaseStudy}
        />
      </div>
    </section>
  );
}

/* ─── Group ──────────────────────────────────────────────────────────── */

function ProjectGroup({
  label,
  projects,
  openSlug,
  onToggle,
  onOpenCaseStudy,
}: {
  label: string;
  projects: Project[];
  openSlug: string | null;
  onToggle: (slug: string) => void;
  onOpenCaseStudy?: (itemNumber: string) => void;
}) {
  return (
    <>
      <GroupLabel>{label}</GroupLabel>
      {projects.map((project) => (
        <MobileProjectRow
          key={project.slug}
          project={project}
          open={openSlug === project.slug}
          onToggle={() => onToggle(project.slug)}
          onOpenCaseStudy={onOpenCaseStudy}
        />
      ))}
    </>
  );
}

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        paddingLeft: "var(--m-gutter)",
        paddingRight: "var(--m-gutter)",
        height: "2.25rem",
        display: "flex",
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-label)",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        // Match the rest of the accordion text — project names + marquee
        // both use var(--fg).
        color: "var(--fg)",
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
          backgroundSize: "3px 3px",
          mixBlendMode: "multiply",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </div>
  );
}

/* ─── Project row ────────────────────────────────────────────────────── */

function MobileProjectRow({
  project,
  open,
  onToggle,
  onOpenCaseStudy,
}: {
  project: Project;
  open: boolean;
  onToggle: () => void;
  onOpenCaseStudy?: (itemNumber: string) => void;
}) {
  return (
    <div
      data-project-slug={project.slug}
      style={{ borderBottom: "1px solid var(--fg)" }}
    >
      {/* Tap-target header. Inverts on open: ink bg, accent text. */}
      <button
        type="button"
        data-no-advance
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`${open ? "Collapse" : "Expand"} ${project.name}`}
        style={{
          width: "100%",
          background: open ? "var(--ink)" : "transparent",
          color: open ? `var(--${project.accent})` : "var(--fg)",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          // Touch-friendly vertical padding — comfortable tap target
          // without crowding the marquee underneath.
          padding: "0.875rem var(--m-gutter)",
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
          transition:
            "background-color 0.3s cubic-bezier(0.22,1,0.36,1), color 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            // Mobile-substantial heading per the PDFs — visually
            // dominant within the row, with the marquee acting as
            // smaller mono caption beneath.
            fontSize: "1.375rem",
            fontWeight: 700,
            letterSpacing: "0.005em",
            lineHeight: 1.15,
          }}
        >
          {project.name}
        </span>
        <DisciplineMarquee text={project.disciplines} />
      </button>

      {/* Expanded content: preview tile + items list. AnimatePresence
          animates height open/close; content flows naturally — the
          parent WORK section's overflow-y: auto handles overflow when
          a tall drawer exceeds the visible viewport. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ overflow: "hidden", backgroundColor: "var(--ink)" }}
          >
            <ExpandedContent
              project={project}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Expanded content ───────────────────────────────────────────────── */

/**
 * Interleave reel items from every project item in round-robin order
 * so a multi-item project (e.g. Bloomberg = 01 + 02) cycles through
 * assets from BOTH items in alternating fashion. Each entry remembers
 * which item.number it belongs to so the tap-to-open-case-study click
 * routes to the right item.
 */
type PreviewEntry = { itemNumber: string; asset: ReelItem };

function interleaveReels(items: ProjectItem[]): PreviewEntry[] {
  const lists = items.map((it) => ({
    number: it.number,
    reel: it.caseStudy.reel ?? [],
  }));
  const maxLen = lists.reduce((m, l) => Math.max(m, l.reel.length), 0);
  const result: PreviewEntry[] = [];
  for (let i = 0; i < maxLen; i++) {
    for (const l of lists) {
      const asset = l.reel[i];
      if (asset) result.push({ itemNumber: l.number, asset });
    }
  }
  return result;
}

function ExpandedContent({
  project,
  onOpenCaseStudy,
}: {
  project: Project;
  onOpenCaseStudy?: (itemNumber: string) => void;
}) {
  const accentVar = `var(--${project.accent})`;
  // Interleaved preview entries — alternates between item assets for
  // multi-item projects.
  const entries = useMemo(() => interleaveReels(project.items), [project.items]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const activeEntry = entries[previewIdx] ?? null;
  const activeItem = activeEntry
    ? project.items.find((i) => i.number === activeEntry.itemNumber)
    : project.items[0];
  const previewBg = activeItem?.caseStudy.reelBg ?? "var(--ink)";

  // Cycle through the interleaved entries every ~3.5 s. Single-entry
  // projects skip the timer (nothing to cycle).
  useEffect(() => {
    if (entries.length <= 1) return;
    const t = window.setTimeout(() => {
      setPreviewIdx((i) => (i + 1) % entries.length);
    }, 3500);
    return () => window.clearTimeout(t);
  }, [previewIdx, entries.length]);

  return (
    <div
      style={{
        paddingBottom: "1.75rem",
      }}
    >
      {/* 16:9 preview tile. Crossfades through interleaved entries
          (see interleaveReels). Tapping it opens the case study for
          the item whose asset is currently on screen. */}
      <button
        type="button"
        data-no-advance
        onClick={() =>
          activeEntry && onOpenCaseStudy?.(activeEntry.itemNumber)
        }
        aria-label={`Open ${project.name} case study`}
        style={{
          appearance: "none",
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          width: "100%",
          aspectRatio: "16 / 9",
          backgroundColor: previewBg,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          display: "block",
        }}
      >
        {entries.length > 0 ? (
          // Each entry sits stacked; the active one is opaque, the
          // rest fade out. Smooth 0.6s crossfade. Each item's own
          // `reelFit` drives whether the asset is cover-cropped or
          // letterboxed against the tile's bg.
          entries.map((entry, i) => {
            const entryItem = project.items.find(
              (it) => it.number === entry.itemNumber,
            );
            const fit = entryItem?.caseStudy.reelFit ?? "cover";
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: i === previewIdx ? 1 : 0,
                  transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <ReelTilePreview item={entry.asset} fit={fit} />
              </div>
            );
          })
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(color-mix(in srgb, var(--fg) 25%, transparent) 1px, transparent 1px)",
              backgroundSize: "12px 12px",
              opacity: 0.45,
            }}
          />
        )}
        {/* Project number stencil — follows whichever item's asset is
            currently visible in the cross-fade. */}
        {activeEntry && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: "1rem",
              bottom: "0.875rem",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "1.25rem",
              letterSpacing: "-0.01em",
              color: accentVar,
              pointerEvents: "none",
            }}
          >
            {activeEntry.itemNumber}
          </span>
        )}
      </button>

      {/* Per-item content blocks. Outer drawer wrapper carries
          data-drawer-scroll + the overflow cap; this list is just a
          flex column for spacing. */}
      <div
        style={{
          paddingLeft: "var(--m-gutter)",
          paddingRight: "var(--m-gutter)",
          paddingTop: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {project.items.map((item, i) => (
          <ProjectItemBlock
            key={item.number}
            item={item}
            accentVar={accentVar}
            delay={i * STAGGER.item}
            onOpenCaseStudy={onOpenCaseStudy}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectItemBlock({
  item,
  accentVar,
  delay,
  onOpenCaseStudy,
}: {
  item: ProjectItem;
  accentVar: string;
  delay: number;
  onOpenCaseStudy?: (itemNumber: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE, delay: 0.1 + delay }}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        columnGap: "0.75rem",
        rowGap: "0.5rem",
        color: accentVar,
      }}
    >
      <span
        className="text-label"
        style={{
          color: accentVar,
          gridColumn: "1 / 2",
          gridRow: "1 / 2",
          alignSelf: "start",
          // Match the number's first-line baseline.
          paddingTop: "0.35rem",
        }}
      >
        [ Project ]
      </span>
      <span
        style={{
          gridColumn: "2 / 3",
          gridRow: "1 / 2",
          fontFamily: "var(--font-body)",
          fontSize: "1.25rem",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: accentVar,
        }}
      >
        {item.number}
      </span>
      <p
        className="text-body"
        style={{
          gridColumn: "2 / 3",
          color: accentVar,
          opacity: 0.95,
          margin: 0,
        }}
      >
        {item.description}
      </p>
      <button
        type="button"
        data-cursor="view"
        data-no-advance
        onClick={() => onOpenCaseStudy?.(item.number)}
        style={{
          gridColumn: "2 / 3",
          justifySelf: "start",
          marginTop: "0.5rem",
          padding: "0.5rem 0.85rem",
          backgroundColor: accentVar,
          color: "var(--ink)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-label)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          border: "none",
          cursor: "pointer",
        }}
      >
        View Work
      </button>
    </motion.div>
  );
}

/* ─── Preview tile renderer ──────────────────────────────────────────── */

function ReelTilePreview({
  item,
  fit = "cover",
}: {
  item: ReelItem;
  /** Same option set as the desktop reel: "cover" crops to fill the
   *  16:9 frame, "contain" letterboxes the asset (with the tile's
   *  bg color showing on the sides / top / bottom). */
  fit?: "cover" | "contain";
}) {
  if (item.kind === "video") {
    return (
      <video
        src={item.src}
        poster={item.poster}
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          display: "block",
        }}
      />
    );
  }
  if (item.kind === "image") {
    return (
      <img
        src={item.src}
        alt={item.alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          display: "block",
        }}
      />
    );
  }
  // YouTube: render the official thumbnail (no embed chrome in the
  // accordion preview — the full embed lives in the case-study reel).
  return (
    <img
      src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
      alt={item.title ?? ""}
      style={{
        width: "100%",
        height: "100%",
        objectFit: fit,
        display: "block",
      }}
    />
  );
}

/* ─── Discipline marquee (mobile) ────────────────────────────────────── */

const MARQUEE_SEP = " ★ ";

function StarSep() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        margin: "0 0.55em",
        transform: "translateY(-0.12em)",
      }}
    >
      ★
    </span>
  );
}

function renderMarqueeSegment(tags: string[], copyIdx: number) {
  const out: ReactNode[] = [<StarSep key={`${copyIdx}-lead`} />];
  tags.forEach((tag, i) => {
    out.push(<span key={`${copyIdx}-tag-${i}`}>{tag}</span>);
    out.push(<StarSep key={`${copyIdx}-sep-${i}`} />);
  });
  // Drop the trailing separator so the seam between two copies has
  // exactly one star — matching every other gap.
  out.pop();
  return out;
}

function marqueeDurationSec(charCount: number): number {
  const TARGET_PX_PER_SEC = 38;
  const APPROX_PX_PER_CHAR = 7.5;
  return Math.max(6, (charCount * APPROX_PX_PER_CHAR) / TARGET_PX_PER_SEC);
}

function DisciplineMarquee({ text }: { text: string }) {
  const tags = text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // Constant on-screen drift speed (px/s) so longer disciplines lists
  // cycle slower in seconds-per-loop but the same speed past your eye.
  const baseSpeedPxPerSec = 38;

  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const interactingRef = useRef(false);
  const velocityRef = useRef(0);

  // Auto-drift + inertia loop. Same shape as MobileReel — raf-driven
  // so we can pause / scrub / flick with native touch handlers.
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
          // Wrap so the doubled segment loops seamlessly.
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

  // Touch scrub. Distinguishes tap from drag via total horizontal
  // travel — a stationary tap passes through to the row's onClick so
  // the accordion can still open; a drag captures the gesture and
  // scrubs the marquee with inertia on release.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
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
      // Don't claim the gesture until we know it's a drag.
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
        // We're scrubbing — block the row's synthetic click + native
        // scroll chain so the marquee is the gesture target.
        e.preventDefault();
        e.stopPropagation();
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
    const end = () => {
      active = false;
      interactingRef.current = false;
      if (totalAbsDx <= TAP_VS_DRAG_PX) {
        // Stationary tap — discard any tiny accumulated velocity so
        // the marquee doesn't twitch when the row opens.
        velocityRef.current = 0;
      }
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "1.5rem",
        // Let vertical scroll pass through; we'll capture horizontal
        // ourselves once a drag is detected.
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
          fontSize: "var(--fs-label)",
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

// Silence the unused import warning if MARQUEE_SEP isn't referenced
// directly — keep the constant declared so the separator stays one
// edit away from being swapped (e.g., to "  ⋆  " if the glyph ever
// changes).
void MARQUEE_SEP;
