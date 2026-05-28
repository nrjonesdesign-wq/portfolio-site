"use client";

import { useIsMobile } from "@/lib/useIsMobile";
import DesktopHome from "@/components/desktop/DesktopHome";
import MobileHome from "@/components/mobile/MobileHome";

/**
 * Viewport switch. The server (and the first client render) always
 * paint the desktop tree so SSR + initial HTML is meaningful and the
 * hydration markup matches. On mount, `useIsMobile` resolves the
 * actual viewport — if it's ≤ 768px, swap to MobileHome. This avoids
 * a server/client mismatch warning while still giving touch devices
 * the dedicated layout.
 */
export default function Page() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileHome />;
  return <DesktopHome />;
}
