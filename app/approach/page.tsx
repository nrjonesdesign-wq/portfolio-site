/* Plain <a> (full page load) rather than next/link for links back to "/":
   the home page reads its #section / #case-study hash and runs its intro +
   snap setup on a fresh mount, which a client-side transition skips. */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import styles from "./approach.module.css";
import { ApproachFooter, ApproachMobileNav, ApproachTint, CopyEmail, NavPlanet } from "./ApproachChrome";
import { DisciplineMarquee } from "@/components/sections/work/WorkSection";

export const metadata: Metadata = {
  title: "Approach — Nathaniel Robert Jones",
  description:
    "How Nathaniel Robert Jones works: foundation, philosophy, process, and the influences behind his visual style.",
};

const EMAIL = "nrjones.design@gmail.com";

/** Case-study deep links resolve via the home page's `/#<item-slug>` hash
 *  handling (see content/projects + DesktopHome/MobileHome). Keep these in
 *  sync with the item slugs in content/projects/*.ts. */
const PROJECTS: {
  meta: string;
  title: string;
  body: string;
  bullets?: string[];
  link?: { href: string; label: string };
  soon?: boolean;
  wide?: boolean;
}[] = [
  {
    meta: "Liquid Agency · 2024–25",
    title: "Liquid Website UX",
    body: "A modular build on grids, smart layouts, and reusable components, with AI tools for image and animation. The visual language relies on generous negative space, pacing, typography, motion, and a strong brand voice.",
    link: { href: "/#liquid-website-redesign", label: "[ View case study ]" },
  },
  {
    meta: "Liquid × Avasta",
    title: "The Challenger Index",
    body: "A flagship digital white paper whose visual language merged two brands, one of them mid-transition. Typography, color, and voice did the work of synthesis, and the system evolved once the new brand landed. AI image generation supported the illustration.",
    link: { href: "/#liquid-challenger-index", label: "[ View case study ]" },
  },
  {
    meta: "Brand identity",
    title: "Revolutionary Change Rebrand",
    body: "A more revolutionary identity to match the show's tone, values, and the urgency of the political moment. The goal: welcome progressives, committed leftists, and newcomers alike, and fire up a community of YouTube viewers, Patreon supporters, and activists.",
    bullets: [
      "Audience psychographics and mood boards",
      "Concepts, mockups, and a brand guidelines document",
      "Client buy-in through goal alignment and rounds of feedback",
    ],
    link: { href: "/#revolutionary-change", label: "[ View case study ]" },
  },
  {
    meta: "Brand identity",
    title: "Velvet Isles",
    body: "A thoughtful brief, which the client built with help from AI, gave me rich context to explore from. As with every project, close collaboration, iteration, and refinement carried the identity through to buy-in.",
    soon: true,
  },
  {
    meta: "Self-initiated · This site",
    title: "Personal Portfolio & Brand",
    body: "My first experiment building with Claude Code. I started by surveying portfolio sites I admire, noted the features I wanted, prototyped fully in Figma with notes, then iterated in code. The goal was to show as well as tell: solid structure and hierarchy, high-impact sans-serif type with personality, a palette of muted yet saturated color fields, and interactions that surprise and reward exploration.",
    link: { href: "/", label: "[ You're looking at it ]" },
    wide: true,
  },
];

/** Same comma-list format as a project's `disciplines`, rendered by the
 *  home page's DisciplineMarquee so the type, ★ separators and scroll
 *  speed match the Work rows exactly. */
const MARQUEE = "Research, Collaboration, Iteration, Craft, Clarity, Curiosity, Brand Systems, UX / UI, Typography, Motion";

