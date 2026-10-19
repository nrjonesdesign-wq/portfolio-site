"use client";

import { useEffect, useState } from "react";
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
