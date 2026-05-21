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

export type { Project, ProjectItem, CaseStudyContent, ReelItem, Credit } from "./types";
