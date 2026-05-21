import { type Project } from "./types";

export const revolutionaryChange: Project = {
  slug: "revolutionary-change",
  name: "Revolutionary Change",
  disciplines:
    "Apparel Design, Audio Production, Brand Guidelines, Identity, Logo Design, Motion",
  previewLabel: "Revolutionary Change — YouTube Rebrand",
  accent: "sky",
  items: [
    {
      number: "05",
      description:
        "Branding and opening animation for a politically progressive YouTube channel.",
      caseStudy: {
        title: "YouTube Channel\nRevolutionary Change\nRebrand",
        brief:
          "Create a new brand identity, opening animation, and T-shirt design for this progressive YouTube channel.",
        challenge:
          "While their initial branding based on Jen's congressional run was appropriate for when they first started out, the hosts were ready to take the channel in a more overtly “radical” direction, starting with changing the name to Revolutionary Change.\n\nAfter meeting with Jen and Peter, gathering inspiration, and creating and sharing mood boards, I developed several different design directions for them to respond to.\n\nUltimately, we decided to adopt the colors of the Palestinian flag, and combined various elements from the different directions.",
        solution: [
          "Once we had landed on the new logo and branding, I created a Brand Guidelines document, delivered new creative assets for their YouTube page, like the banner and avatar images, and finally a new animated intro for their videos.",
          "I anchored the animation around a song Jen had in mind, and attempted to bring to life the “radical” and gritty aesthetic—mimicking paint-roller, spray painted, and stenciled graffiti. The match, struck and lit from the logo itself, represents the burning passion for justice, as well as the power we wield collectively and as individuals—to ignite change and grow the movement.",
        ],
        client: "Revolutionary Change",
        clientLogo: "/logos/JenChange_logo.svg",
        services: "Brand Identity, Logo Design, Motion, Audio Production",
        credits: [
          { role: "Host", person: "Jen Perlman" },
          { role: "Host", person: "Peter Hager" },
        ],
        reel: [
          {
            kind: "video",
            src: "/videos/revolutionarychange/RC_Intro_003.mp4",
            title: "Revolutionary Change — channel intro animation",
            // Intro animation needs the full strike-and-light beat
            // before the preview moves on; default 3.2s cuts off the
            // match-light reveal mid-flame.
            previewDwellMs: 7000,
          },
          {
            kind: "image",
            src: "/case-study/revolutionarychange/RC_01.jpg",
            alt: "Revolutionary Change — brand identity still 01",
          },
          {
            kind: "video",
            src: "/videos/revolutionarychange/Rage-O-Meter_003.mp4",
            title: "Revolutionary Change — Rage-O-Meter motion 03",
          },
          {
            kind: "image",
            src: "/case-study/revolutionarychange/RC_02.jpg",
            alt: "Revolutionary Change — brand identity still 02",
          },
          {
            kind: "video",
            src: "/videos/revolutionarychange/Rage-O-Meter_POC.mp4",
            title: "Revolutionary Change — Rage-O-Meter POC",
          },
          {
            kind: "image",
            src: "/case-study/revolutionarychange/RC_03.jpg",
            alt: "Revolutionary Change — brand identity still 03",
          },
          {
            kind: "video",
            src: "/videos/revolutionarychange/norm.mp4",
            title: "Revolutionary Change — additional motion piece",
          },
        ],
      },
    },
  ],
};
