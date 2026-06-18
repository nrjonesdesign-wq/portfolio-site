"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Boots PostHog on first mount. The page is single-route (everything
 * lives in one App-Router route), so we don't need a route-change
 * listener — autocapture handles clicks + section navigation, and the
 * built-in $pageview fires on initial load.
 *
 * Heatmaps + session recordings + autocapture are all enabled by
 * default; only need to provide the project key + host via env vars
 * (NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST).
 *
 * If the env vars are missing (local dev), this is a no-op — keeps
 * the dashboard clean of dev-machine pageviews.
 */
export default function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key) return;
    if (posthog.__loaded) return;
    posthog.init(key, {
      api_host: host ?? "https://us.i.posthog.com",
      // Heatmaps + click recordings — what makes the dashboard
      // interesting for a portfolio.
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      // Session recording is included on the free tier; cap a bit
      // tighter than default so 5k/month goes further.
      session_recording: {
        maskAllInputs: true,
      },
      // Respect Do-Not-Track signals — light-touch privacy hygiene
      // for a personal site.
      respect_dnt: true,
      persistence: "localStorage+cookie",
    });
  }, []);

  return null;
}
