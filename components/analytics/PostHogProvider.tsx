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
 * default. The project key below is PostHog's public ingestion key
 * (it ships to every visitor's browser by design), so it lives in the
 * code; NEXT_PUBLIC_POSTHOG_KEY / _HOST env vars override it if set.
 *
 * Only runs on the production domain — local dev and Vercel previews
 * stay out of the dashboard.
 */
const POSTHOG_KEY = "phc_we3JYv4XVZgPuexsLqwNrNKMFUQ86kR4WBadGEDoLtbd";
const PROD_HOSTS = ["nathanielrobertjones.com", "www.nathanielrobertjones.com"];

export default function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY || POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!PROD_HOSTS.includes(window.location.hostname)) return;
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
