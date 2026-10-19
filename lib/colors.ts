export const COLORS = {
  sage:  "#D7DAAC",
  ink:   "#151515",
  sky:   "#94D9F3",
  mint:  "#A8D8B9",
  coral: "#EC7A55",
  /** Approach signature — the homepage Approach panel and the /approach page. */
  lavender: "#C4B6F2",
} as const;

export type Section =
  | "loading"
  | "who"
  | "name"
  | "nameMint"
  | "hired"
  | "inspired"
  | "approachIntro"
  | "approach"
  | "contactIntro"
  | "contact";

export const SECTION_COLORS: Record<Section, { bg: string; fg: string; accent: string }> = {
  loading:      { bg: COLORS.sage,  fg: COLORS.ink,  accent: COLORS.ink  },
  who:          { bg: COLORS.ink,   fg: COLORS.sage, accent: COLORS.sage },
  // Intermediate scheme between Name and Work (sky text on ink bg) —
  // bridges the sage → sky accent during the boundary scroll. Also
  // doubles as the Work → Contact pre-scroll invert when the active
  // Work accent is sky (i.e., no INSPIRED project is open).
  name:         { bg: COLORS.ink,   fg: COLORS.sky,   accent: COLORS.sky   },
  // Mint variant of "name" — used when an INSPIRED project (TUESGAY /
  // Paintings) is open and the user is scrolling toward Contact, so the
  // mint → ink invert plays before the coral starts coming in.
  nameMint:     { bg: COLORS.ink,   fg: COLORS.mint,  accent: COLORS.mint  },
  hired:        { bg: COLORS.sky,   fg: COLORS.ink,   accent: COLORS.ink   },
  inspired:     { bg: COLORS.mint,  fg: COLORS.ink,   accent: COLORS.ink   },
  // Approach panel (between Work and Contact). Same intro → settled pair
  // as Contact: lavender text on ink while the panel scrolls in, then
  // ink on lavender once it lands. "approachIntro" also serves as the
  // Approach → Contact pre-scroll invert.
  approachIntro: { bg: COLORS.ink,      fg: COLORS.lavender, accent: COLORS.lavender },
  approach:      { bg: COLORS.lavender, fg: COLORS.ink,      accent: COLORS.ink      },
  // Intermediate scheme between Work and Contact (coral text on ink bg).
  // Mirrors the "name" pattern for the inbound coral accent so the
  // Work → Contact transition reads as: sky/mint bg → ink bg (with sky
  // OR mint text) → ink bg (with coral text via "contactIntro") →
  // coral bg ("contact"). Each colour change rides the smooth-scroll.
  contactIntro: { bg: COLORS.ink,   fg: COLORS.coral, accent: COLORS.coral },
  contact:      { bg: COLORS.coral, fg: COLORS.ink,   accent: COLORS.ink   },
};
