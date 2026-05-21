"use client";

import StarField from "@/components/starfield/StarField";

/**
 * Loading panel — first scroll-snap section in the page. Sage bg, stars.
 *
 * The planet itself is NOT rendered here anymore — it's a singleton
 * (`MorphingPlanet`) rendered at page level so it can morph in one
 * continuous motion from this screen's centred large-size position into
 * the nav slot when the user advances out of loading. See spec §3 State B
 * step 2 ("the planet you see in the loading screen is literally the same
 * element that becomes the nav logo").
 *
 * The section stays in the DOM permanently so the user can scroll back
 * up to it from anywhere in the site.
 */
export default function LoadingSection() {
  return (
    <section
      id="loading"
      className="snap"
      // Tall loading section (180vh) gives the warp + smooth-scroll travel
      // real vertical real estate to traverse. The user reads it as the
      // camera ploughing through space before landing on Hello, instead of
      // a flat hop between two 100vh panels. snap-align: start (from .snap)
      // still pins the top of the section to the viewport top, so the user
      // never "rests" mid-section: a single wheel/click triggers a smooth
      // scroll from y=0 all the way to Hello's top at y=180vh.
      style={{ backgroundColor: "var(--bg)", height: "180vh" }}
    >
      {/* Star field follows the current foreground via currentColor. The
          .star-field class is the hook the warp transition latches onto —
          on user advance, html.warping applies a vertical scale + translate
          so the stars streak past suggesting forward travel. The container
          fills the 180vh section so there's a continuous, dense field for
          the warp + scroll to drive through. */}
      <div
        className="absolute inset-0 pointer-events-none star-field"
        aria-hidden
        style={{ color: "var(--fg)", opacity: 0.6 }}
      >
        <StarField className="w-full h-full" count={56} />
      </div>
    </section>
  );
}
