"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useColorScheme } from "@/lib/scroll";
import type { Section } from "@/lib/colors";
import MobileChrome from "./MobileChrome";
import MobileMenuOverlay, { type ChromeSection } from "./MobileMenuOverlay";
import MobileLoadingSection from "./sections/MobileLoadingSection";
import {
  MobileHelloPanel,
  MobileNamePanel,
  MobileEngagementsPanel,
} from "./sections/MobileWhoSection";
import MobileWorkSection from "./sections/MobileWorkSection";
import MobileCaseStudyPanel from "./sections/MobileCaseStudyPanel";
import MobileApproachSection from "./sections/MobileApproachSection";
import MobileContactSection from "./sections/MobileContactSection";
import {
  ALL_PROJECTS,
  itemNumberForSlug,
  slugForItemNumber,
} from "@/content/projects";

/** Homepage panel ids that work as inbound `/#<id>` deep links. */
const SECTION_HASHES = ["who", "who-bio", "work", "approach", "contact"] as const;

/**
 * Mobile entry. Stacks the snap panels vertically with native scroll —
 * no fancy wheel locking; touch devices want to feel like normal pages.
 *
 * This first slice only renders Loading → Hello → Name. Work and
 * Contact land in later turns; for now they're placeholder panels so
 * the page has somewhere to land if the user keeps scrolling past Name.
 */
