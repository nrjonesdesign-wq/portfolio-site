/**
 * UAP silhouettes for the StarField fly-by, drawn as pixel sprites to
 * match the star field's square-pixel frames. Each shape is a 24×12 grid
 * (one character per pixel, rendered as 2×2 squares in a 48×24 viewBox
 * with crisp edges). Edit the grids directly:
 *
 *   .  empty          #  body (currentColor 0.9)
 *   +  shading (0.55) o  halo (0.25)       f  faint fill (0.15)
 *   *  light (white)  =  dim light / sheen (white 0.45)
 *
 * Colour follows the section via currentColor. UfoFlyby picks one at
 * random per appearance (never the same twice in a row).
 */
type UapGrid = { name: string; grid: string[] };

const GRIDS: UapGrid[] = [
  {
    name: "Saucer",
    grid: [
      "........................",
      "........................",
      ".........++++++.........",
      "........++++++++........",
      ".......++++++++++.......",
      "...##################...",
      ".######################.",
      "..###*###*####*###*###..",
      "......++++++++++++......",
      "........................",
      "........................",
      "........................",
    ],
  },
  {
    name: "Tic Tac",
    grid: [
      "........................",
      "........................",
      "......oooooooooooo......",
      "....oo############oo....",
      "...o###=========####o...",
      "..o##################o..",
      "..o##################o..",
      "...o################o...",
      "....oo############oo....",
      "......oooooooooooo......",
      "........................",
      "........................",
    ],
  },
  {
    name: "Triangle",
    grid: [
      "........................",
      "...........**...........",
      "..........####..........",
      ".........######.........",
      "........########........",
      ".......###++++###.......",
      ".....###++++++++###.....",
      "....###++++==++++###....",
      "...###++++++++++++###...",
      "..###++++++++++++++###..",
      ".*####################*.",
      "........................",
    ],
  },
  {
    name: "Orb",
    grid: [
      "...........oo...........",
      ".........oooooo.........",
      "........o++++++o........",
      ".......o++####++o.......",
      ".......o+#==###+o.......",
      "......oo+#=####+oo......",
      "......oo+######+oo......",
      ".......o+######+o.......",
      ".......o++####++o.......",
      "........o++++++o........",
      ".........oooooo.........",
      "...........oo...........",
    ],
  },
  {
    name: "Cigar",
    grid: [
      "........................",
      "........................",
      "........................",
      "........########........",
      "..####++++++++++++####..",
      ".######################.",
      ".####*###*####*###*####.",
      "..####################..",
      "........########........",
      "........................",
      "........................",
      "........................",
    ],
  },
  {
    name: "Cube-in-sphere",
    grid: [
      "...........oo...........",
      ".........ooffoo.........",
      "........offffffo........",
      ".......offf##fffo.......",
      ".......off####ffo.......",
      "......off##**##ffo......",
      "......off##**##ffo......",
      ".......off####ffo.......",
      ".......offf##fffo.......",
      "........offffffo........",
      ".........ooffoo.........",
      "...........oo...........",
    ],
  },
  {
    name: "Boomerang",
    grid: [
      "........................",
      "........................",
      "...........**...........",
      "..........####..........",
      "........###..###........",
      "......*###....###*......",
      ".....###........###.....",
      "...###............###...",
      ".*###..............###*.",
      "###..................###",
      "#......................#",
      "........................",
    ],
  },
];

const STYLE: Record<string, string> = {
  "#": 'fill="currentColor" opacity="0.9"',
  "+": 'fill="currentColor" opacity="0.55"',
  o: 'fill="currentColor" opacity="0.25"',
  f: 'fill="currentColor" opacity="0.15"',
  "*": 'fill="#ffffff" opacity="0.95"',
  "=": 'fill="#ffffff" opacity="0.45"',
};

/** Grid → SVG markup; runs of the same pixel type merge into one rect. */
function toSvg(grid: string[]): string {
  let out = "";
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (!STYLE[c]) {
        x++;
        continue;
      }
      const x0 = x;
      while (x < row.length && row[x] === c) x++;
      out += `<rect x="${x0 * 2}" y="${y * 2}" width="${(x - x0) * 2}" height="2" ${STYLE[c]}/>`;
    }
  });
  return out;
}

export type UapShape = { name: string; svg: string };

export const UAP_SHAPES: UapShape[] = GRIDS.map((g) => ({
  name: g.name,
  svg: toSvg(g.grid),
}));
