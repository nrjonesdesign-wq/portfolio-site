"use client";

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 768px)";

/**
 * Viewport switch. Returns:
 *   - `null` on the server / first render (SSR-safe: nothing to render yet)
 *   - `true` when the viewport matches `(max-width: 768px)` (mobile)
 *   - `false` otherwise (desktop)
 *
 * The null phase lets `app/page.tsx` render the desktop tree on the
 * server so the initial HTML is meaningful, then swap to mobile on
 * hydration if the actual viewport is small.
 */
export function useIsMobile(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}
