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

    // Drive iOS Safari's status-bar + bottom-chrome tint to match the
    // current section bg. Without this, the safe-area regions sample a
    // stale colour from earlier in the page and read as sage bands
    // around the live content. Two tags so iOS picks the right one in
    // both light + dark schemes.
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = bg;
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
