"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NRJPlanet from "@/components/nav/NRJPlanet";
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
 * Nav planet mark — the same live NRJPlanet (canvas orbit + wordmark) the
 * home page docks in its nav, at the same 113px box, with the same
 * scroll-linked rotation and hover swell. The box overhangs a 44px slot
 * (the visible circle is 39% of the box) so the comet rings extend past
 * the row without pushing the nav taller. Links back to the home page.
 */
export function NavPlanet() {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setRotation(max > 0 ? (window.scrollY / max) * 360 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      <span className={styles.planetBox}>
        <span style={{ display: "block", width: "100%", height: "100%", transform: `rotate(${rotation}deg)` }}>
          <NRJPlanet />
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
