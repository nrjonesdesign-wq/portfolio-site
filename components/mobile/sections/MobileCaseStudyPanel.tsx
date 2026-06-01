"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project, ProjectItem, ReelItem } from "@/content/projects";
import { DUR, EASE } from "@/lib/motion";

/**
 * Mobile case-study tray.
 *
 * Mounts as a full-screen overlay slid in from the right (mirrors the
 * desktop tray's "page turn" feel). Contains:
 *   - Header strip (NRJ mark + project number, ink-on-accent invert).
 *   - Title (multi-line Geist Bold).
 *   - Show/Hide-project-information toggle.
 *   - Expanded info: three numbered tab boxes (BRIEF / CHALLENGE /
 *     SOLUTION), tab content with sideways tab label + body text, and
 *     on BRIEF only, the meta blocks (CLIENT / SERVICES / CREDITS).
 *   - Reel: a stack of media tiles below the info panel area.
 *
 * Tab swipe + reel scrub + audio toggle land in follow-up turns.
 */

type Props = {
  project: Project;
  item: ProjectItem;
  onClose: () => void;
};

const TABS = [
  { key: "brief", label: "BRIEF" },
  { key: "challenge", label: "CHALLENGE" },
  { key: "solution", label: "SOLUTION" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// Shared column metrics so EVERY body-copy block (the tab paragraph
// and the SERVICES / CREDITS meta content) left-aligns to the same
// column. The chip/tag sits in the first column; the body copy starts
// one chip-column + gap in, with the gap providing breathing space.
// CHIP_COL + CHIP_GAP must equal BODY_COPY_LEFT.
const CHIP_COL = "2rem";
const CHIP_GAP = "1.5rem";
const BODY_COPY_LEFT = "3.5rem";
const BODY_COPY_RIGHT = "1rem";

export default function MobileCaseStudyPanel({
  project,
  item,
  onClose,
}: Props) {
  const [tabIdx, setTabIdx] = useState(0);
  // The info panel (tabs + body + meta) starts collapsed — the user
  // sees the title and the reel right away. Toggling expands the info
  // between the header and the reel.
  const [infoOpen, setInfoOpen] = useState(false);
  // Tap-to-zoom lightbox for reel images (paintings / flyers / extra-
  // tall page screenshots). Null = closed.
  const [zoomedImage, setZoomedImage] = useState<{
    src: string;
    alt?: string;
  } | null>(null);
  // Viewport height tracked in state so the morphing chevron knows
  // how far to slide down when the info card opens (top-right → bottom
  // -right). Re-measured on resize / orientation change.
  const [vh, setVh] = useState(0);
  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Measure the [Show/Hide Project Information] toggle so the chevron's
  // resting (closed) position bottom-aligns with it. Title length
  // varies per project (1 vs 2 lines), so a fixed offset would float
  // the chevron above the toggle on shorter titles — measuring keeps
  // it pinned. Vertical position is unaffected by the panel's
  // horizontal slide-in, so measuring shortly after mount is safe.
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [chevronTopPx, setChevronTopPx] = useState<number | null>(null);
  useEffect(() => {
    // Centre the chevron glyph on the toggle's vertical centre so the
    // two read on the same line. The glyph's centre sits 19px below
    // the chevron button's top (8px padding + 11px to the path centre
    // in the 22px viewBox). (−38 floated it a line high; −22 dropped
    // it a line low — centring lands it on the toggle.)
    const GLYPH_CENTER_FROM_TOP = 19;
    const measure = () => {
      const el = toggleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setChevronTopPx(rect.top + rect.height / 2 - GLYPH_CENTER_FROM_TOP);
    };
    const t = window.setTimeout(measure, 60);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [vh]);
  const tab = TABS[tabIdx];
  const accentVar = `var(--${project.accent})`;
  const cs = item.caseStudy;
  const tabBody =
    tab.key === "brief"
      ? cs.brief
      : tab.key === "challenge"
        ? cs.challenge
        : cs.solution.join("\n\n");
  const showMeta = tab.key === "brief";

  // Escape closes the tray (matches desktop).
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

  // Tab swipe — driven by an inner motion.div with `drag="x"`.
  // stepTab reads tabIdx directly (no setState updater closure) so
  // side effects like onClose fire cleanly outside React's render
  // pipeline, and we don't risk the updater being called twice in
  // dev/strict mode.
  const stepTab = (forward: boolean) => {
    if (forward) {
      if (tabIdx < TABS.length - 1) setTabIdx(tabIdx + 1);
      else onClose();
    } else {
      if (tabIdx > 0) setTabIdx(tabIdx - 1);
      else onClose();
    }
  };

  return (
    <motion.div
      key="case-study"
      data-case-study-tray
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        backgroundColor: "var(--ink)",
        color: accentVar,
        // Internal scroll — the panel's content can be tall (info
        // expanded + the full reel stack).
        overflowY: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        // Allow pan-y so the user can still scroll vertically when
        // the panel has overflow, but block native horizontal pan so
        // our pointer-event swipe handler can cleanly intercept
        // left/right swipes.
        touchAction: "pan-y",
      }}
    >
      {/* Morphing back-arrow icon. Closed (reel) state: parks in the
          toggle row at the top-right, right-facing. Open (info) state:
          slides down to the bottom-right of the card and flips
          horizontally so the chevron points back toward the [ ← Back
          to Work ] direction. Bottom inset matches the header's top
          inset (0.75rem) so the open-state position is equidistant
          from the bottom edge as the project number is from the top. */}
      {(() => {
        const CHEVRON_H_PX = 38;
        const BOTTOM_INSET_PX = 12; // 0.75rem — mirrors header top inset
        // Resting top measured so the chevron's bottom aligns with the
        // toggle's bottom. Fallback while the measurement settles.
        const topPx = chevronTopPx ?? 120;
        const yOpenPx =
          vh > 0 ? vh - BOTTOM_INSET_PX - CHEVRON_H_PX - topPx : 0;
        return (
          <motion.button
            type="button"
            data-no-advance
            onClick={() => setInfoOpen((v) => !v)}
            aria-label={
              infoOpen ? "Hide project information" : "Show project information"
            }
            aria-expanded={infoOpen}
            initial={false}
            animate={{
              // Slides down as the info card extends, and flips
              // vertically so it points UP (collapse cue) when open.
              y: infoOpen ? yOpenPx : 0,
              scaleY: infoOpen ? -1 : 1,
            }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              position: "fixed",
              top: `${topPx}px`,
              right: "var(--m-gutter)",
              zIndex: 5,
              background: "none",
              border: "none",
              padding: "0.5rem",
              margin: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: accentVar,
              cursor: "pointer",
            }}
          >
            <Chevron accentVar={accentVar} />
          </motion.button>
        );
      })()}

      {/* Tab progress dots — pinned to the bottom of the viewport
          when info is open, vertically centred with the chevron's
          glyph (chevron bottom inset 12px + half its 38px height =
          centre at 31px from the bottom; 8px dots → bottom 27px so
          their vertical centre lines up). Active tab filled, others
          outlined. */}
      <AnimatePresence>
        {infoOpen && (
          <motion.div
            key="tab-dots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{
              position: "fixed",
              bottom: 27,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              zIndex: 5,
              pointerEvents: "none",
            }}
          >
            {TABS.map((_, i) => (
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header strip — sits at the top with the NRJ mark + project
          number. Sticky so it stays visible as the user scrolls
          through the body + reel. */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          backgroundColor: "var(--ink)",
          paddingLeft: "var(--m-gutter)",
          paddingRight: "var(--m-gutter)",
          paddingTop: "0.75rem",
          paddingBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to Work"
          data-no-advance
          style={{
            background: "none",
            border: "none",
            padding: "0.4rem 0",
            margin: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-label)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: accentVar,
            cursor: "pointer",
          }}
        >
          [ ← Back to Work ]
        </button>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.25rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: accentVar,
          }}
        >
          {item.number}
        </span>
      </header>

      {/* Title + show-info toggle */}
      <div
        style={{
          paddingLeft: "var(--m-gutter)",
          paddingRight: "var(--m-gutter)",
          paddingTop: "0.5rem",
          paddingBottom: "1rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "1.625rem",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: accentVar,
            margin: 0,
            marginBottom: "1rem",
            whiteSpace: "pre-line",
          }}
        >
          {cs.title}
        </h1>

        {/* [ Show / Hide Project Information ] — the back-arrow that
            used to sit beside this toggle has moved to the
            bottom-right of the open info card (see below the meta
            blocks). */}
        <button
          ref={toggleRef}
          type="button"
          data-no-advance
          onClick={() => setInfoOpen((v) => !v)}
          aria-expanded={infoOpen}
          style={{
            background: "none",
            border: "none",
            padding: "0.25rem 0",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-label)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: accentVar,
            cursor: "pointer",
          }}
        >
          [ {infoOpen ? "Hide" : "Show"} Project Information ]
        </button>
      </div>

      {/* Below the header + title + toggle row, we swap between the
          reel (collapsed) and the full info card (expanded). Whichever
          is mounted fills the rest of the panel's flow. */}
      <AnimatePresence mode="wait" initial={false}>
        {infoOpen ? (
          <motion.section
            key="info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {/* Swipeable info card. framer's `drag="x"` explicitly
                captures horizontal pointer gestures (touch / mouse /
                pen) — far more reliable than onPan on the scrolling
                outer panel, which native scroll containers can
                silently steal pointer events from. dragConstraints
                clamps the card to its origin; dragElastic gives a tiny
                rubber-band so the user gets visual feedback that the
                swipe is being recognised. onDragEnd commits the tab
                step based on offset OR flick velocity. */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.22}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const dx = info.offset.x;
                const vx = info.velocity.x;
                // Low thresholds so a modest drag or quick flick
                // both commit. Real touch + mouse-drag both produce
                // generous offsets; DevTools' touch-emulation mode
                // is unreliable so test mouse-drag there.
                if (Math.abs(dx) > 30 || Math.abs(vx) > 120) {
                  stepTab(dx < 0 || vx < 0);
                }
              }}
              style={{
                paddingLeft: "var(--m-gutter)",
                paddingRight: "var(--m-gutter)",
                paddingBottom: "1.5rem",
                touchAction: "pan-y",
                cursor: "grab",
              }}
            >
              {/* Tab boxes — spread across the full content width so
                  BRIEF sits flush left, CHALLENGE centres, and SOLUTION
                  sits flush right (aligned with the rule's right edge).
                  Each box's number + label stay left-aligned to the
                  box's own left edge (handled inside TabBox). */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  paddingTop: "1rem",
                  paddingBottom: "1.75rem",
                }}
              >
                {TABS.map((t, i) => (
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

              {/* Tab content: sideways label + paragraph body. The
                  full-width rule below the tabs lives on this wrapper's
                  top border (so it stays put while the tab body swaps
                  inside the AnimatePresence). Swipe is handled by the
                  parent draggable motion.div. */}
              <div
                style={{
                  borderTop: `1px solid color-mix(in srgb, ${accentVar} 25%, transparent)`,
                  paddingTop: "1.75rem",
                  marginBottom: showMeta ? "1.75rem" : 0,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab.key}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    style={{
                      display: "grid",
                      // Fixed chip column + gap so the body copy starts
                      // exactly at BODY_COPY_LEFT, matching the meta
                      // blocks below.
                      gridTemplateColumns: `${CHIP_COL} 1fr`,
                      columnGap: CHIP_GAP,
                      alignItems: "start",
                    }}
                  >
                    <SidewaysLabel label={tab.label} accentVar={accentVar} />
                    <div style={{ paddingRight: BODY_COPY_RIGHT }}>
                      {tabBody.split("\n\n").map((para, i, arr) => (
                        <p
                          key={i}
                          className="text-body"
                          style={{
                            color: accentVar,
                            lineHeight: 1.5,
                            margin: 0,
                            marginBottom:
                              i === arr.length - 1 ? 0 : "0.75rem",
                          }}
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Meta blocks — only on BRIEF tab */}
              {showMeta && (
                <>
                  {(cs.client || cs.clientLogo) && (
                    <MetaBlock label="CLIENT" accentVar={accentVar} align="center">
                      {cs.clientLogo ? (
                        <img
                          src={cs.clientLogo}
                          alt={cs.client ?? ""}
                          style={{
                            display: "block",
                            margin: "0.5rem auto",
                            maxWidth: "60%",
                            height: "auto",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            display: "block",
                            fontFamily: "var(--font-body)",
                            fontWeight: 700,
                            // Large, centred client name per the design
                            // — the brand name reads as a focal beat
                            // between the brief and the services list.
                            fontSize: "2.5rem",
                            lineHeight: 1.05,
                            letterSpacing: "-0.01em",
                            textAlign: "center",
                            color: accentVar,
                          }}
                        >
                          {cs.client}
                        </span>
                      )}
                    </MetaBlock>
                  )}
                  <MetaBlock
                    label={cs.servicesLabel ?? "SERVICES"}
                    accentVar={accentVar}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "var(--fs-body)",
                        color: accentVar,
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {cs.services}
                    </p>
                  </MetaBlock>
                  {cs.credits.length > 0 && (
                    <MetaBlock label="CREDITS" accentVar={accentVar}>
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
                              color: accentVar,
                              lineHeight: 1.5,
                            }}
                          >
                            {c.role} —{" "}
                            {c.href ? (
                              <a
                                href={c.href}
                                target="_blank"
                                rel="noreferrer"
                                data-no-advance
                                style={{
                                  color: accentVar,
                                  textDecoration: "underline",
                                }}
                              >
                                {c.person}
                              </a>
                            ) : (
                              c.person
                            )}
                          </li>
                        ))}
                      </ul>
                    </MetaBlock>
                  )}

                </>
              )}

            </motion.div>
          </motion.section>
        ) : (
          <motion.div
            key="reel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {/* Reel — endlessly cycling vertical stack of media tiles.
                Each tile manages its own playback (in-view = play) and
                audio toggle; the raf-driven inner translate loops the
                doubled stack seamlessly. */}
            <MobileReel
              items={cs.reel ?? []}
              fit={cs.reelFit ?? "cover"}
              bg={cs.reelBg ?? "var(--ink)"}
              accentVar={accentVar}
              onZoomImage={setZoomedImage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image lightbox — tap a reel image to enlarge, tap again or
          press ESC to close. Rendered at the panel level so it sits
          above all other case-study content. */}
      <AnimatePresence>
        {zoomedImage && (
          <ImageLightbox
            image={zoomedImage}
            onClose={() => setZoomedImage(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Image lightbox ──────────────────────────────────────────────── */

function ImageLightbox({
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
      key="lightbox"
      role="dialog"
      aria-modal="true"
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
        padding: "1rem",
        cursor: "zoom-out",
      }}
    >
      <img
        src={image.src}
        alt={image.alt ?? ""}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          display: "block",
          // Pinch-to-zoom works natively when the image isn't size-
          // capped by transform; the max-width/height let the user
          // double-tap-zoom on iOS Safari.
          touchAction: "manipulation",
        }}
      />
    </motion.div>
  );
}

