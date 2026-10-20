/**
 * UAP silhouettes for the StarField fly-by. Each is inner SVG markup for a
 * 48×24 viewBox, drawn in `currentColor` (so it inverts with the section)
 * plus small white "lights", in the same layered-opacity style as the
 * original saucer. UfoFlyby picks one at random per appearance.
 */
export type UapShape = { name: string; svg: string };

const LIGHT = 'fill="#ffffff" opacity="0.95"';

export const UAP_SHAPES: UapShape[] = [
  {
    // The classic: domed disc with belly lights.
    name: "Saucer",
    svg: `
      <path d="M 14 14 Q 24 -1 34 14 Z" fill="currentColor" opacity="0.55"/>
      <ellipse cx="24" cy="14" rx="22" ry="4" fill="currentColor" opacity="0.9"/>
      <ellipse cx="24" cy="15" rx="14" ry="2.5" fill="currentColor" opacity="0.55"/>
      <circle cx="12" cy="15.4" r="0.9" ${LIGHT}/>
      <circle cx="24" cy="16.2" r="0.9" ${LIGHT}/>
      <circle cx="36" cy="15.4" r="0.9" ${LIGHT}/>`,
  },
  {
    // 2004 Nimitz "Tic Tac": a featureless white-ish capsule.
    name: "Tic Tac",
    svg: `
      <rect x="6" y="7" width="36" height="10" rx="5" fill="currentColor" opacity="0.9"/>
      <rect x="10" y="8.6" width="26" height="2.2" rx="1.1" fill="#ffffff" opacity="0.35"/>
      <rect x="6" y="7" width="36" height="10" rx="5" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="3"/>`,
  },
  {
    // "Black triangle": flat delta with a light at each corner.
    name: "Triangle",
    svg: `
      <path d="M 24 2 L 45 21 L 3 21 Z" fill="currentColor" opacity="0.9"/>
      <path d="M 24 8 L 37 19 L 11 19 Z" fill="currentColor" opacity="0.55"/>
      <circle cx="24" cy="4.6" r="1.1" ${LIGHT}/>
      <circle cx="6.2" cy="19.6" r="1.1" ${LIGHT}/>
      <circle cx="41.8" cy="19.6" r="1.1" ${LIGHT}/>
      <circle cx="24" cy="14.5" r="1.4" fill="#ffffff" opacity="0.5"/>`,
  },
  {
    // Glowing orb with a soft halo.
    name: "Orb",
    svg: `
      <circle cx="24" cy="12" r="11" fill="currentColor" opacity="0.15"/>
      <circle cx="24" cy="12" r="8" fill="currentColor" opacity="0.35"/>
      <circle cx="24" cy="12" r="5.5" fill="currentColor" opacity="0.9"/>
      <circle cx="22" cy="10" r="1.6" fill="#ffffff" opacity="0.7"/>`,
  },
  {
    // Cigar / cylinder with a row of portholes.
    name: "Cigar",
    svg: `
      <ellipse cx="24" cy="12" rx="23" ry="4.5" fill="currentColor" opacity="0.9"/>
      <ellipse cx="24" cy="10.6" rx="18" ry="1.6" fill="currentColor" opacity="0.55"/>
      <circle cx="12" cy="13" r="0.9" ${LIGHT}/>
      <circle cx="18" cy="13.3" r="0.9" ${LIGHT}/>
      <circle cx="24" cy="13.4" r="0.9" ${LIGHT}/>
      <circle cx="30" cy="13.3" r="0.9" ${LIGHT}/>
      <circle cx="36" cy="13" r="0.9" ${LIGHT}/>`,
  },
  {
    // "Cube in a sphere": dark cube inside a translucent shell.
    name: "Cube-in-sphere",
    svg: `
      <circle cx="24" cy="12" r="10.5" fill="currentColor" opacity="0.2"/>
      <circle cx="24" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-opacity="0.6" stroke-width="1"/>
      <rect x="19.5" y="7.5" width="9" height="9" fill="currentColor" opacity="0.9" transform="rotate(45 24 12)"/>
      <circle cx="24" cy="12" r="1" ${LIGHT}/>`,
  },
  {
    // Boomerang / chevron with lights along the leading edge.
    name: "Boomerang",
    svg: `
      <path d="M 2 19 L 24 5 L 46 19 L 40 21 L 24 11 L 8 21 Z" fill="currentColor" opacity="0.9"/>
      <circle cx="6" cy="19.6" r="1" ${LIGHT}/>
      <circle cx="15" cy="13.8" r="1" ${LIGHT}/>
      <circle cx="24" cy="8" r="1" ${LIGHT}/>
      <circle cx="33" cy="13.8" r="1" ${LIGHT}/>
      <circle cx="42" cy="19.6" r="1" ${LIGHT}/>`,
  },
];
