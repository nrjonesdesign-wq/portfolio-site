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
      number: "09",
      slug: "morning-brief",
      description:
        "Design and build of a daily newsletter of my own: 598 sources, 49 sections, and an AI curation layer with a written editorial voice.",
      caseStudy: {
        title: "Morning Brief\nEditorial System\nDesign & Build",
        brief:
          "I wanted one morning read covering everything I actually care about—design, art, comics, music, film, books, Los Angeles, labor and politics—without the algorithm, the hype cycle, or the press-release churn. Nothing like it existed, so I built it.\n\nMorning Brief pulls from 598 hand-picked sources across 49 sections, runs them through an AI curation layer, and lands in my inbox as a designed HTML email every morning.",
        challenge:
          "At that scale, curation is an information-architecture problem before it's a design problem. Forty-nine sections have to be scannable over a cup of coffee, and the biggest one, Practice & Craft, carries ten subsections on its own.\n\nThe harder part was taste. Left alone, an AI filter drifts to the middle of the road. To get a feed that sounds like me, the editorial point of view had to be written down: what to include, what to rule out, and how to say it. And then there's email, where every client renders HTML a little differently.",
        solution: [
          "I wrote the editorial voice like a creative brief: direct, substantive, unfussy, active voice, name things plainly. The exclusions are as specific as the inclusions—no celebrity coverage, no drop culture, no franchise IP. Patterns in what I love became reusable rules, like “rigorous wonder”: cross-disciplinary writing that earns its awe by showing the mechanism.",
          "Under the hood it's Python, the Claude API, RSS parsing, and scheduled GitHub Actions, with state tracking so nothing repeats from day to day—all feeding a templated email I designed and maintain in production.",
        ],
        // Self-initiated — no client, so the CLIENT meta block is skipped.
        services:
          "Editorial design, information architecture, HTML email design, typography, prompt design, Python development, automation",
        // Real photos standing in for the Food section's article images.
        // CC BY photos require attribution; CC0 / Unsplash are credited as a courtesy.
        credits: [
          {
            role: "Photo, kobujime",
            person: "Naotake Murayama, CC BY 2.0",
            href: "https://commons.wikimedia.org/wiki/File:Kobu_Jime_(Sashimi_Marinated_on_Kombu_Seaweed)_(5095532256).jpg",
          },
          {
            role: "Photo, boneset",
            person: "Superior National Forest, CC BY 2.0",
            href: "https://commons.wikimedia.org/wiki/File:Eupatorium_perfoliatum_1_(5097903790).jpg",
          },
          {
            role: "Photo, fresh pasta",
            person: "Vincent Dörig / Unsplash",
            href: "https://unsplash.com/photos/a-person-is-using-a-pasta-machine-to-make-pasta-mciRIMaxiAM",
          },
          {
            role: "Photos, char siu bao & preserves",
            person: "Wikimedia Commons, CC0",
            href: "https://commons.wikimedia.org/wiki/File:Canned_jams,_salsa,_ketchup,_chutney,_tomato_sauce,_tomato_paste_pickles,_bruscetta_(20090617359).jpg",
          },
        ],
        // Override the INSPIRED horizontal default: these are wide
        // device mockups and screen captures, which read best stacked.
        reelDirection: "vertical",
        // Every slide and clip is 2400×1500 (16:10) — match it so tiles
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
            label: "Stand-in article images",
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
            alt: "Morning Brief — ten sections and their 41 subsections, each with its tagline",
          },
          {
            kind: "video",
            src: "/videos/morning-brief/scroll-food.mp4",
            poster: "/videos/morning-brief/scroll-food-poster.jpg",
            // Silent screen capture — no audio track, so no play-audio hint.
            hasAudio: false,
            title: "Morning Brief — scrolling the Food section on a laptop",
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
            alt: "Morning Brief system — 598 sources in, one email out",
          },
        ],
      },
    },
  ],
};
