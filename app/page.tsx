"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import LoadingSection from "@/components/sections/loading/LoadingSection";
import { HelloPanel, NamePanel } from "@/components/sections/who/WhoSection";
import WorkSection, {
  WORK_SLUGS,
  INSPIRED_SLUGS,
} from "@/components/sections/work/WorkSection";
import ContactSection from "@/components/sections/contact/ContactSection";
import Nav, { NAV_PLANET_PX } from "@/components/nav/Nav";
import NRJPlanet from "@/components/nav/NRJPlanet";
import { useColorScheme, useSectionEntry } from "@/lib/scroll";
import { EASE } from "@/lib/motion";
import type { ActiveSection } from "@/components/nav/Nav";


export default function Page() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("loading");
  // Reported up by WorkSection while the case-study tray is open. Freezes
  // the global wheel / click-half handlers so the user is locked into the
  // tray until they explicitly close it.
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);
  // Open accordion slug. Controlled here (rather than inside WorkSection)
  // so that wheel events at the page level can step through projects in
  // sequence as the user scrolls within Work. null = closed (the default
  // state per the latest direction — no row is open until the user hovers
  // a row or scrolls into it).
  const [workOpenSlug, setWorkOpenSlug] = useState<string | null>(null);
  // Case-study slug for *accent* purposes only — set by WorkSection via
  // callback when the tray opens / closes. Kept separate from
  // workOpenSlug because the case-study tray can be open on a different
  // slug than the accordion row.
  const [caseStudySlugForAccent, setCaseStudySlugForAccent] = useState<
    string | null
  >(null);
  // Pre-scroll color invert flag for Work → Contact transition: set true
  // when the user advances out of Work, holds the colour scheme on
  // "name" / "nameMint" (sky/mint text on ink bg) for a beat before the
  // smooth-scroll fires, then a contactTop-driven override carries the
  // scheme into "contactIntro" (coral on ink) and finally "contact".
  // Reset when activeSection switches to "contact".
  const [workExitingToContact, setWorkExitingToContact] = useState(false);

  // workAccent is derived synchronously on every render — no useState +
  // useEffect round-trip, which was leaving the page-level color scheme
  // briefly out of sync with the accordion state (mint not appearing on
  // INSPIRED hover). Case-study slug wins if a tray is open; otherwise
  // we follow the accordion's open slug. INSPIRED_SLUGS is the source of
  // truth for which projects are mint.
  const accentSlug = caseStudySlugForAccent ?? workOpenSlug;
  const workAccent: "sky" | "mint" =
    accentSlug && INSPIRED_SLUGS.includes(accentSlug) ? "mint" : "sky";
  // True once the user advances off Loading the first time — drives the
  // singleton MorphingPlanet from its centred large-size loading position
  // into the nav slot. Reverses if the user scrolls back to Loading.
  // Initial value is read from current scroll position so a hard refresh
  // mid-page lands the planet in nav-mode immediately, not centred over
  // wherever the user happened to be (then awkwardly morphing on click).
  const [planetMorphed, setPlanetMorphed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.scrollY > window.innerHeight * 0.5;
  });

  // Wheel-lock state lives in refs (not local `let`s) so it persists
  // across re-binds of the wheel useEffect. lockedUntilRef caps when the
  // lock expires; lockMaxRef is the hard ceiling on lockedUntilRef so
  // inertia refreshes can't extend the lock forever — without this, a
  // super-long flick can keep firing wheel events for 2-3s and the user
  // can't advance again until they finally pause. lockDirRef tracks the
  // sign of the gesture; an opposite-direction wheel breaks out of the
  // lock for immediate reverse navigation.
  const lockedUntilRef = useRef(0);
  const lockMaxRef = useRef(0);
  const lockDirRef = useRef(0);

  const loadingRef = useRef<HTMLDivElement>(null);
  const helloRef   = useRef<HTMLDivElement>(null);
  const nameRef    = useRef<HTMLDivElement>(null);
  const workRef    = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  // Ref'd by Nav to mark where the singleton planet should land when it
  // morphs out of the loading screen.
  const navPlanetSlotRef = useRef<HTMLDivElement>(null);

  useSectionEntry(loadingRef, () => setActiveSection("loading"), 0.5);
  useSectionEntry(helloRef,   () => setActiveSection("who"),     0.5);
  useSectionEntry(nameRef,    () => setActiveSection("name"),    0.5);
  useSectionEntry(workRef,    () => setActiveSection("work"),    0.5);
  useSectionEntry(contactRef, () => setActiveSection("contact"), 0.5);

  // Color scheme is mostly driven by activeSection, but we override it on
  // scroll position when the user is between Name and Work — that's where
  // the accent morphs from sage → sky and the global 1.4s CSS transition
  // smooths the change as the user scrolls. No pre-scroll holds anywhere:
  // every colour change is tied to either an active-section change or a
  // scroll position, so colour eases happen DURING screen movement.
  const [colorScheme, setColorScheme] = useState<
    | "loading"
    | "who"
    | "name"
    | "nameMint"
    | "hired"
    | "inspired"
    | "contactIntro"
    | "contact"
  >("loading");

  useEffect(() => {
    const computeScheme = () => {
      const vh = window.innerHeight;
      const workTop = workRef.current?.getBoundingClientRect().top ?? Infinity;
      const contactTop = contactRef.current?.getBoundingClientRect().top ?? Infinity;

      // Base mapping from activeSection. Loading stays sage/ink until the
      // user advances — at that moment planetMorphed flips and we eagerly
      // claim the "who" scheme so the 1.4s sage→ink invert begins BEFORE
      // the scroll threshold flips activeSection.
      let next: typeof colorScheme;
      if (activeSection === "loading") next = planetMorphed ? "who" : "loading";
      else if (activeSection === "who" || activeSection === "name") next = "who";
      else if (activeSection === "work") next = workAccent === "mint" ? "inspired" : "hired";
      else next = "contact";

      // Scroll-driven override on the Name → Work boundary so the sage→sky
      // morph plays during the actual scroll instead of as a hard switch.
      // workTop measures Work panel's top edge relative to viewport top:
      //   workTop ≥ vh           → user is above Work (Name fully in view)
      //   0 < workTop < vh*0.55  → mid-transition: ease through "name" sky-on-ink
      //   workTop ≤ 0            → Work claims ink-on-sky (or mint if INSPIRED
      //                            is the active accent — without this branch
      //                            respecting workAccent, the override would
      //                            force "hired" and the INSPIRED hover/scroll
      //                            mint scheme would never reach the page).
      // The "name" override fires only when workTop is meaningfully
      // positive (> a few px) — the activeSection-based gate I tried
      // earlier blocked the override going UP from Work back to Name
      // because activeSection stays "work" through most of the
      // up-scroll. The pixel buffer also fixes the going-DOWN sub-pixel
      // pin (smooth-scroll landing workTop at 0.5px would otherwise
      // hold us in "name" forever).
      if (workTop > 4 && workTop < vh * 0.55) {
        next = "name";
      } else if (workTop <= 0 && Math.abs(workTop) < vh * 0.5) {
        next = workAccent === "mint" ? "inspired" : "hired";
      }

      // Pre-scroll color invert: while workExitingToContact is true and
      // Contact has not started crossing in yet, hold the scheme on
      // "name" / "nameMint" so the user sees the sky/mint-on-ink invert
      // BEFORE the page scrolls. Once Contact crosses into view, the
      // contactTop-driven override below takes the wheel.
      if (workExitingToContact && contactTop > vh * 0.55) {
        next = workAccent === "mint" ? "nameMint" : "name";
      }

      // Scroll-driven override on the Work → Contact boundary. The user
      // sees a three-stage colour cascade during the scroll:
      //   contactTop ∈ (vh*0.55, vh)  → "name" / "nameMint" (Work invert:
      //                                  sky-or-mint text on ink bg).
      //                                  The mint variant fires when the
      //                                  active Work accent is mint (an
      //                                  INSPIRED project is open) so the
      //                                  ink-on-mint → mint-on-ink invert
      //                                  plays before the coral arrives.
      //   contactTop ∈ (0, vh*0.55)   → "contactIntro" (coral on ink)
      //   contactTop ≤ 0 (Contact full) → "contact"    (ink on coral)
      // Same pattern as Name → Work — the colour change leads the scroll
      // visually so each transition reads as smooth bg cross-fades.
      // Buffer-gated contactTop transition. Buffers are now ~5% of vh
      // on both sides so the transition cascade only fires when Contact
      // is meaningfully transitioning into view (or just receded out).
      // The narrow 4px buffers were letting the override fire during
      // Work's fully-snapped state — sub-pixel contactTop a few px
      // under vh would trigger "name" and pin Work in sky-on-ink.
      const cBuffer = vh * 0.05;
      if (contactTop > cBuffer && contactTop < vh - cBuffer) {
        if (contactTop > vh * 0.55) {
          next = workAccent === "mint" ? "nameMint" : "name";
        } else {
          next = "contactIntro";
        }
      } else if (
        contactTop <= 0 &&
        Math.abs(contactTop) < vh * 0.5 &&
        activeSection === "contact"
      ) {
        next = "contact";
      }

      setColorScheme(next);
    };

    computeScheme();
    window.addEventListener("scroll", computeScheme, { passive: true });
    window.addEventListener("resize", computeScheme);
    return () => {
      window.removeEventListener("scroll", computeScheme);
      window.removeEventListener("resize", computeScheme);
    };
  }, [activeSection, planetMorphed, workAccent, workExitingToContact]);

  // Once Contact takes over (activeSection crosses its 50% threshold),
  // clear the exit flag so the contactTop override is the sole driver
  // of the scheme through the rest of the transition.
  useEffect(() => {
    if (activeSection === "contact" && workExitingToContact) {
      setWorkExitingToContact(false);
    }
  }, [activeSection, workExitingToContact]);

  useColorScheme(colorScheme);

  // Drive the Select Engagements fade from scroll position rather than
  // colorScheme. The colorScheme oscillates during the Name→Work scroll
  // (override flips it to "name", then "who" again as workTop crosses 70%),
  // which would cause engagements to "reappear on scroll" — visibly
  // re-fading-in mid-scroll. Binding directly to workTop avoids the bounce:
  // engagements are visible only while the Work panel is fully below the
  // viewport (workTop ≥ vh) — the moment Work starts to peek into view, they
  // fade and stay faded all the way through.
  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      const workTop = workRef.current?.getBoundingClientRect().top ?? Infinity;
      const visible = workTop >= vh * 0.96;
      document.documentElement.style.setProperty(
        "--engagements-opacity",
        visible ? "1" : "0"
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Override the cursor's resolved foreground colour when the case-study
  // tray is open. The tray locally paints over the Work section bg with
  // var(--ink), so an ink cursor on the ink panel would be invisible.
  // Setting --cursor-default-fg to the project's accent (sky for HIRED,
  // mint for INSPIRED) keeps the cursor visible inside the tray. The
  // *default* tier of the cascade lets per-element data-cursor-color
  // overrides still win on hover.
  useEffect(() => {
    if (caseStudyOpen) {
      document.documentElement.style.setProperty(
        "--cursor-default-fg",
        workAccent === "mint" ? "var(--mint)" : "var(--sky)"
      );
    } else {
      document.documentElement.style.removeProperty("--cursor-default-fg");
    }
  }, [caseStudyOpen, workAccent]);

  // Intro paragraph used to live in a fixed-position overlay that
  // cross-faded between Name and Work; that approach has been replaced
  // by inline scroll-in: NamePanel renders the intro in its right column,
  // and WorkSection's right column shows the same intro as a fallback
  // when no project is open. Each instance animates in via whileInView.

  // Scroll-snap is always on now that loading is a permanent panel.
  useEffect(() => {
    document.documentElement.classList.add("snapping");
    return () => {
      document.documentElement.classList.remove("snapping");
    };
  }, []);

  // Loading → Who transition. Tightened timeline so the warp starts almost
  // immediately after the user's wheel (eliminates the perceived "glitchy
  // lag" before motion began). Colour invert still leads — it runs for
  // 1.4s so the bg is still actively crossfading when the warp lands.
  //   t=0    setPlanetMorphed → 1.4s colour invert starts
  //   t=180  add .warping → stars stretch + translate (1.6s)
  //   t=900  scrollIntoView('#who') — mid-warp, page slides up under the
  //          still-streaking field
  //   t=2000 remove .warping (well after Loading is off-screen)
  const triggerLoadingTransition = useCallback(() => {
    if (planetMorphed) return;
    setPlanetMorphed(true);
    const t1 = window.setTimeout(() => {
      document.documentElement.classList.add("warping");
    }, 180);
    const t2 = window.setTimeout(() => {
      document.getElementById("who")?.scrollIntoView({ behavior: "smooth" });
    }, 900);
    const t3 = window.setTimeout(() => {
      document.documentElement.classList.remove("warping");
    }, 2000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [planetMorphed]);

  // Work → Contact transition. Three-phase timeline:
  //   t=0     setWorkExitingToContact → "name" / "nameMint" claims the
  //           scheme (sky-or-mint text on ink bg). The 1.4s CSS bg
  //           transition starts immediately, so the user sees the
  //           invert play out before any page movement.
  //   t=900   scrollIntoView('#contact') — mid-invert. The contactTop-
  //           driven override carries the scheme through "contactIntro"
  //           (coral on ink) as Contact enters view, then "contact"
  //           (ink on coral) once it's fully snapped in. The exit flag
  //           is cleared by the useEffect watching activeSection.
  const triggerWorkToContactTransition = useCallback(() => {
    setWorkExitingToContact(true);
    window.setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 900);
  }, []);

  // Sync planetMorphed with active section ONLY on transitions in/out of
  // Loading. Setting it on every activeSection change made the planet
  // bounce back-and-forth during a Work → Loading scroll: the user
  // clicks the nav planet (we explicitly set morphed=false), the smooth-
  // scroll passes through work → name → who → loading, and each
  // intermediate observer hit would re-set morphed=true, re-flying the
  // planet to the nav slot mid-flight. Now we only react to the actual
  // Loading boundary.
  const prevSectionRef = useRef<ActiveSection>(activeSection);
  useEffect(() => {
    const prev = prevSectionRef.current;
    if (activeSection === "loading" && prev !== "loading") {
      setPlanetMorphed(false);
    } else if (prev === "loading" && activeSection !== "loading") {
      setPlanetMorphed(true);
    }
    prevSectionRef.current = activeSection;
  }, [activeSection]);

  // Reset accordion to closed every time the user navigates *into* Work
  // from another section. Stepping through projects inside Work doesn't
  // change activeSection (still "work"), so wheel-driven cycling is
  // unaffected — only a fresh entry resets.
  const prevActiveSectionRef = useRef<ActiveSection>(activeSection);
  const prevCaseStudyOpenRef = useRef<boolean>(caseStudyOpen);
  useEffect(() => {
    if (
      activeSection === "work" &&
      prevActiveSectionRef.current !== "work"
    ) {
      setWorkOpenSlug(null);
    }
    prevActiveSectionRef.current = activeSection;
  }, [activeSection]);

  // Same idea, scoped to the case-study tray: when the tray closes, the
  // user is returning to the Work screen — clear whatever row was open so
  // the accordion's "default state" reasserts itself. Handled via the
  // batched setter below (handleCaseStudyOpenChange) so the wheel
  // handler can't observe an intermediate state with
  // (caseStudyOpen=false, workOpenSlug=lastProject) and bounce the user
  // off to Contact.
  useEffect(() => {
    prevCaseStudyOpenRef.current = caseStudyOpen;
  }, [caseStudyOpen]);

  const handleCaseStudyOpenChange = useCallback((open: boolean) => {
    setCaseStudyOpen(open);
    if (!open) setWorkOpenSlug(null);
  }, []);

  // Global auto-advance: any forward-nav input (click outside interactive
  // elements, ↓/PageDown/Space/Enter, or wheel-down) snaps to the next
  // section; reverse inputs (wheel-up) snap back. Works on every panel.
  useEffect(() => {
    const NEXT: Record<ActiveSection, string | null> = {
      loading: "who",
      who:     "who-bio",
      name:    "work",
      work:    "contact",
      contact: null,
    };
    const PREV: Record<ActiveSection, string | null> = {
      loading: null,
      who:     "loading",
      name:    "who",
      work:    "who-bio",
      contact: "work",
    };

    // No pre-scroll holds — colour transitions ride on the smooth scroll
    // itself via the workTop-driven override in computeScheme. Loading is
    // the one exception: it gets a coordinated invert + warp + planet morph
    // before the scroll starts (spec §3 State B).
    //
    // Work section is treated specially: instead of jumping to the next
    // section on every wheel, the wheel first steps through the project
    // accordion. Each scroll opens the next project; only after the last
    // project (Paintings) does another wheel advance to Contact. Reverse
    // works symmetrically. This is how "scrolling sequentially through
    // each project" is wired up.
    // overAccordion === true means the wheel/keyboard input is meant to
    // step through the accordion (wheel was over the project list, or
    // keyboard which defaults to step behaviour). false means the input
    // is happening on Work's negative space — in that case Work advances
    // straight to Contact instead of stepping through projects first.
    const advance = (overAccordion = true) => {
      if (activeSection === "loading") {
        triggerLoadingTransition();
        return;
      }
      if (activeSection === "work") {
        if (overAccordion) {
          const idx = workOpenSlug ? WORK_SLUGS.indexOf(workOpenSlug) : -1;
          if (idx < WORK_SLUGS.length - 1) {
            setWorkOpenSlug(WORK_SLUGS[idx + 1]);
            return;
          }
        }
        // Past the last project — or wheel over negative space — trigger
        // the colour-invert-first transition to Contact. The trigger sets
        // the exit flag (which the colour-scheme computer reads to claim
        // "name" / "nameMint" right away) and fires scrollIntoView after
        // a 900ms beat so the user actually sees the invert before the
        // page moves. workOpenSlug stays so inertia wheels don't re-open
        // the first project mid-scroll.
        triggerWorkToContactTransition();
        return;
      }
      const next = NEXT[activeSection];
      if (!next) return;
      document.getElementById(next)?.scrollIntoView({ behavior: "smooth" });
    };
    const retreat = (overAccordion = true) => {
      if (activeSection === "work") {
        if (overAccordion) {
          if (!workOpenSlug) {
            // Accordion closed; retreat upward to Name.
            document
              .getElementById("who-bio")
              ?.scrollIntoView({ behavior: "smooth" });
            return;
          }
          const idx = WORK_SLUGS.indexOf(workOpenSlug);
          if (idx > 0) {
            setWorkOpenSlug(WORK_SLUGS[idx - 1]);
            return;
          }
          // At first project — collapse the accordion.
          setWorkOpenSlug(null);
          return;
        }
        // Wheel over negative space: retreat straight back to Name and
        // close the accordion as we leave.
        setWorkOpenSlug(null);
        document
          .getElementById("who-bio")
          ?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (activeSection === "contact") {
        // Coming back from Contact lands on Work with a closed accordion
        // (sky scheme by default). Previously this auto-opened the last
        // project, which left the page in the mint INSPIRED scheme on
        // arrival — confusing if the user expected Select Work's default
        // sky look. From here, the user can scroll back down to step into
        // projects again, or scroll up to Name.
        setWorkOpenSlug(null);
        document
          .getElementById("work")
          ?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const prev = PREV[activeSection];
      if (!prev) return;
      document.getElementById(prev)?.scrollIntoView({ behavior: "smooth" });
    };

    const onKey = (e: KeyboardEvent) => {
      const navKey =
        e.key === "ArrowDown" ||
        e.key === "PageDown" ||
        e.key === " " ||
        e.key === "Enter" ||
        e.key === "ArrowUp" ||
        e.key === "PageUp";
      if (!navKey) return;
      // preventDefault first — Space / PgDn / arrows would otherwise
      // scroll the document natively while the case-study tray is open.
      e.preventDefault();
      if (
        caseStudyOpen ||
        document.querySelector("[data-case-study-tray]")
      ) {
        return;
      }
      if (
        e.key === "ArrowDown" ||
        e.key === "PageDown" ||
        e.key === " " ||
        e.key === "Enter"
      ) {
        advance();
      } else {
        retreat();
      }
    };

    // Click navigation:
    //   • Anywhere not on an interactive element advances to the next
    //     section (page-turn ergonomic).
    //   • Exception — on Work with an open accordion row, a non-interactive
    //     click collapses the accordion first; the advance happens on the
    //     *next* click.
    const onClick = (e: MouseEvent) => {
      if (caseStudyOpen) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest("a, button, [role='button'], [data-no-advance]")
      ) {
        return;
      }
      if (activeSection === "work" && workOpenSlug) {
        setWorkOpenSlug(null);
        return;
      }
      advance();
    };

    // Wheel: every wheel event is preventDefault-ed regardless, so native
    // scrolling NEVER takes the page into "no-man's-land" between sections.
    // A first event past the deltaY threshold fires a snap and locks for
    // a duration that depends on what just happened:
    //   - Cross-section transitions (Hello → Name, Name → Work, …): need
    //     a long lock so trackpad-inertia events that fire 2-3s after
    //     the physical flick don't carry the user past the next snap.
    //     This is item #4 — user was flying past Name on one Hello flick.
    //   - Project-cycling within Work: short lock so a user can step
    //     through HIRED → INSPIRED projects with multiple wheel ticks
    //     in a comfortable cadence (the cycle is state-only, no scroll).
    const onWheel = (e: WheelEvent) => {
      // Work has no internal scroll — each wheel step shifts the left
      // column transform so the next project locks at the SW header Y.
      // Wheel handling falls through directly to advance/retreat.
      e.preventDefault();
      // Bail synchronously when the case-study tray is in the DOM,
      // regardless of whether React state has caught up yet. This
      // closes the race where a wheel event fires after the tray
      // mounts (or just before it fully unmounts) and would otherwise
      // trigger advance() through the stale closure.
      if (caseStudyOpen || document.querySelector("[data-case-study-tray]")) {
        return;
      }
      const now = performance.now();
      // Page-turn mechanics:
      //   - Low threshold + low initial lock = the slightest wheel input
      //     triggers one snap, like flipping a magazine page.
      //   - Refresh-on-input keeps the lock alive while trackpad inertia
      //     keeps firing trailing events. As long as events arrive, we
      //     stay locked; the moment they stop, the lock dies 280ms later.
      //   - Net effect: one gesture = one snap. No momentum overshoot.
      //     Lighter flicks feel responsive instead of resistant.
      if (now < lockedUntilRef.current) {
        const eventDir = Math.sign(e.deltaY);
        // Same-direction events refresh the lock so trackpad inertia
        // tails stay blocked — capped by lockMaxRef so very long flicks
        // can't keep the user locked out indefinitely.
        if (eventDir === lockDirRef.current) {
          if (Math.abs(e.deltaY) >= 2) {
            lockedUntilRef.current = Math.min(
              lockMaxRef.current,
              Math.max(lockedUntilRef.current, now + 240)
            );
          }
          return;
        }
        // Opposite-direction events: user is starting a new gesture in
        // the reverse direction. Very low threshold (1) so even the
        // gentlest reverse wheel breaks the lock immediately — fixes
        // "Contact gets stuck" where the cross-section lock prevented
        // an immediate retreat back to Work.
        if (Math.abs(e.deltaY) < 1) return;
        // Fall through to trigger advance/retreat for the new direction.
      }
      const threshold = 3;
      if (Math.abs(e.deltaY) < threshold) return;
      // On Work, every wheel gesture steps the accordion regardless of
      // wheel target. Past the last project, advance() falls through to
      // scrollIntoView('#contact') via the existing branch. The Work →
      // Contact transition still gets a longer lock so its 900ms pre-
      // scroll colour invert + ~600ms scroll can finish in one gesture.
      const treatAsAccordionStep = activeSection === "work";
      let lockMs = 800;
      let maxLockMs = 1500;
      if (treatAsAccordionStep) {
        const idx = workOpenSlug ? WORK_SLUGS.indexOf(workOpenSlug) : -1;
        const stayingInWork =
          e.deltaY > 0 ? idx < WORK_SLUGS.length - 1 : idx > 0;
        if (stayingInWork) {
          lockMs = 450;
          maxLockMs = 900;
        } else if (e.deltaY > 0) {
          // Last project → Contact: cover the colour invert + scroll.
          lockMs = 1600;
          maxLockMs = 2400;
        }
      }
      lockedUntilRef.current = now + lockMs;
      lockMaxRef.current = now + maxLockMs;
      lockDirRef.current = Math.sign(e.deltaY);
      if (e.deltaY > 0) advance(true);
      else retreat(true);
    };

    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [activeSection, caseStudyOpen, triggerLoadingTransition, triggerWorkToContactTransition, workOpenSlug]);

  // Safety net for "no-man's-land" scroll states — when the page comes
  // to rest BETWEEN two snap panels (e.g., a wheel gesture got cut off
  // mid-transition, or an internal scroll within Work left the doc
  // partly past a snap line). After the user stops scrolling for a
  // beat, find the closest section and smooth-scroll to its top. Skips
  // when the case-study tray is open (the tray's own panel handles its
  // scroll lock), and skips while Work has an internal scroll position
  // > 0 (the user is intentionally viewing the accordion overflow).
  useEffect(() => {
    let timer: number | null = null;
    const refs = [loadingRef, helloRef, nameRef, workRef, contactRef];
    const onScroll = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = null;
        if (caseStudyOpen) return;
        const workEl = document.getElementById("work");
        // Don't fight the user's intentional internal scroll inside Work.
        if (workEl && workEl.scrollTop > 1) return;
        let bestId: string | null = null;
        let bestDist = Infinity;
        for (const ref of refs) {
          const el = ref.current;
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          if (Math.abs(top) < bestDist) {
            bestDist = Math.abs(top);
            bestId = el.id;
          }
        }
        // Snap only when we're 2px-30vh away from the nearest section —
        // anything bigger is a deliberate transit in progress, anything
        // smaller is "essentially snapped" already.
        if (
          bestId &&
          bestDist > 2 &&
          bestDist < window.innerHeight * 0.3
        ) {
          document
            .getElementById(bestId)
            ?.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [caseStudyOpen]);

  // Nav and footer hide on Loading and during the case-study takeover.
  // The case-study panel renders its own NRJ mark and project number in
  // the top-left of its left rail, so the page-level chrome would just
  // duplicate that.
  const chromeVisible = activeSection !== "loading" && !caseStudyOpen;

  return (
    <>
      <Nav
        activeSection={activeSection}
        chromeVisible={chromeVisible}
        planetSlotRef={navPlanetSlotRef}
      />

      {/* Singleton planet — see spec §3 State B step 2. Lives at the page
          level so its canvas + orbit state survive across the loading→nav
          morph (placing it inside LoadingSection or Nav would unmount and
          remount it, resetting the trail). Position/size animate between
          loading-screen-centred and the measured nav slot. */}
      <MorphingPlanet
        morphed={planetMorphed}
        hidden={caseStudyOpen}
        navSlotRef={navPlanetSlotRef}
        onClick={() => {
          if (planetMorphed) {
            // Scroll up to Loading FIRST, then morph the planet to its
            // centred / large position after the smooth-scroll has had
            // time to land. Doing both in parallel let the planet's
            // spring outrun the scroll on long pages, so the user saw
            // the large planet briefly sitting over Contact or Work
            // before the page caught up. Sequential lookup-and-morph
            // keeps the planet in the nav slot through the entire
            // up-scroll and only flies out once we're already at the
            // Loading panel.
            document
              .getElementById("loading")
              ?.scrollIntoView({ behavior: "smooth" });
            window.setTimeout(() => {
              setPlanetMorphed(false);
            }, 750);
          } else {
            triggerLoadingTransition();
          }
        }}
      />

      <div ref={loadingRef}>
        <LoadingSection />
      </div>

      <div ref={helloRef}>
        <HelloPanel />
      </div>

      <div ref={nameRef}>
        <NamePanel />
      </div>

      <div ref={workRef}>
        <WorkSection
          openSlug={workOpenSlug}
          onOpenSlugChange={setWorkOpenSlug}
          onCaseStudyOpenChange={handleCaseStudyOpenChange}
          onCaseStudySlugChange={setCaseStudySlugForAccent}
        />
      </div>

      <div ref={contactRef}>
        <ContactSection />
      </div>

      {/* Fixed bottom meta-row. Sequential left-to-right reveal mirrors the
          top nav (spec §1 / §2). Each label rises in, each rule draws on
          via scaleX, in order. */}
      <motion.footer
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center"
        // pointerEvents tied to chromeVisible — without this, the footer
        // bar (z-50) keeps eating clicks on elements painted under it
        // (e.g. the case-study back arrow at the bottom-left of the rail)
        // because only its opacity is animated, not its event surface.
        style={{
          height: "5rem",
          pointerEvents: chromeVisible ? "auto" : "none",
        }}
        initial="hidden"
        animate={chromeVisible ? "visible" : "hidden"}
        variants={footerContainerVariants}
      >
        {/* Backdrop layer with the masked blur — separate from the content
            sibling so meta-row labels aren't clipped by the gradient mask. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            backgroundColor: "color-mix(in srgb, var(--bg) 45%, transparent)",
            transition: "background-color 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            maskImage:
              "linear-gradient(to top, black 30%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.4) 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 30%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.4) 80%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
        <div className="content-grid w-full" style={{ position: "relative", zIndex: 1 }}>
          {/* SVD + rule + AVAILABLE FOR WORK live inside ONE grid cell
              spanning cols 3-17 — same column span as the Select Work
              accordion on the Work section. AVAILABLE then naturally
              right-aligns at col 17's right edge (matching the design),
              and the flex-grown rule between SVD and AVAILABLE has equal
              column-gap-equivalent breathing room on each side. */}
          <div
            style={{
              gridColumn: "3 / 18",
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            <motion.span
              variants={footerLabelVariants}
              className="text-label"
              style={{ color: "var(--fg)", opacity: 0.6, flex: "0 0 auto" }}
            >
              Senior Visual Designer
            </motion.span>

            <motion.div
              variants={footerRuleVariants}
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "var(--fg)",
                transformOrigin: "left center",
              }}
            />

            <motion.span
              variants={footerLabelVariants}
              className="text-label"
              style={{ color: "var(--fg)", opacity: 0.6, flex: "0 0 auto" }}
            >
              Available for Work
            </motion.span>
          </div>

          <motion.span
            variants={footerLabelVariants}
            className="text-label"
            style={{
              gridColumn: "29 / 31",
              color: "var(--fg)",
              opacity: 0.6,
              alignSelf: "center",
              justifySelf: "end",
            }}
          >
            (c) 2026
          </motion.span>
        </div>
      </motion.footer>
    </>
  );
}

/* ─── Footer reveal variants ──────────────────────────────────────────────
   Mirrors the nav's left-to-right cascade so the page chrome assembles in
   one continuous gesture (top nav first, then footer in series).
*/
const footerContainerVariants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.3, ease: EASE },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: EASE,
      // Footer cascade kicks in after the top nav has substantially
      // resolved — total nav cascade is ~0.15 + 5*0.18 ≈ 1.05s. Footer
      // begins around the tail end so the user reads it as a single
      // assembly, not two parallel animations.
      delayChildren: 1.0,
      staggerChildren: 0.18,
    },
  },
};
const footerLabelVariants = {
  hidden: { opacity: 0, y: 6 },
  // Wrapper goes to opacity 1 — the inline span inside keeps its own 0.6
  // dimming so the final visual opacity remains 0.6, not 0.36.
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};
const footerRuleVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 0.35,
    transition: { duration: 0.5, ease: EASE },
  },
};

