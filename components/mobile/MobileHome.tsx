"use client";

import { useEffect, useRef, useState } from "react";
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
import MobileContactSection from "./sections/MobileContactSection";
import { ALL_PROJECTS } from "@/content/projects";

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
  // Which accent the Work section is wearing. Defaults to sky (HIRED
  // group). Flips to mint when an INSPIRED row is open, so the bg/fg
  // tokens repaint mint-on-ink across nav + footer too.
  const [workAccent, setWorkAccent] = useState<"sky" | "mint">("sky");
  // Which Work accordion row is open. Lifted here so we can reset it
  // every time the user navigates away from the WORK section — the
  // user expects to always land on a closed accordion.
  const [workOpenSlug, setWorkOpenSlug] = useState<string | null>(null);
  // Open case-study item number (e.g. "01"). Null = no tray.
  const [caseStudyItemNumber, setCaseStudyItemNumber] = useState<
    string | null
  >(null);

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

  // No in-Work wheel/touch handlers any more — the WORK section is
  // its own scroll container (overflow-y: auto), so the user scrolls
  // freely within it via native gestures. Reaching the top / bottom
  // chains back to <main>'s scroll-snap to step into Name / Contact.
  // Project drawers expand on tap; multi-item drawers scroll within
  // the section without any custom JS.

  // Snap each mobile section to its own viewport stop. The shared
  // .snapping rule in globals.css applies scroll-snap-type: y mandatory
  // to <html>; each section already has scroll-snap-align: start via
  // the .snap class, so adding the class wires the chain up.
  useEffect(() => {
    document.documentElement.classList.add("snapping");
    return () => {
      document.documentElement.classList.remove("snapping");
    };
  }, []);

  // Drive the color scheme via the same useColorScheme helper desktop
  // uses. While on Loading: pre-invert flips loading ↔ who. After
  // loading: the section's own scheme drives the page tokens.
  const colorScheme: Section =
    activeSection === "loading"
      ? loadingInverted
        ? "who"
        : "loading"
      : activeSection === "hired"
        ? workAccent === "mint"
          ? "inspired"
          : "hired"
        : (activeSection as Section);
  useColorScheme(colorScheme);

  // Section detection via IntersectionObserver. Uses `<main>` as the
  // observation root since it's the scroll container now — without
  // this, the observer fires against the document viewport and every
  // section reports as "in view" once.
  useEffect(() => {
    const root = document.querySelector("main");
    if (!root) return;
    const ids = [
      "loading",
      "who",
      "who-bio",
      "who-engagements",
      "work",
      "contact",
    ];
    const sectionForId = (id: string): "loading" | Section => {
      if (id === "loading") return "loading";
      if (id === "who" || id === "who-bio" || id === "who-engagements") return "who";
      if (id === "work") return "hired";
      if (id === "contact") return "contact";
      return "loading";
    };
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { id: string; ratio: number } | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.ratio) {
            best = { id: e.target.id, ratio: e.intersectionRatio };
          }
        }
        if (best && best.ratio > 0.5) {
          setActiveSection(sectionForId(best.id));
        }
      },
      { root, threshold: [0.25, 0.5, 0.75] },
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
        : "contact";

  const handleMenuSelect = (section: ChromeSection) => {
    setMenuOpen(false);
    // Smooth-scroll into the chosen section once the overlay starts
    // fading out so the user perceives a single coordinated transition.
    // [WHO] lands on the Name panel (#who-bio) — Hello is a brief
    // splash but Name is the canonical WHO screen with the bio +
    // engagements. Mirrors desktop nav.
    const id =
      section === "who" ? "who-bio" : section === "work" ? "work" : "contact";
    window.requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
          // Make <main> the dedicated scroll container with explicit
          // scroll-snap-type. The @media rule on <html> works in real
          // mobile browsers, but Chrome DevTools' "responsive" mode is
          // inconsistent about engaging snap-on-html — putting it on a
          // fixed-height element gives it a single, unambiguous target.
          height: "100dvh",
          overflowY: "auto",
          overflowX: "hidden",
          // Mandatory snap so the user always lands on a section,
          // never mid-scroll. Works cleanly because each panel
          // (Name, Engagements) is locked to 100dvh.
          scrollSnapType: "y mandatory",
          scrollPaddingTop: "var(--m-nav-h)",
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties
      }
    >
      <MobileChrome
        activeSection={chromeSection}
        visible={chromeVisible}
        onOpenMenu={() => setMenuOpen(true)}
      >
        <MobileLoadingSection inverted={loadingInverted} />
        <MobileHelloPanel />
        <MobileNamePanel />
        <MobileEngagementsPanel />
        <MobileWorkSection
          openSlug={workOpenSlug}
          onOpenSlugChange={setWorkOpenSlug}
          onAccentChange={setWorkAccent}
          onOpenCaseStudy={setCaseStudyItemNumber}
        />
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
      <AnimatePresence>
        {caseStudyMatch && (
          <MobileCaseStudyPanel
            project={caseStudyMatch.project}
            item={caseStudyMatch.item}
            onClose={() => setCaseStudyItemNumber(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
