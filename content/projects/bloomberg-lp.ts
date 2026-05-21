import { type Project } from "./types";

export const bloombergLp: Project = {
  slug: "bloomberg-lp",
  name: "Bloomberg LP",
  disciplines:
    "Art Direction, Illustration, Infographics, Logo Design, Motion, Motion Graphics, Prototyping, Social, Storyboards, UX / UI, Web Design",
  previewLabel: "Bloomberg 2020 — End of Year Town Hall",
  accent: "sky",
  items: [
    {
      number: "01",
      description:
        "While at Bloomberg, I was tasked with creating the look and feel for the Annual End of Year Town Hall.",
      caseStudy: {
        title: "Bloomberg 2020\nEnd of Year Town Hall",
        brief:
          "Create the art direction and hand off working files for the Annual End of Year Town Hall address from Michael Bloomberg to the employees of Bloomberg LP.",
        challenge:
          "A tight production timeline, a recap of an unprecedented year, and a remote-first audience meant the visual system had to feel fresh, on-brand, and emotionally resonant — without weeks of original asset production.",
        solution: [
          "Given the tight deadline and need for speed, I decided to leverage the visual language (and vector files) from artist DIngding Hu that had been commissioned earlier that year for a quarantine coloring book project.",
          "This playful use of illustration and animation injects some light-hearted humor into a recap of a year of unique challenges, while telling the story from a uniquely Bloomberg perspective.",
          "A nod to remote-work — the computer desktop motif — worked nicely as a conceptual visual framework, allowing a seamless flow between animated vignettes and live-action video segments.",
        ],
        client: "Bloomberg",
        clientLogo: "/logos/Bloomberg_logo.svg",
        services:
          "Art Direction, Storyboards, Motion Graphics, Illustration, Social Media Asset Creation",
        credits: [
          { role: "Original Illustration", person: "DIngding Hu" },
          { role: "Motion Design", person: "Yuko Magoshi" },
        ],
        reel: [
          { kind: "video", src: "/videos/bloomberg/segment-01.mp4", title: "Bloomberg Town Hall — opening" },
          { kind: "video", src: "/videos/bloomberg/segment-02.mp4", title: "Bloomberg Town Hall — segment 2" },
          { kind: "video", src: "/videos/bloomberg/segment-03.mp4", title: "Bloomberg Town Hall — segment 3" },
          { kind: "video", src: "/videos/bloomberg/segment-04.mp4", title: "Bloomberg Town Hall — segment 4" },
          { kind: "video", src: "/videos/bloomberg/segment-05.mp4", title: "Bloomberg Town Hall — segment 5" },
          {
            kind: "image",
            src: "/case-study/bloomberg/static-01.jpg",
            alt: "Bloomberg Town Hall — storyboards and stills",
          },
        ],
      },
    },
    {
      number: "02",
      description:
        "UX / UI design for several Bloomberg websites, including: America's Pledge on Climate Change, Bloomberg Live, Bloomberg Media, Bloomberg Philanthropies annual reports, Bloomberg Media Studios, Bloomberg New Energy Finance, Climate Finance Leadership Initiative, and Global Covenant of Mayors for Climate & Energy.",
      caseStudy: {
        title: "UX / UI design for\nBloomberg websites",
        brief:
          "While a member of the Digital Marketing team within the Bloomberg Creative Studio, we were tasked with designing, launching, and maintaining multiple Bloomberg websites.",
        challenge:
          "Despite being a very small team, we were responsible for a huge amount of Bloomberg's digital footprint. The rapid design and development process necessitated smart design systems to enable efficient deployment.\n\nBeyond the technical and user-centered design aspects, there was also the challenge of navigating multiple internal clients and external stakeholders in order to get everything approved.",
        solution: [
          "The adherence to a strong brand guidelines and design system enabled our team to rapidly design, prototype, build out, and launch a large volume of websites in a relatively short period of time.",
          "Close collaboration with the development team helped us create polished user experiences, and every member of the team acquired extensive experience leading projects and presenting to stakeholders and leadership, facilitating desired outcomes.",
        ],
        client: "Bloomberg",
        clientLogo: "/logos/Bloomberg_logo.svg",
        services:
          "UX / UI, infographics, .JSON animation & motion design, prototype / interaction animation",
        credits: [
          { role: "UX / UI Team Lead", person: "Jon Brzyski" },
          { role: "Lead UX designer", person: "Alexandra Woolsey-Puffer" },
          { role: "UX Design", person: "Benitta Rauscher" },
        ],
        reel: [
          {
            kind: "video",
            src: "/videos/bloomberg-websites/BloombergWebsitesReel.mp4",
            title: "Bloomberg websites — compilation reel",
          },
          {
            kind: "image",
            src: "/case-study/bloomberg-websites/info-connectivity.jpg",
            alt: "Bloomberg Professional Services — Information, connectivity and opportunity hero",
          },
          {
            kind: "video",
            src: "/videos/bloomberg-websites/gcom-screencapture.mp4",
            title: "Global Covenant of Mayors for Climate & Energy — site walkthrough",
          },
          {
            kind: "image",
            src: "/case-study/bloomberg-websites/impact-report.jpg",
            alt: "Bloomberg 2017 Impact Report landing page",
          },
          {
            kind: "video",
            src: "/videos/bloomberg-websites/bloomberg-vision.mp4",
            title: "Bloomberg <Vision> motion piece",
          },
          {
            kind: "image",
            src: "/case-study/bloomberg-websites/from-the-ashes.jpg",
            alt: "From The Ashes — film microsite hero",
          },
          {
            kind: "image",
            src: "/case-study/bloomberg-websites/from-the-ashes-2.jpg",
            alt: "From The Ashes — Voices from the Film grid",
          },
        ],
      },
    },
  ],
};