/* ─── Pieces ─────────────────────────────────────────────────────────── */

/**
 * Down-pointing chevron. Renders pointing down (expand cue) by
 * default; the parent's animated scaleY(-1) flips it to point up
 * (collapse cue) when the info card is open.
 */
function Chevron({ accentVar }: { accentVar: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 8 L11 14 L17 8"
        stroke={accentVar}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      data-no-advance
      onClick={onClick}
      aria-current={active ? "step" : undefined}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.4rem",
        color: accentVar,
      }}
    >
      <span
        style={{
          width: "1.75rem",
          height: "1.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-label)",
          fontWeight: 700,
          backgroundColor: active ? accentVar : "transparent",
          color: active ? "var(--ink)" : accentVar,
          border: `1px solid ${accentVar}`,
          transition:
            "background-color 0.25s cubic-bezier(0.22,1,0.36,1), color 0.25s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {index}
      </span>
      <span
        className="text-label"
        style={{ color: accentVar, opacity: active ? 1 : 0.7 }}
      >
        [ {label} ]
      </span>
    </button>
  );
}

function SidewaysLabel({
  label,
  accentVar,
}: {
  label: string;
  accentVar: string;
}) {
  return (
    <span
      aria-hidden
      style={{
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-label)",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "var(--ink)",
        backgroundColor: accentVar,
        padding: "0.5rem 0.25rem",
        minHeight: "5rem",
      }}
    >
      {label}
    </span>
  );
}

