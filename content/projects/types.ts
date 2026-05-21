/**
 * Project / case-study data shapes.
 *
 * Each Project is one accordion row on the WORK screen. A project's
 * `items` are the numbered cards in the right column when that row is
 * expanded; each item carries its own case-study content (Bloomberg
 * and Liquid Agency both have multiple cards, so per-item case studies
 * are required).
 *
 * To author a new project:
 *   1. Drop assets in `public/videos/<slug>/` and `public/case-study/<slug>/`.
 *   2. Add a file under `content/projects/` (one project per file).
 *   3. Register the project in `content/projects/index.ts`.
 */

export type Credit = {
  role: string;
  person: string;
  /** Optional external link (e.g. designer's portfolio). */
  href?: string;
};

/** A single tile in the case-study reel. Prefer the `video` kind — it
 *  renders via native `<video>` with autoplay + muted + loop + zero
 *  player chrome. YouTube embeds always carry some UI; use only as a
 *  fallback. Images render via `<img>` with object-fit: contain. */
export type ReelItem =
  | {
      kind: "video";
      src: string;
      poster?: string;
      title?: string;
      /** Set true for videos with an audio track — surfaces the
       *  "[ click to play audio ]" overlay in the case-study reel.
       *  Defaults to false (no overlay) so muted-only MP4s don't
       *  promise audio they don't have. */
      hasAudio?: boolean;
      /** Override the accordion-preview cross-fade dwell for this asset
       *  (milliseconds). Useful when an intro animation needs more time
       *  to play before the slide moves on. */
      previewDwellMs?: number;
    }
  | {
      kind: "youtube";
      id: string;
      title?: string;
      previewDwellMs?: number;
    }
  | {
      kind: "image";
      src: string;
      alt: string;
      /** Same per-asset preview dwell override as the video kind. */
      previewDwellMs?: number;
    };

export type CaseStudyContent = {
  /** Big multi-line display title shown at the top of the case-study
   *  left rail. Use `\n` for explicit line breaks. */
  title: string;
  /** First-tab body copy. Single paragraph. */
  brief: string;
  /** Second-tab body copy. Single paragraph. */
  challenge: string;
  /** Third-tab body copy. Can span multiple paragraphs — each entry in
   *  this array becomes its own `<p>`. */
  solution: string[];
  /** Client name shown in the CLIENT meta block when no logo is set.
   *  Omit entirely for projects with no client (e.g., personal art
   *  practice) — the CLIENT block won't render. */
  client?: string;
  /** Optional path to an SVG client logo. When present, renders the SVG;
   *  otherwise falls back to the body-copy client name. */
  clientLogo?: string;
  /** Comma-separated list of services rendered under SERVICES. */
  services: string;
  /** Override the "SERVICES" meta-block label — e.g., set to "MEDIUMS"
   *  for a personal art project where "services" reads wrong. */
  servicesLabel?: string;
  /** Crew + collaborators. Rendered as a list under CREDITS. */
  credits: Credit[];
  /** Reel items rendered in the right-side auto-scrolling stack.
   *  Optional — CaseStudyReel falls back to placeholder tiles when
   *  undefined or empty. */
  reel?: ReelItem[];
  /** How each reel tile fits its 16:9 frame. "cover" (default) crops to
   *  fill (good for wide screenshots / videos where letterbox bands
   *  between consecutive tiles would read as "padding"). "contain"
   *  shows the whole asset at native ratio, letterboxing against the
   *  ink frame — used for flyer / painting projects where cropping
   *  ruins the composition. */
  reelFit?: "cover" | "contain";
  /** CSS color override for the reel's tile + container background.
   *  Defaults to var(--ink) (≈ #151515). Set to pure black or any other
   *  custom value when a project wants its letterbox / negative space
   *  to read truly black rather than the slightly warm ink tone. */
  reelBg?: string;
};

export type ProjectItem = {
  /** Display number, e.g. "01", "02". Must be unique across the whole
   *  site — used as the case-study tray's identifier. */
  number: string;
  /** Body copy in the right column when this item's project row is
   *  expanded. One sentence to a short paragraph. */
  description: string;
  /** Full case-study content shown in the slide-in tray when this
   *  item's VIEW WORK button is clicked. */
  caseStudy: CaseStudyContent;
};

export type Project = {
  /** URL-friendly slug, also used by `page.tsx` to drive accordion
   *  state through wheel events. */
  slug: string;
  /** Display name on the accordion row. Stored in proper case — the row
   *  doesn't apply `text-transform: uppercase`. */
  name: string;
  /** Disciplines comma-list shown right-aligned on the row. */
  disciplines: string;
  /** Preview tagline placeholder for the accordion's expanded preview
   *  tile when no reel is supplied. Optional. */
  previewLabel?: string;
  /** Drives the case-study accent colour. `sky` for HIRED group, `mint`
   *  for INSPIRED. All of a project's items share the same accent. */
  accent: "sky" | "mint";
  /** Items shown in the right column when this row is expanded. Each
   *  carries its own case-study content. */
  items: ProjectItem[];
};

/** Convenience: build a "coming soon" CaseStudyContent shell so a new
 *  project can be added with just a title, client, and services. Fill in
 *  brief/challenge/solution/credits/reel later as the content lands. */
export function placeholderCaseStudy(args: {
  title: string;
  client?: string;
  clientLogo?: string;
  services: string;
  servicesLabel?: string;
}): CaseStudyContent {
  return {
    title: args.title,
    brief: "Case study content coming soon.",
    challenge: "Case study content coming soon.",
    solution: ["Case study content coming soon."],
    client: args.client,
    clientLogo: args.clientLogo,
    services: args.services,
    servicesLabel: args.servicesLabel,
    credits: [],
  };
}
