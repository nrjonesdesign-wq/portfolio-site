"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NRJPlanet from "@/components/nav/NRJPlanet";
import styles from "./approach.module.css";

const LAVENDER = "#c4b6f2";

/**
 * Tints html/body (and the iOS status-bar theme colour) lavender while the
 * Approach page is mounted, so overscroll and safe-area bands match the page
 * instead of showing the home page's runtime --bg. Restores on unmount.
 */
export function ApproachTint() {
  useEffect(() => {
    const root = document.documentElement;
    const prevBg = root.style.getPropertyValue("--bg");
    const prevFg = root.style.getPropertyValue("--fg");
    root.style.setProperty("--bg", LAVENDER);
    root.style.setProperty("--fg", "#151515");
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prevTheme = meta?.content;
    if (meta) meta.content = LAVENDER;
    return () => {
      root.style.setProperty("--bg", prevBg);
      root.style.setProperty("--fg", prevFg);
      if (meta && prevTheme) meta.content = prevTheme;
    };
  }, []);
  return null;
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
