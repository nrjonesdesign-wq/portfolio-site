// Default ease-out — most animations (rule draws, color inverts, paragraph reveals, card swaps)
export const EASE = [0.22, 1, 0.36, 1] as const;

// Spring-style with overshoot — entrances that "land"
// (planet entrance, letter cascades, anything bouncing into place)
export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

export const DUR = {
  fast: 0.25,
  base: 0.5,
  slow: 0.8,
} as const;

export const STAGGER = {
  letter: 0.03,
  item: 0.08,
  section: 0.12,
} as const;