/* ─── Singleton planet (loading-screen → nav morph) ───────────────────────
   Lives at the page root so it can animate position+size between the
   centred loading-screen position and the nav slot without unmounting,
   preserving the orbital electron canvas state across the morph.
*/
function MorphingPlanet({
  morphed,
  hidden = false,
  navSlotRef,
  onClick,
}: {
  morphed: boolean;
  hidden?: boolean;
  navSlotRef: React.RefObject<HTMLDivElement | null>;
  onClick: () => void;
}) {
  // Mount gate + window-aware initial state. Without this, vp starts at
  // {0,0} on first paint and the planet visibly animates from the top-left
  // corner into the centre on load — confusing the user into thinking the
  // morph fired before they did anything. With the gate, the first paint
  // already has correct viewport dimensions and the planet appears at the
  // centred loading position with no entry slide.
  const [mounted, setMounted] = useState(false);
  const [vp, setVp] = useState<{ w: number; h: number }>(() =>
    typeof window !== "undefined"
      ? { w: window.innerWidth, h: window.innerHeight }
      : { w: 1440, h: 900 }
  );
  const [navSlot, setNavSlot] = useState<{ x: number; y: number; size: number }>({
    x: 0,
    y: 0,
    size: NAV_PLANET_PX,
  });

  useEffect(() => {
    const measure = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      const r = navSlotRef.current?.getBoundingClientRect();
      if (r) setNavSlot({ x: r.left, y: r.top, size: r.width });
    };
    measure();
    setMounted(true);
    window.addEventListener("resize", measure);
    // Re-measure once after fonts/layout settle.
    const t = window.setTimeout(measure, 200);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, [navSlotRef]);

  // Logo rotates clockwise with scroll, in both modes — preserves the
  // ambient motion that the nav planet had previously.
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      setRotation(progress * 360);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadingSize = useMemo(
    () => Math.min(vp.w * 0.6, vp.h * 0.6, 720),
    [vp]
  );

  // The planet's DOM box stays at loadingSize × loadingSize at ALL times.
  // Morphing into the nav slot is done via CSS transform (translate +
  // scale) only — never width/height — so the inner canvas backing buffer
  // never resizes mid-animation. Resizing the canvas mid-orbit clears its
  // trail history and produces the jagged comet artefacts visible on
  // toggle-back. With this approach, NRJPlanet's ResizeObserver never
  // fires after first mount and the trail stays continuous across the
  // morph in either direction.
  const targetScale = morphed ? navSlot.size / loadingSize : 1;
  // x / y here are the position of the box's TOP-LEFT corner — the planet
  // visually occupies a centred sub-rect at scaled size, so we offset by
  // half the (unscaled - scaled) delta to keep the box's centre on the
  // intended centre point. In nav mode we ALSO shift left so the inner
  // planet circle (not the wrapper centre) aligns with the nav slot's
  // left edge — the wider comet rings then extend further left into the
  // col-2 gutter, matching the rule pattern used elsewhere in the case
  // study. PLANET_R_FRAC is 0.195 inside NRJPlanet; circle radius at
  // nav size = 0.195 × navSlot.size.
  const navCircleRadiusPx = 0.195 * navSlot.size;
  const targetCenterX = morphed
    ? navSlot.x + navCircleRadiusPx
    : vp.w / 2;
  const targetCenterY = morphed ? navSlot.y + navSlot.size / 2 : vp.h / 2;
  const targetX = targetCenterX - loadingSize / 2;
  const targetY = targetCenterY - loadingSize / 2;

  // Don't render until measured — first paint should land at the correct
  // centred loading position. (The mount gate fires synchronously inside
  // the same render-then-effect cycle, so the user-perceived flash is one
  // frame at most.)
  if (!mounted) return null;

  return (
    <motion.button
      type="button"
      data-magnetic
      data-cursor="view"
      data-no-advance
      aria-label="Nathaniel Robert Jones"
      onClick={onClick}
      initial={{ x: targetX, y: targetY, scale: 0.001 }}
      animate={{ x: targetX, y: targetY, scale: targetScale }}
      whileHover={{ scale: targetScale * (morphed ? 1.18 : 1.1) }}
      transition={{
        scale: { type: "spring", stiffness: 200, damping: 22, mass: 1 },
        x: { type: "spring", stiffness: 110, damping: 22, mass: 1 },
        y: { type: "spring", stiffness: 110, damping: 22, mass: 1 },
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: loadingSize,
        height: loadingSize,
        zIndex: 60,
        padding: 0,
        background: "none",
        border: "none",
        cursor: "inherit",
        color: "var(--fg)",
        clipPath: "circle(50% at 50% 50%)",
        transformOrigin: "center center",
        // Stay mounted (preserves canvas trail state) but disappear while
        // the case-study tray covers Work — the case-study has its own
        // mark, so the singleton would otherwise duplicate it.
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
        transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <NRJPlanet cascadeWordmark wordmarkDelay={0.55} />
      </div>
    </motion.button>
  );
}