export default function MobileHome() {
  const [loadingInverted, setLoadingInverted] = useState(false);
  const [activeSection, setActiveSection] = useState<"loading" | Section>(
    "loading",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  // Static geometry: panels are 100lvh and anchors 100svh − nav — never
  // dvh. iOS Safari's toolbar collapses/expands as you scroll; with dvh
  // every panel (and so every stop below) moved mid-swipe, Safari
  // re-snapped to whatever was nearest, and swipes Work → Approach
  // bounced back to Work or overshot to Contact.
  // Snap anchors. Each panel is 100lvh tall, but the snapport is
  // the viewport minus the nav (scroll-padding-top), so a panel "covers" the
  // snapport and the browser accepts any stop within a 72px band —
  // swipes settled inconsistently (sometimes tucked under the nav).
  // Instead, panels don't snap themselves; an invisible anchor per panel,
  // exactly snapport-tall, gives one deterministic stop: panel top just
  // below the nav (where menu jumps / deep links land too).
  // A panel taller than the screen (Work, once its list outgrows one
  // screen) gets an anchor as tall as the panel instead: a snap area
  // larger than the snapport lets the page rest anywhere inside it, so
  // the user scrolls through the panel natively and snaps only at its
  // top and on to the next panel. `height: null` = the standard anchor.
  const [anchors, setAnchors] = useState<{ top: number; height: number | null }[]>([]);
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const panels = Array.from(main.querySelectorAll<HTMLElement>(":scope > section, :scope > * > section")).filter((el) => el.classList.contains("snap"));
    const prev = panels.map((el) => el.style.scrollSnapAlign);
    panels.forEach((el) => { el.style.scrollSnapAlign = "none"; });
    // Tall = taller than a standard panel (100lvh). Measured against a
    // probe, not innerHeight, which changes as Safari's toolbar resizes.
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;height:100lvh;width:0;top:0";
    document.body.appendChild(probe);
    let last = "";
    const measure = () => {
      const mainTop = main.getBoundingClientRect().top;
      const lvh = probe.offsetHeight;
      const next = panels.map((el) => {
        const h = el.offsetHeight;
        return {
          top: Math.round(el.getBoundingClientRect().top - mainTop),
          height: h > lvh + 1 ? h : null,
        };
      });
      // Only re-render when the stops actually moved: re-setting equal
      // anchors still makes Safari re-evaluate (and re-snap) the page.
      const key = JSON.stringify(next);
      if (key === last) return;
      last = key;
      setAnchors(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(main);
    panels.forEach((el) => ro.observe(el));
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      probe.remove();
      window.removeEventListener("resize", measure);
      panels.forEach((el, i) => { el.style.scrollSnapAlign = prev[i]; });
    };
  }, []);

  // Scroll lock while the menu is open lives on the overlay itself
  // (touch-action: none + overscroll-behavior: contain) — no overflow
  // toggling on <html>, which can make iOS Safari jump the page.
  // Which accent the Work section is wearing. Defaults to sky (HIRED
  // group). Flips to mint when an INSPIRED row is open, so the bg/fg
  // tokens repaint mint-on-ink across nav + footer too.
  const [workAccent, setWorkAccent] = useState<"sky" | "mint">("sky");
  // Which Work accordion row is open. Lifted here so we can reset it
  // every time the user navigates away from the WORK section — the
  // user expects to always land on a closed accordion.
  const [workOpenSlug, setWorkOpenSlug] = useState<string | null>(null);
  // Destination scheme forced during a menu jump (see handleMenuSelect).
  const [jumpScheme, setJumpScheme] = useState<Section | null>(null);
  // Brief solid edge strips after the case-study tray closes (see render).
  const [edgeHandoff, setEdgeHandoff] = useState(false);
  const edgeTimer = useRef<number | null>(null);
  // Bumped to force a remount when strips are already showing, so Safari
  // always sees a freshly appeared layer.
  const [edgeNonce, setEdgeNonce] = useState(0);
  const handOffEdges = (ms = 1200, fresh = false) => {
    if (fresh) setEdgeNonce((n) => n + 1);
    setEdgeHandoff(true);
    if (edgeTimer.current) window.clearTimeout(edgeTimer.current);
    edgeTimer.current = window.setTimeout(() => setEdgeHandoff(false), ms);
  };
  // Deep-link entry: resolve the inbound `/#<slug>` hash to a case-study
  // item number once at first render (null for no / unknown hash).
  const [deepLinkItemNumber] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const slug = window.location.hash.replace(/^#/, "");
    return slug ? itemNumberForSlug(slug) : null;
  });
  // Section deep-link: `/#who`, `/#who-bio`, `/#work`, `/#approach` or
  // `/#contact` (e.g. from the /approach page menu) lands on that panel,
  // skipping the loading intro. Read once before URL sync strips the hash.
  const [deepLinkSection] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const id = window.location.hash.replace(/^#/, "");
    return (SECTION_HASHES as readonly string[]).includes(id) ? id : null;
  });
  // Open case-study item number (e.g. "01"). Null = no tray. Seeded from
  // the deep-link so an inbound hash opens straight into the tray.
  const [caseStudyItemNumber, setCaseStudyItemNumber] = useState<
    string | null
  >(deepLinkItemNumber);

  const caseStudyMatch = caseStudyItemNumber
    ? (() => {
        for (const p of ALL_PROJECTS) {
          const it = p.items.find((i) => i.number === caseStudyItemNumber);
          if (it) return { project: p, item: it };
        }
        return null;
      })()
    : null;

  // Note: mobile intentionally skips the desktop's "pre-invert to
  // dark after 2.4s" behaviour. On phone, the user expects the sage
  // loading screen to stay sage until they scroll into WHO — the
  // colour swap then plays as part of that scroll transition rather
  // than blooming on its own while the user is still reading the
  // planet. (loadingInverted stays false on mobile.)

  // Reset the Work accordion every time the user enters Work from
  // elsewhere on the page — they always land on a closed accordion.
  // The reset does NOT fire when the case-study tray closes and the
  // user returns to Work (because activeSection stayed hired/inspired
  // the whole time the tray was open), so the previously-opened
  // project drawer is preserved in that case.
  const wasOnWorkRef = useRef(false);
  useEffect(() => {
    const isWork =
      activeSection === "hired" || activeSection === "inspired";
    if (!isWork) {
      setWorkOpenSlug(null);
      wasOnWorkRef.current = false;
      return;
    }
    if (!wasOnWorkRef.current) {
      setWorkOpenSlug(null);
      wasOnWorkRef.current = true;
    }
  }, [activeSection]);

  // WORK is not its own scroller. It grows to fit its project list and
  // the document scrolls through it; a panel taller than the screen gets
  // a panel-tall snap anchor (see the anchors effect above), so native
  // scrolling moves freely inside Work and snaps at its top.
  //
  // Leaving Work downward needed help: from the bottom of that tall snap
  // area, a normal swipe ends nearer Work's own last position than
  // Approach's stop, so mandatory snap pulled the page back and only a
  // hard flick got through. Work now ends in a run-out of empty space
  // (MobileWorkSection's WORK_RUNOUT); when a downward scroll comes to
  // rest with the end of the list well above the footer — i.e. in that
  // run-out — the page glides on to Approach. Downward only, and only
  // once the page has scrolled past Work's own stop, so arriving at Work
  // or swiping back up from Approach never triggers it.
  useEffect(() => {
    let lastY = window.scrollY;
    let dir = 0;
    let settle = 0;
    let busyUntil = 0;
    // Only a finger-driven downward swipe counts: layout changes (opening
    // a case study collapses/moves the list, toolbar resizes) also fire
    // scroll events, and once jumped the page to Approach behind the
    // open case study (then on to Contact on close).
    let touchEndAt = 0;
    let touchStartY = 0;
    let swipeDown = false;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const y = e.changedTouches[0]?.clientY ?? touchStartY;
      swipeDown = touchStartY - y > 12; // finger moved up = page scrolls down
      touchEndAt = Date.now();
    };
    const check = () => {
      if (dir <= 0 || Date.now() < busyUntil) return;
      // Within the swipe's momentum (≈2.5s after lift-off), never while a
      // case study or the menu covers the page.
      if (!swipeDown || Date.now() - touchEndAt > 2500) return;
      if (document.querySelector("[data-case-study-tray]")) return;
      const work = document.getElementById("work");
      const end = document.querySelector<HTMLElement>("[data-work-end]");
      const approach = document.getElementById("approach");
      if (!work || !end || !approach) return;
      const cs = getComputedStyle(document.documentElement);
      const navH = parseFloat(cs.scrollPaddingTop) || 72;
      const rem = parseFloat(cs.fontSize) || 16;
      const footH = 3 * rem;
      const pastWorkStop = work.getBoundingClientRect().top < navH - 8;
      // At least ~12% of the screen into the run-out: the list's last
      // row has cleared the footer with open space showing beneath it.
      const inRunout =
        end.getBoundingClientRect().top <
        window.innerHeight - footH - window.innerHeight * 0.12;
      const approachTop = approach.getBoundingClientRect().top;
      if (pastWorkStop && inRunout && approachTop > navH + 4) {
        busyUntil = Date.now() + 1800;
        jumpTo("approach", true);
      }
    };
    const onScroll = () => {
      const y = window.scrollY;
      if (y !== lastY) dir = y > lastY ? 1 : -1;
      lastY = y;
      window.clearTimeout(settle);
      settle = window.setTimeout(check, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.clearTimeout(settle);
    };
  }, []);

  // Snap each mobile section to its own viewport stop. The shared
  // .snapping rule in globals.css applies scroll-snap-type: y mandatory
  // to <html>; each section already has scroll-snap-align: start via
  // the .snap class, so adding the class wires the chain up.
  useEffect(() => {
    document.documentElement.classList.add("snapping");
    // body's global `overflow-x: hidden` makes <body> a scroll container
    // (overflow-y computes to auto), so the .snap sections would snap to
    // body — which never scrolls — instead of the document. `clip` hides
    // horizontal overflow without creating a scroll container.
    const prevOverflowX = document.body.style.overflowX;
    document.body.style.overflowX = "clip";
    // Phones: section colours CUT instead of fading. iOS Safari 26 tints
    // its status bar + toolbar from what's at the screen edges at the
    // moment the colour changes; with the 1.4s fade it caught the OLD
    // colour (mint bars left over after closing an INSPIRED row on sky
    // Work) and kept it. html/body already cut; this brings the panels
    // and the nav/footer glass tint into the same frame. Injected here,
    // not in globals.css: Tailwind v4's pipeline dropped the rule there.
    const cut = document.createElement("style");
    cut.textContent =
      ".snap, [data-chrome-tint] { transition: none !important; }";
    document.head.appendChild(cut);
    return () => {
      cut.remove();
      document.documentElement.classList.remove("snapping");
      document.body.style.overflowX = prevOverflowX;
    };
  }, []);

  // Loading → Hello transition, identical timeline to desktop:
  //   t=0     .spin-boost → planet body + electron whip around
  //   t=600   .warping    → stars streak vertically (~1.6s)
  //   t=1100  scrollIntoView('#who') — page slides under the warp
  //   t=1700  remove .spin-boost (planet has docked off-screen)
  //   t=2400  remove .warping
  // Used by the auto-advance timer below AND by the planet tap on
  // MobileLoadingSection.
  const triggerLoadingTransition = useCallback(() => {
    const html = document.documentElement;
    if (html.classList.contains("warping")) return;
    html.classList.add("spin-boost");
    const t1 = window.setTimeout(() => {
      html.classList.add("warping");
    }, 600);
    const t2 = window.setTimeout(() => {
      jumpTo("who", true);
    }, 1100);
    const t3 = window.setTimeout(() => {
      html.classList.remove("spin-boost");
    }, 1700);
    const t4 = window.setTimeout(() => {
      html.classList.remove("warping");
    }, 2400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, []);

  // Loading auto-advance — fires the same transition after 5s on the
  // loading panel so users who never tap the planet still land in WHO.
  useEffect(() => {
    if (activeSection !== "loading") return;
    const t = window.setTimeout(() => {
      triggerLoadingTransition();
    }, 5000);
    return () => window.clearTimeout(t);
  }, [activeSection, triggerLoadingTransition]);

  // Deep-link entry: on mount, if the inbound hash resolved to a case
  // study, jump straight to Work (bypassing the loading intro). The tray
  // is already open from the seeded caseStudyItemNumber.
  useEffect(() => {
    if (deepLinkSection) {
      jumpTo(deepLinkSection);
      return;
    }
    if (!deepLinkItemNumber) return;
    jumpTo("work");
    // Runs once on mount for the inbound hash only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live URL sync: mirror the open case study into the address bar so the
  // URL is always a shareable deep-link. Open → `/#<slug>`; close → bare
  // path. replaceState keeps the back button clean.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const base = window.location.pathname + window.location.search;
    const slug = caseStudyItemNumber
      ? slugForItemNumber(caseStudyItemNumber)
      : null;
    window.history.replaceState(null, "", slug ? `${base}#${slug}` : base);
  }, [caseStudyItemNumber]);

  // Drive the color scheme via the same useColorScheme helper desktop
  // uses. While on Loading: pre-invert flips loading ↔ who. After
  // loading: the section's own scheme drives the page tokens.
  const colorScheme: Section = jumpScheme ??
    (activeSection === "loading"
      ? loadingInverted
        ? "who"
        : "loading"
      : activeSection === "hired"
        ? workAccent === "mint"
          ? "inspired"
          : "hired"
        : (activeSection as Section));
  useColorScheme(colorScheme);
  // Flash the visible edge strips on every colour change. iOS Safari 26
  // re-tints its bars only when a solid fixed layer appears at the screen
  // edges; hidden (behind-the-page) strips didn't do it — the user's
  // test still showed stale bars. The strips are the page colour and sit
  // under the nav/footer glass, so the flash only briefly hides whatever
  // content is beneath the chrome. Skipped on first paint.
  const firstScheme = useRef(true);
  useEffect(() => {
    if (firstScheme.current) {
      firstScheme.current = false;
      return;
    }
    handOffEdges(700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorScheme]);

  // Section detection via IntersectionObserver against the viewport
  // (the document is the scroll container).
  useEffect(() => {
    const ids = [
      "loading",
      "who",
      "who-bio",
      "who-engagements",
      "work",
      "approach",
      "contact",
    ];
    const sectionForId = (id: string): "loading" | Section => {
      if (id === "loading") return "loading";
      if (id === "who" || id === "who-bio" || id === "who-engagements") return "who";
      if (id === "work") return "hired";
      if (id === "approach") return "approach";
      if (id === "contact") return "contact";
      return "loading";
    };
    // Ratio = share of the VIEWPORT a section covers, not share of the
    // section that's visible: Work can be taller than the screen, and a
    // section-relative ratio would never pass 0.5 for it. Fine thresholds
    // so a tall section still reports often enough.
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { id: string; ratio: number } | null = null;
        for (const e of entries) {
          const rootH = e.rootBounds?.height || window.innerHeight;
          const ratio = e.intersectionRect.height / rootH;
          if (!best || ratio > best.ratio) {
            best = { id: e.target.id, ratio };
          }
        }
        if (best && best.ratio > 0.5) {
          setActiveSection(sectionForId(best.id));
        }
      },
      { threshold: thresholds },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const chromeVisible = activeSection !== "loading";
  const chromeSection: ChromeSection =
    activeSection === "loading" || activeSection === "who" || activeSection === "name"
      ? "who"
      : activeSection === "hired" || activeSection === "inspired"
        ? "work"
        : activeSection === "approach"
          ? "approach"
          : "contact";

  const handleMenuSelect = (section: ChromeSection) => {
    setMenuOpen(false);
    // [WHO] lands on the Name panel (#who-bio) — Hello is a brief
    // splash but Name is the canonical WHO screen with the bio +
    // engagements. Mirrors desktop nav.
    const id = section === "who" ? "who-bio" : section;
    // iOS Safari tints its status bar + bottom toolbar by sampling the
    // fixed chrome at the screen edges, and only re-samples on scroll.
    // A smooth scroll through Work, with the chrome backdrop still mid
    // 1.4s colour fade when the scroll ends, left the bars stuck on the
    // previous section's colour. So a menu jump:
    //   1. switches to the destination scheme immediately, with CSS
    //      colour transitions off (html.color-jump),
    //   2. waits two frames so the final colours are painted,
    //   3. jumps instantly (the fading overlay hides the cut), so the
    //      scroll Safari samples on already shows the final colours,
    //   4. hands control back to the scroll-driven scheme.
    const target: Section =
      section === "who" ? "who" : section === "work" ? "hired" : section;
    const root = document.documentElement;
    root.classList.add("color-jump");
    setJumpScheme(target);
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        jumpTo(id);
        window.setTimeout(() => {
          root.classList.remove("color-jump");
          setJumpScheme(null);
        }, 400);
      }),
    );
  };

  return (
    <main
      style={
        {
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
          // Larger body copy on phones — 16px vs the 14px desktop value.
          // Set as an inline custom property on the mobile root (rather
          // than a media-query override in globals.css, which Tailwind v4
          // / Turbopack was dropping): it cascades to every .text-body /
          // var(--fs-body) consumer in the mobile tree and can't be
          // out-specified or stripped.
          ["--fs-body" as string]: "1rem",
          // The DOCUMENT is the scroller (not <main>): iOS Safari tints its
          // status bar / toolbar from the page and re-samples on document
          // scrolls only, so an inner scroller left the bars on stale
          // section colours. Snap comes from the mobile @media rule on
          // <html> (scroll-snap-type: y mandatory + scroll-padding-top).
          minHeight: "100lvh",
          position: "relative",
        } as React.CSSProperties
      }
    >
      {anchors.map(({ top, height }, i) => (
        <div
          key={`snap-${i}`}
          aria-hidden
          style={{
            position: "absolute",
            top,
            left: 0,
            width: 1,
            // svh (toolbar shown = smallest viewport): never taller than
            // the snapport, whatever the toolbar is doing.
            height: height ?? "calc(100svh - var(--m-nav-h))",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
            pointerEvents: "none",
          }}
        />
      ))}
      <MobileChrome
        activeSection={chromeSection}
        visible={chromeVisible}
        onOpenMenu={() => setMenuOpen(true)}
        onHome={() => jumpTo("loading")}
      >
        <MobileLoadingSection
          inverted={loadingInverted}
          onAdvance={triggerLoadingTransition}
        />
        <MobileHelloPanel />
        <MobileNamePanel />
        <MobileEngagementsPanel />
        <MobileWorkSection
          openSlug={workOpenSlug}
          onOpenSlugChange={setWorkOpenSlug}
          onAccentChange={setWorkAccent}
          onOpenCaseStudy={setCaseStudyItemNumber}
        />
        <MobileApproachSection />
        <MobileContactSection />
      </MobileChrome>

      <MobileMenuOverlay
        open={menuOpen}
        activeSection={chromeSection}
        onSelect={handleMenuSelect}
        onClose={() => setMenuOpen(false)}
      />

      {/* Case-study tray. AnimatePresence handles enter/exit slide;
          the panel itself is responsible for its own scrolling. */}
      {/* Edge handoff runs when the tray has fully slid away
          (onExitComplete), not on close: strips mounted while the ink
          tray still covered the edges were never seen by Safari, so the
          bars stayed ink after leaving a case study. */}
      <AnimatePresence onExitComplete={() => handOffEdges(1000, true)}>
        {caseStudyMatch && (
          <MobileCaseStudyPanel
            project={caseStudyMatch.project}
            item={caseStudyMatch.item}
            onClose={() => {
              setCaseStudyItemNumber(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Edge handoff after the case-study tray closes. The tray is a
          solid ink, fixed, full-screen layer, and iOS Safari 26 tints
          its status bar + toolbar from a solid fixed element touching
          the screen edge — so while it's open the bars go ink, and once
          it slid away nothing solid replaced it, leaving the bars ink
          (stale) over the sky/mint page and every section scrolled to
          after. For a moment after closing, solid strips in the page
          colour sit at both edges under the nav/footer (hidden under the
          tray as it slides out), giving Safari a fresh solid edge in the
          right colour to sample; then they're removed. */}
      {edgeHandoff && (
        <>
          {/* Keyed on the scheme: a colour change mid-flash remounts
              them, so Safari sees a fresh layer, not a recoloured one. */}
          <div key={`edge-top-${colorScheme}-${edgeNonce}`} aria-hidden style={edgeStrip("top")} />
          <div key={`edge-bottom-${colorScheme}-${edgeNonce}`} aria-hidden style={edgeStrip("bottom")} />
        </>
      )}
    </main>
  );
}

/** Solid fixed strip at the top or bottom screen edge, in the page
 *  colour, under the chrome (z 60) and the tray (z 70). 88px: iOS Safari
 *  ignored much shorter or taller strips in /tint-test. */
function edgeStrip(edge: "top" | "bottom"): React.CSSProperties {
  return {
    position: "fixed",
    left: 0,
    right: 0,
    [edge]: 0,
    height: 88,
    backgroundColor: "var(--bg)",
    zIndex: 55,
    pointerEvents: "none",
  };
}

/**
 * Programmatic jump to a panel with scroll-snap suspended. With the
 * document as a mandatory-snap scroller, iOS Safari re-snaps to the panel
 * it was last snapped to whenever the viewport resizes — and a jump makes
 * the toolbar expand/collapse — so jumps bounced straight back (planet
 * tap → loading flashed, then back to Approach; menu → Contact stayed on
 * Approach). Snap is switched off for the scroll and restored once it has
 * settled, at which point the page already sits on the new panel's snap
 * position, so restoring snaps in place.
 */
function jumpTo(id: string, smooth = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const html = document.documentElement;
  html.style.scrollSnapType = "none";
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  // Restore on a timer rather than scrollend: an instant jump "ends"
  // immediately, but Safari's toolbar resize (which triggers the re-snap)
  // animates in over the next ~300ms.
  window.setTimeout(() => {
    html.style.scrollSnapType = "";
    // Safety net: if re-enabling snap still pulled the page back to the
    // previous panel, jump once more (snap off) and leave it settled.
    window.setTimeout(() => {
      const navH = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
      const off = Math.abs(el.getBoundingClientRect().top - navH);
      if (off > 4 && id !== "loading") {
        html.style.scrollSnapType = "none";
        el.scrollIntoView({ behavior: "auto", block: "start" });
        window.setTimeout(() => {
          html.style.scrollSnapType = "";
        }, 600);
      }
    }, 250);
  }, smooth ? 1500 : 600);
}
