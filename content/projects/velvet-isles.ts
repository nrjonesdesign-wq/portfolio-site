import { type Project } from "./types";

const reel = (file: string, label: string, alt: string) => ({
  kind: "image" as const,
  src: `/case-study/velvet-isles/${file}`,
  label,
  alt,
});

export const velvetIsles: Project = {
  slug: "velvet-isles",
  name: "Velvet Isles",
  disciplines:
    "Art Direction, Brand Guidelines, Identity, Logo Design, Packaging, Typography",
  previewLabel: "Velvet Isles — Brand Identity",
  accent: "sky",
  items: [
    {
      number: "06",
      slug: "velvet-isles",
      description:
        "Brand identity for an importer of Comoros vanilla, with one color per product line so the range can grow without a rebrand.",
      caseStudy: {
        title: "Vanilla Importer\nVelvet Isles\nBrand Identity",
        brief:
          "Refine a vanilla importer's in-house identity into a production-ready brand system, built to grow from vanilla into four more products.",
        challenge:
          "Velvet Isles imports vanilla directly from growers in the Comoros Islands and sells it to chefs. They came to me with an unusually detailed brief: a customs-ledger look they called “The Manifest,” a working identity in IBM Plex Mono, and an open invitation to challenge any of it.\n\nThe packaging was fixed: a folded kraft envelope with a tied-on manila tag. The system also had to stretch to coffee, cacao, black pepper, and ylang-ylang, and later a French edition, without a rebrand.\n\nRather than start over, I built three design territories inside their direction, then three mockup suites on the real envelope and tag, so the client could react to concrete pieces at every step.",
        solution: [
          "The client chose Heritage Modern, which pairs vintage type, stamps, and form grids with bold, modern color. I codified it into a 14-page Brand Manifest covering the Oswald wordmark, a four-point star fixmark, a three-font type system, texture and stamps, voice, and photo and illustration direction.",
          "Color became the organizing principle. Each product line owns one color, so adding black pepper means picking up Stamp Red, not redesigning the brand. Herbarium plates from a single 19th-century botanical atlas give every product a matching specimen illustration.",
        ],
        client: "Velvet Isles",
        clientLogo: "/logos/VelvetIsles_logo.svg",
        services:
          "Brand Identity, Logo Design, Typography, Packaging, Art Direction, Brand Guidelines",
        credits: [],
        reel: [
          reel("VI_01-cover.jpg", "Brand Manifest", "Velvet Isles — Brand Manifest cover"),
          reel("VI_03-territories.gif", "Territories 1–3 · Modern Minimalism, Bespoke Batches, Historic Heritage", "Velvet Isles — animated cycle of type specimens for three design territories: Modern Minimalism, Bespoke Batches, Historic Heritage"),
          reel("VI_04-suites.jpg", "Suites 1–3 · Stamp-forward, Clean & Contemporary, Heritage Modern", "Velvet Isles — packaging mockups for three design suites"),
          reel("VI_05-suite3-digital.jpg", "Suite 3 · Heritage Modern · Digital", "Velvet Isles — Heritage Modern product list"),
          reel("VI_06-wordmark.jpg", "Manifest · Wordmark", "Velvet Isles — wordmark"),
          reel("VI_07-fixmark.jpg", "Manifest · Fixmark", "Velvet Isles — fixmark"),
          reel("VI_08-type.jpg", "Manifest · Type Families", "Velvet Isles — type families"),
          reel("VI_09-colors.jpg", "Manifest · Colors", "Velvet Isles — product and utility colors"),
          reel("VI_10-products.jpg", "Manifest · Products", "Velvet Isles — product range by color"),
          reel("VI_11-texture.jpg", "Manifest · Texture, Grids & Stamps", "Velvet Isles — texture, form grid, and stamps"),
          reel("VI_12-illustration.jpg", "Manifest · Illustration", "Velvet Isles — herbarium-style illustration"),
        ],
      },
    },
  ],
};
