/**
 * Project registry. Edit these arrays to add / remove / reorder
 * projects on the WORK screen. HIRED renders under the "Hired" group
 * label, INSPIRED under "Inspired". Each project's own file lives
 * alongside this one and owns its items + case-study content.
 */

import { bloombergLp } from "./bloomberg-lp";
import { liquidAgency } from "./liquid-agency";
import { revolutionaryChange } from "./revolutionary-change";
import { tuesgay } from "./tuesgay";
import { paintings } from "./paintings";
import type { Project } from "./types";

export const HIRED: Project[] = [
  bloombergLp,
  liquidAgency,
  revolutionaryChange,
];

export const INSPIRED: Project[] = [tuesgay, paintings];

export const ALL_PROJECTS: Project[] = [...HIRED, ...INSPIRED];

/** Project slugs in step order (HIRED first, then INSPIRED). Used by
 *  page.tsx's wheel handler to advance the accordion through projects. */
export const WORK_SLUGS = ALL_PROJECTS.map((p) => p.slug);

/** Subset of WORK_SLUGS that are mint-accented (INSPIRED). Used by
 *  page.tsx to flip the page colour scheme between sky and mint
 *  depending on which project the user is on. */
export const INSPIRED_SLUGS = INSPIRED.map((p) => p.slug);

/** Every case-study item, flattened with a back-reference to its owning
 *  project. Case studies are per-item (Bloomberg / Liquid each have
 *  two), so deep-links resolve to items, not projects. */
export const ALL_ITEMS = ALL_PROJECTS.flatMap((project) =>
  project.items.map((item) => ({ project, item }))
);

/** Deep-link resolution: item URL-slug → case-study identifier (the
 *  item `number`, which is what WorkSection's tray keys on). Returns
 *  null for an unknown slug so an inbound bad hash is simply ignored. */
export function itemNumberForSlug(slug: string): string | null {
  return ALL_ITEMS.find(({ item }) => item.slug === slug)?.item.number ?? null;
}

/** Reverse: case-study identifier (item `number`) → URL-slug, for
 *  writing the shareable hash when a tray opens. */
export function slugForItemNumber(number: string): string | null {
  return ALL_ITEMS.find(({ item }) => item.number === number)?.item.slug ?? null;
}

export type { Project, ProjectItem, CaseStudyContent, ReelItem, Credit } from "./types";
