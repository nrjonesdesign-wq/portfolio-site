"use client";

import { useEffect, useRef } from "react";
import { SECTION_COLORS, type Section } from "./colors";

export function useColorScheme(section: Section) {
  useEffect(() => {
    const { bg, fg, accent } = SECTION_COLORS[section];
    const root = document.documentElement;
    root.style.setProperty("--bg", bg);
    root.style.setProperty("--fg", fg);
    root.style.setProperty("--accent", accent);
    // Also set the bg directly on html AND body so iOS Safari safe-area
    // regions (visible with viewport-fit: cover) pick up the new colour
    // reliably. body sits above html and covers the safe-area zones, so
    // if body's CSS-var-driven bg lags the scheme swap, the safe area
    // shows the stale colour even though html is already updated.
    root.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;

    // Drive iOS Safari's status-bar + bottom-chrome tint to match the
    // current section bg. iOS Safari often caches the initial
    // theme-color and ignores `meta.content = ...` updates, so REMOVE
    // the existing meta and re-append a fresh one — that forces
    // re-evaluation.
    const old = document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    old.forEach((m) => m.remove());
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = bg;
    document.head.appendChild(meta);
  }, [section]);
}

/**
 * Calls onEnter every time the observed element becomes intersecting (not
 * once-only). Used to drive the active-section + colour scheme as the user
 * scrolls in either direction, so reversing back up to a previous section
 * restores its colour scheme cleanly.
 */
export function useSectionEntry(
  ref: React.RefObject<HTMLElement | null>,
  onEnter: () => void,
  threshold = 0.3
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onEnter();
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, onEnter, threshold]);
}

export function useScrollProgress(
  ref: React.RefObject<HTMLElement | null>
): React.RefObject<number> {
  const progress = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const { top, height } = el.getBoundingClientRect();
      const vh = window.innerHeight;
      progress.current = Math.max(0, Math.min(1, -top / (height - vh)));
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [ref]);

  return progress;
}
