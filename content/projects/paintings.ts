import { type Project } from "./types";

export const paintings: Project = {
  slug: "paintings",
  name: "Paintings",
  disciplines: "Acrylic on Canvas, Oil on Canvas, Personal Art Practice",
  previewLabel: "Paintings — Studio Practice",
  accent: "mint",
  items: [
    {
      number: "07",
      description:
        "An ongoing study in observation and memory. A sustaining personal fine art practice and outlet for my creative nervous energy.",
      caseStudy: {
        title: "Paintings",
        brief:
          "A personal art practice, (without formal training) started in earnest during the COVID-19 pandemic.",
        challenge:
          "I've enjoyed drawing for as long as I can remember and occasionally dabbled in painting, but it wasn't until the pandemic years of COVID-19 that I embraced it as a practice. My journey began with a large (for me) acrylic, on a 25\" x 24\" canvas: a still life based on a staged photograph I took.\n\nI attempt to approach each canvas with a Beginner's Mind, allowing my curiosity and intuition to guide me. I accept the filter of distortion that arises from my hand's translation of the source image to the canvas.\n\nI believe these “imperfections” reflect my particular subjectivity and ability to express it—similar to our experience of memory itself.",
        solution: [
          "My paintings are deeply personal, typically cropped from my own photographs. These moments include me and my partner at a gay bar in Silverlake, years before we started dating; my beloved Shih Tzu, Olive; the two of them walking down a Brooklyn street; a pair of startled deer caught in the headlights on a country road near my childhood Indiana home; a revelatory first encounter with the sublime fast-food culture of Southern California.",
          "Each piece holds a memory, filtered through my perspective, and rendered in paint.",
        ],
        // No client — personal practice. CaseStudyPanel skips the CLIENT
        // meta block when both client and clientLogo are unset.
        services: "Oil on canvas, Acrylic on canvas",
        // Override the meta-block label so "services" reads as "mediums"
        // for this fine-art practice rather than the agency-speak default.
        servicesLabel: "MEDIUMS",
        // Paintings are intentionally cropped from the artist's hand;
        // letterbox in the reel rather than re-cropping a second time.
        reelFit: "contain",
        // Match the painting photos' predominant white studio
        // background so the letterbox negative space reads as the
        // canvas surround rather than a gallery wall.
        reelBg: "#ffffff",
        credits: [],
        reel: [
          { kind: "image", src: "/case-study/paintings/akbar.jpg", alt: "Painting — Akbar (Silverlake bar memory)" },
          { kind: "image", src: "/case-study/paintings/olive.jpg", alt: "Painting — Olive the Shih Tzu" },
          { kind: "image", src: "/case-study/paintings/brooklyn.jpg", alt: "Painting — Brooklyn walk" },
          { kind: "image", src: "/case-study/paintings/deer.jpg", alt: "Painting — startled deer on an Indiana road" },
          { kind: "image", src: "/case-study/paintings/shorts.jpg", alt: "Painting — Southern California fast-food still life" },
          { kind: "image", src: "/case-study/paintings/chris.jpg", alt: "Painting — Chris portrait" },
        ],
      },
    },
  ],
};
