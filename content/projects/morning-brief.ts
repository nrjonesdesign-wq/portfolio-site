import { type Project } from "./types";

export const morningBrief: Project = {
  slug: "morning-brief",
  name: "Morning Brief",
  disciplines:
    "AI Curation, Automation, Creative Coding, Editorial Design, Email Design, Information Architecture, Python, Typography",
  previewLabel: "Morning Brief — Daily Newsletter, Design & Build",
  accent: "mint",
  items: [
    {
      number: "07",
      slug: "morning-brief",
      description:
        "Design and build of a daily newsletter of my own: 600+ sources, 50 subsections, and an AI curation layer with a written editorial voice.",
      caseStudy: {
        title: "Morning Brief\nEditorial System\nDesign & Build",
        brief:
          "I wanted one morning read covering everything I actually care about—design, art, comics, music, film, books, Los Angeles, labor and politics—without the algorithm, the hype cycle, or the press-release churn. Nothing like it existed, so I built it.\n\nMorning Brief pulls from 600+ hand-picked sources across 50 subsections, runs them through an AI curation layer, and lands in my inbox as a designed HTML email every morning.",
        challenge:
          "I wanted a product I could keep iterating on, with myself as the primary user. Every morning's read is a usability test: what I skip, what I miss, and what I forward become the next round of changes.\n\nAt that scale, curation is an information-architecture problem before it's a design problem. Fifty subsections across ten sections have to be scannable over a cup of coffee, and the biggest section, Practice & Craft, carries ten of them on its own.\n\nThe harder part was taste. Left alone, an AI filter drifts to the middle of the road. To get a feed that sounds like me, the editorial point of view had to be written down: what to include, what to rule out, and how to say it. And then there's email, where every client renders HTML a little differently.",
        solution: [
          "I wrote the editorial voice like a creative brief: direct, substantive, unfussy, active voice, name things plainly. The exclusions are as specific as the inclusions—no celebrity coverage, no drop culture, no franchise IP. Patterns in what I love became reusable rules, like “rigorous wonder”: cross-disciplinary writing that earns its awe by showing the mechanism.",
          "Under the hood it's Python, the Claude API, RSS parsing, and scheduled GitHub Actions, with state tracking so nothing repeats from day to day—all feeding a templated email I designed and maintain in production.",
        ],
        // Self-initiated — no client, so the CLIENT meta block is skipped.
        services:
          "Editorial design, information architecture, HTML email design, typography, prompt design, Python development, automation",
        // No Credits list; the two CC BY photos are credited in reel labels.
        credits: [],
        // Override the INSPIRED horizontal default: these are wide
        // device mockups and screen captures, which read best stacked.
        reelDirection: "vertical",
        // Slides are 4800×3000 and clips 3200×2000 (both 16:10) — match it so tiles
        // show each one full width, uncropped.
        reelAspect: "8 / 5",
        reel: [
          {
            // Laptop (Food) + phone (Science & Nature); the phone's
            // river-mussels photo runs its looping water-light animation.
            kind: "video",
            src: "/videos/morning-brief/hero-devices.mp4",
            poster: "/videos/morning-brief/hero-devices-poster.jpg",
            hasAudio: false,
            title: "Morning Brief on laptop and phone — Food and Science & Nature sections",
            // The article photos in every mockup are AI stand-ins for the
            // newswire images the live issue pulls from each source.
            // The kobujime photo shows at the foot of the laptop screen;
            // it's CC BY 2.0, so it's credited here (no Credits list).
            label: "Stand-in article images · Photo: N. Murayama, CC BY 2.0",
          },
          {
            kind: "image",
            src: "/case-study/morning-brief/news-politics-devices.jpg",
            alt: "Morning Brief News & Politics on three phones — World Headlines, Palestine coverage, and The Helpers",
          },
          {
            kind: "video",
            src: "/videos/morning-brief/scroll-science-nature.mp4",
            poster: "/videos/morning-brief/scroll-science-nature-poster.jpg",
            // Silent screen capture — no audio track, so no play-audio hint.
            hasAudio: false,
            title: "Morning Brief — scrolling Science & Nature on a phone",
          },
          {
            kind: "image",
            src: "/case-study/morning-brief/breadth-spread.jpg",
            alt: "Morning Brief — ten sections and all 50 subsections, each with its tagline",
          },
          {
            kind: "video",
            src: "/videos/morning-brief/scroll-food.mp4",
            poster: "/videos/morning-brief/scroll-food-poster.jpg",
            // Silent screen capture — no audio track, so no play-audio hint.
            hasAudio: false,
            title: "Morning Brief — scrolling the Food section on a laptop",
            // CC BY 2.0 photos in this clip need visible credit.
            label: "Photos: N. Murayama, Superior Natl. Forest · CC BY 2.0",
          },
          {
            kind: "image",
            src: "/case-study/morning-brief/editorial-voice.jpg",
            alt: "Morning Brief editorial voice — Direct, substantive, unfussy. Active voice. Name things plainly.",
          },
          {
            kind: "video",
            src: "/videos/morning-brief/scroll-practice-craft.mp4",
            poster: "/videos/morning-brief/scroll-practice-craft-poster.jpg",
            // Silent screen capture — no audio track, so no play-audio hint.
            hasAudio: false,
            title: "Morning Brief — scrolling the Practice & Craft spotlights",
          },
          {
            kind: "image",
            src: "/case-study/morning-brief/system-diagram.jpg",
            alt: "Morning Brief system — 600+ sources in, one email out",
          },
        ],
      },
    },
  ],
};