function MetaBlock({
  label,
  accentVar,
  children,
  align = "left",
}: {
  label: string;
  accentVar: string;
  children: ReactNode;
  /** "center" drops the asymmetric indent so content (e.g. the large
   *  client name) centres within the full content width. */
  align?: "left" | "center";
}) {
  return (
    <div
      style={{
        borderTop: `1px solid color-mix(in srgb, ${accentVar} 25%, transparent)`,
        // Generous vertical breathing room between meta sections per
        // the design reference. The tag sits on its own line above
        // the content, with the content set a clear beat below.
        paddingTop: "1.75rem",
        paddingBottom: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <span className="text-label" style={{ color: accentVar }}>
        [ {label} ]
      </span>
      <div
        style={
          align === "center"
            ? undefined
            : {
                // Align with the tab paragraph's body column: indented
                // one chip-column + gap from the left so all body copy
                // shares the same left edge, with a small right inset.
                paddingLeft: BODY_COPY_LEFT,
                paddingRight: BODY_COPY_RIGHT,
              }
        }
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Reel container (endless cycling) ──────────────────────────────── */

function MobileReel({
  items,
  fit,
  bg,
  accentVar,
  onZoomImage,
}: {
  items: ReelItem[];
  fit: "cover" | "contain";
  bg: string;
  accentVar: string;
  onZoomImage?: (img: { src: string; alt?: string }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  // Pause auto-drift while the user is actively dragging or has
  // unmuted a video — same pattern as the desktop reel.
  const interactingRef = useRef(false);
  const audioPausedRef = useRef(false);

  // Auto-drift loop: translate the inner stack upward; wrap on every
  // half-stack to make the seam between the duplicated copies
  // invisible. Speed is computed so each tile takes ~9 s to pass.
  useEffect(() => {
    let raf = 0;
    let lastT = performance.now();
    const tick = (t: number) => {
      const dt = Math.max(0, Math.min(0.1, (t - lastT) / 1000));
      lastT = t;
      const inner = innerRef.current;
      if (inner) {
        const halfStack = inner.scrollHeight / 2;
        if (halfStack > 0) {
          if (!interactingRef.current && !audioPausedRef.current) {
            const pxPerSec = halfStack / (Math.max(1, items.length) * 9);
            offsetRef.current -= pxPerSec * dt;
          }
          // Keep offset in [-halfStack, 0] so the doubled stack
          // always covers the viewport.
          if (offsetRef.current <= -halfStack) {
            offsetRef.current += halfStack;
          } else if (offsetRef.current > 0) {
            offsetRef.current -= halfStack;
          }
          inner.style.transform = `translate3d(0, ${offsetRef.current}px, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items.length]);

  // Wheel scrub (non-passive so preventDefault sticks and the
  // case-study tray's own scroll doesn't steal the gesture).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      offsetRef.current -= e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Touch scrub. Pauses auto-drift while the user is touching.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastY = 0;
    let active = false;
    const start = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? 0;
      active = true;
      interactingRef.current = true;
    };
    const move = (e: TouchEvent) => {
      if (!active) return;
      const y = e.touches[0]?.clientY ?? 0;
      const dy = y - lastY;
      offsetRef.current += dy;
      lastY = y;
      // Prevent the case-study tray from also scrolling while we're
      // scrubbing the reel.
      e.preventDefault();
    };
    const end = () => {
      active = false;
      interactingRef.current = false;
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

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      data-reel-scroll
      style={{
        position: "relative",
        width: "100%",
        // Reel viewport — leaves the bottom footer chrome visible.
        // The doubled stack scrolls infinitely within this window.
        height: "calc(100dvh - var(--m-foot-h))",
        backgroundColor: bg,
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          willChange: "transform",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <MobileReelTile
            key={i}
            item={item}
            fit={fit}
            bg={bg}
            accentVar={accentVar}
            isFirst={i === 0}
            onAudioChange={(unmuted) => {
              audioPausedRef.current = unmuted;
            }}
            onZoomImage={onZoomImage}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Reel tile (mobile, active-when-visible + audio toggle) ─────────── */

function MobileReelTile({
  item,
  fit,
  bg,
  accentVar,
  isFirst,
  onAudioChange,
  onZoomImage,
}: {
  item: ReelItem;
  fit: "cover" | "contain";
  bg: string;
  accentVar: string;
  isFirst: boolean;
  /** Reports up when this tile's audio is toggled on/off so the parent
   *  reel can pause its auto-drift while the user is listening. */
  onAudioChange?: (unmuted: boolean) => void;
  /** Tap-to-zoom on image tiles → opens a fullscreen lightbox. */
  onZoomImage?: (img: { src: string; alt?: string }) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  // Hide the "click to play audio" hint once the user toggles audio
  // for the first time on this tile.
  const [hasToggled, setHasToggled] = useState(false);

  // Visibility detection — when ≥ 50% of the tile is in the scroll
  // container's viewport, mark it active. Plays / pauses the
  // underlying <video> accordingly.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        setVisible(e.intersectionRatio >= 0.5);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (visible) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [visible]);

  // Mute follows `muted` state — important so the user's tap-to-unmute
  // doesn't fight with the default `muted` attribute.
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted]);

  const toggleAudio = () => {
    setMuted((m) => {
      const nextMuted = !m;
      // `!nextMuted` = whether audio is now playing. Notify the reel
      // so it can pause auto-drift while the user is listening.
      onAudioChange?.(!nextMuted);
      return nextMuted;
    });
    setHasToggled(true);
  };

  // Tile sizing:
  //  - "cover" projects (Bloomberg, Liquid, Revolutionary): every
  //    tile is 16:9; cover-fit fills the frame, cropping where
  //    needed. Tile heights are uniform.
  //  - "contain" projects (TUESGAY, Paintings): each tile sizes to
  //    its asset's natural aspect at full viewport width — flyers and
  //    paintings show full-bleed without letterboxing, since cropping
  //    those compositions ruins them.
  const isContain = fit === "contain";
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        // For "cover" projects keep the uniform 16:9 box; for
        // "contain" projects let the asset's natural height drive
        // the tile.
        aspectRatio: isContain ? undefined : "16 / 9",
        backgroundColor: bg,
        position: "relative",
        overflow: "hidden",
        borderTop: isFirst
          ? "1px solid color-mix(in srgb, var(--fg) 18%, transparent)"
          : "none",
        borderBottom:
          "1px solid color-mix(in srgb, var(--fg) 18%, transparent)",
      }}
    >
      {item.kind === "video" ? (
        <>
          <video
            ref={videoRef}
            src={item.src}
            poster={item.poster}
            // `autoPlay` + `muted` attributes are the initial state;
            // the effect above is what actually drives play/pause once
            // visibility kicks in (some browsers block autoplay until
            // a user gesture, so we re-call .play() defensively).
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              // For "contain" projects the tile's height comes from
              // the video's natural aspect at full width — no
              // cropping. For "cover" projects we fill the 16:9 box.
              height: isContain ? "auto" : "100%",
              objectFit: isContain ? "contain" : fit,
              display: "block",
            }}
          />
          {item.hasAudio !== false && (
            <button
              type="button"
              data-no-advance
              onClick={toggleAudio}
              aria-pressed={!muted}
              aria-label={muted ? "Play audio" : "Mute audio"}
              style={{
                // Plain text overlay (no box / blur). mix-blend-mode
                // difference makes white text render as the inverse
                // of whatever video frame sits behind it, so the
                // affordance stays legible regardless of the clip's
                // colour mix at any given moment.
                position: "absolute",
                left: "1rem",
                bottom: "1rem",
                background: "none",
                border: "none",
                padding: 0,
                color: "#ffffff",
                mixBlendMode: "difference",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--fs-sm)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                cursor: "pointer",
                opacity: hasToggled && !muted ? 0.65 : 1,
                transition: "opacity 0.25s ease",
              }}
            >
              [ {muted ? "Click to play audio" : "Click to mute"} ]
            </button>
          )}
        </>
      ) : item.kind === "image" ? (
        <img
          src={item.src}
          alt={item.alt}
          onClick={() =>
            onZoomImage?.({ src: item.src, alt: item.alt })
          }
          style={{
            width: "100%",
            height: isContain ? "auto" : "100%",
            objectFit: isContain ? "contain" : fit,
            display: "block",
            cursor: onZoomImage ? "zoom-in" : "default",
          }}
        />
      ) : (
        // YouTube: only mount the iframe when the tile is visible, so
        // we don't burn bandwidth pre-loading every embed on mount.
        visible ? (
          <iframe
            src={`https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1&loop=1&controls=0&playlist=${item.id}`}
            title={item.title ?? ""}
            allow="autoplay; encrypted-media"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
          />
        ) : (
          <img
            src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
            alt={item.title ?? ""}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )
      )}
    </div>
  );
}