export default function ApproachPage() {
  return (
    <div className={styles.page}>
      <ApproachTint />
      <ApproachMobileNav />

      <nav className={`${styles.nav} ${styles.light}`} data-scheme="light" aria-label="Site">
        <div className={`${styles.wrap} ${styles.navRow}`}>
          <NavPlanet />
          <ul className={styles.navList}>
            <li><a href="/#who">WHO</a></li>
            <li><a href="/#work">WORK</a></li>
            <li><a href="/approach" aria-current="page">APPROACH</a></li>
            <li><a href="#contact">CONTACT</a></li>
          </ul>
        </div>
      </nav>

      <header className={`${styles.hero} ${styles.light}`} data-scheme="light">
        <div className={styles.wrap}>
          <span className={styles.label}>[ Approach ]</span>
          <h1 className={styles.h1}>How I work.</h1>
          <div className={styles.lede}>
            <span className={styles.label}>Process · Philosophy · Influences</span>
            <p>I&apos;m a designer, which means I&apos;m a problem solver first, and my taste is one of the best tools I bring to the problem. I apply it with intent, in service of the goal and the audience. Painting and music keep that eye sharp. Here is what shapes the work I do for clients.</p>
          </div>
        </div>
      </header>

      <section className={`${styles.band} ${styles.dark}`} data-scheme="dark">
        <div className={styles.wrap}>
          <div className={styles.head}>
            <span className={styles.label}>[ Foundation ]</span>
            <h2 className={styles.h2}>Where it starts</h2>
          </div>
          <div className={styles.cols3}>
            <div className={styles.col}>
              <span className={styles.label}>Education</span>
              <h3 className={styles.h3}>BFA, Communication Design, Washington University in St. Louis</h3>
              <ul>
                <li>A conceptual grounding in art and cultural history</li>
                <li>Visual design fundamentals: hierarchy, color, composition, typography, layout, pacing, contrast</li>
                <li>The power of word and image together</li>
                <li>An illustration emphasis: visual storytelling, durable metaphors, distilling an idea to its core</li>
              </ul>
            </div>
            <div className={styles.col}>
              <span className={styles.label}>Experience</span>
              <h3 className={styles.h3}>Nearly 20 years across enterprise, startups, agency, and freelance</h3>
              <ul>
                <li>Bloomberg, LearnVest, Nifty&apos;s, Liquid Agency, and my own practice</li>
                <li>Helped shape and launch the visual language of LearnVest, Liquid, Velvet Isles, and Revolutionary Change</li>
                <li>Worked inside cross-functional teams with marketing, engineering, product, UX research, subject experts, and the C-suite</li>
              </ul>
            </div>
            <div className={styles.col}>
              <span className={styles.label}>Craft</span>
              <h3 className={styles.h3}>Care, precision, intention, execution</h3>
              <ul>
                <li>I teach myself new tools, techniques, and technologies as they emerge</li>
                <li>I identify with the audience and use what I learn to tune their experience</li>
              </ul>
              <blockquote className={styles.quote}>&ldquo;Meaning, memorability, clarity.&rdquo;<cite>— Susan Kare</cite></blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.band} ${styles.light}`} data-scheme="light">
        <div className={styles.wrap}>
          <div className={styles.head}>
            <span className={styles.label}>[ Philosophy ]</span>
            <h2 className={styles.h2}>What I believe about the work</h2>
          </div>
          <ul className={styles.tenets}>
            <li>
              <h3 className={styles.h3}>Taste, applied with judgment.</h3>
              <p>My taste is a big part of what clients hire me for. I apply it deliberately, tuned by what I learn about the audience, so every aesthetic choice earns its place and resonates with the people it&apos;s for.</p>
            </li>
            <li>
              <h3 className={styles.h3}>Serve the user, and the business follows.</h3>
              <p>I advocate for the user. That means knowing best practices well, championing them, and staying curious and empathetic about who I&apos;m designing for.</p>
            </li>
            <li>
              <h3 className={styles.h3}>Nobody does their best work in a silo.</h3>
              <p>The smartest solutions come from different minds working toward a shared goal. I earn stakeholder buy-in by collaborating closely from the start, agreeing on goals and limits, and presenting work clearly. With senior stakeholders, the real skill is reading the context and listening closely, including to what goes unsaid.</p>
            </li>
            <li>
              <h3 className={styles.h3}>Stay humble.</h3>
              <p>I welcome feedback and treat every round as a chance to sharpen the work. Experimentation and iteration are how good work moves forward.</p>
            </li>
            <li>
              <h3 className={styles.h3}>Stay curious.</h3>
              <p>I absorb the visual culture around me constantly. Books, records, museums, openings, concerts, nightlife, travel, and time in nature all refill the well, and they feed a growing archive of reference I draw on every day.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className={`${styles.band} ${styles.dark}`} data-scheme="dark">
        <div className={styles.wrap}>
          <div className={styles.head}>
            <span className={styles.label}>[ Process ]</span>
            <h2 className={styles.h2}>From brief to build</h2>
          </div>
          <ol className={styles.steps}>
            <li>
              <h3 className={styles.h3}>Define the problem</h3>
              <p>I listen actively, take careful notes, and confirm stakeholders agree on the goals, challenges, and limits before any design begins.</p>
            </li>
            <li>
              <h3 className={styles.h3}>Research</h3>
              <p>I gather everything I can about the subject. The deeper I know the material, the better my recommendations. Front-loading the study is how I make decisions that land.</p>
              <p className={styles.aside}>One of my favorite parts of this career.</p>
            </li>
            <li>
              <h3 className={styles.h3}>Sketch and share</h3>
              <p>Mind maps, sketches, whiteboards, and wireframes. I think visually, so getting ideas on paper is how I find connections. Sharing early keeps my read of the brief aligned and lets us vet directions before they get expensive.</p>
            </li>
            <li>
              <h3 className={styles.h3}>Experiment and refine</h3>
              <p>Once I know the material, I explore, prototype, and iterate, then refine the strongest direction through rounds of feedback.</p>
            </li>
          </ol>
          <div className={styles.toolbox}>
            <span className={styles.label}>Tools&nbsp;→</span>
            {["Pen & paper", "Miro", "Figma", "Illustrator", "Photoshop", "InDesign", "Claude Code"].map((t) => (
              <span key={t} className={styles.chip}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.band} ${styles.light}`} data-scheme="light">
        <div className={styles.wrap}>
          <div className={styles.head}>
            <span className={styles.label}>[ Influences ]</span>
            <h2 className={styles.h2}>What shapes my visual style</h2>
          </div>
          <div className={`${styles.cols3} ${styles.infl}`}>
            <div className={styles.col}>
              <span className={styles.label}>Personal art practice</span>
              <h3 className={styles.h3}>Where I sharpen my eye</h3>
              <ul>
                <li>Playing and recording music</li>
                <li>Sketchbooks, drawing, mixed media, and collage</li>
                <li>Oil painting, which I took up during the pandemic</li>
                <li>DJing as part of Sensitive Boys</li>
              </ul>
            </div>
            <div className={styles.col}>
              <span className={styles.label}>Curiosity</span>
              <h3 className={styles.h3}>Intellectual and aesthetic appetite</h3>
              <ul>
                <li>A voracious reader and lover of books</li>
                <li>Records, flyers, magazines, and subcultural ephemera</li>
                <li>Physical and digital media in equal measure</li>
                <li>New experiences, especially food and travel</li>
                <li>Always teaching myself something new</li>
                <li>An anthropologist&apos;s interest in people, what they do, and why</li>
              </ul>
            </div>
            <div className={styles.col}>
              <span className={styles.label}>Medium &amp; limits</span>
              <h3 className={styles.h3}>The material sets the terms</h3>
              <p>Engaging directly with a project&apos;s medium shapes everything it produces. The tools often show me the best solution when I lean into what they do well. That rigor in approach, if not always in aesthetic, grounds my decisions.</p>
              <blockquote className={styles.quote}>&ldquo;The medium is the message.&rdquo;<cite>— Marshall McLuhan</cite></blockquote>
            </div>
          </div>
        </div>
      </section>

      <div className={`${styles.marquee} ${styles.dark}`} data-scheme="dark" aria-hidden="true">
        <DisciplineMarquee text={MARQUEE} />
      </div>

      <section className={`${styles.band} ${styles.light}`} data-scheme="light">
        <div className={styles.wrap}>
          <div className={styles.head}>
            <span className={styles.label}>[ In Practice ]</span>
            <h2 className={styles.h2}>The approach, applied</h2>
          </div>
          <div className={styles.projects}>
            {PROJECTS.map((p) => (
              <article key={p.title} className={`${styles.proj} ${p.wide ? styles.wide : ""}`}>
                <span className={styles.meta}>{p.meta}</span>
                <h3 className={styles.h3}>{p.title}</h3>
                <p>{p.body}</p>
                {p.bullets && (
                  <ul>
                    {p.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                )}
                {p.link && <a className={styles.more} href={p.link.href}>{p.link.label}</a>}
                {p.soon && <span className={`${styles.more} ${styles.soon}`}>[ Case study coming soon ]</span>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.cta} ${styles.dark}`} data-scheme="dark" id="contact">
        <div className={styles.wrap}>
          <span className={styles.label}>[ Contact ]</span>
          <h2 className={`${styles.h2} ${styles.ctaTitle}`}>Let&apos;s make things happen!</h2>
          <div className={styles.ctaRow}>
            <a className={styles.email} href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <CopyEmail email={EMAIL} />
          </div>
        </div>
      </section>

      <ApproachFooter />
    </div>
  );
}
