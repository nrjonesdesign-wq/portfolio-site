/* Plain <a> (full page load) rather than next/link for links back to "/":
   the home page reads its #section / #case-study hash and runs its intro +
   snap setup on a fresh mount, which a client-side transition skips. */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import styles from "./approach.module.css";
import { ApproachFooter, ApproachMobileNav, ApproachTint, CopyEmail, NavPlanet, Reveal, ScrubMarquee } from "./ApproachChrome";
import StarField from "@/components/starfield/StarField";
import LetterCascade from "@/components/primitives/LetterCascade";
import { STAGGER } from "@/lib/motion";

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
    body: "A flagship digital white paper whose visual language merged two brands, one of them mid-transition. Typography, color, and voice did the work of synthesis, and the system evolved once the new brand landed. I designed custom infographics to make its dense consumer-behavior data clear at a glance. AI image generation supported the illustration.",
    link: { href: "/#liquid-challenger-index", label: "[ View case study ]" },
  },
  {
    meta: "Brand identity",
    title: "Revolutionary Change Rebrand",
    body: "A rebrand for Revolutionary Change, a left political show on YouTube. Its first identity grew out of a host's congressional run, and the hosts were ready for something more overtly radical. The new one had to welcome progressives, committed leftists, and newcomers alike, and give viewers, Patreon supporters, and organizers something to rally behind.",
    bullets: [
      "Audience psychographics and mood boards",
      "Concepts, mockups, and a brand guidelines document",
      "Got the client to yes through goal-setting up front and several rounds of feedback",
    ],
    link: { href: "/#revolutionary-change", label: "[ View case study ]" },
  },
  {
    meta: "Brand identity",
    title: "Velvet Isles",
    body: "The client came in with a detailed brief, which gave me a lot to work from. As with every project, I got the client to yes through close collaboration, iteration, and refinement.",
    soon: true,
  },
  {
    meta: "Self-initiated · Daily newsletter",
    title: "Morning Brief",
    body: "A daily newsletter I designed, built, and run. It pulls from 598 curated sources across 49 sections, sorted by an AI curation layer that follows an editorial perspective I wrote myself. It arrives as an HTML email built to hold up across mail clients. Under the hood: Python, the Claude API, RSS parsing, and GitHub Actions.",
    soon: true,
  },
  {
    meta: "Self-initiated · This site",
    title: "Personal Portfolio & Brand",
    body: "My first experiment building with Claude Code. I surveyed portfolio sites I admire, noted the features I wanted, prototyped the whole site in Figma, then iterated in code. The goal was to show as well as tell. That meant solid structure and hierarchy, high-impact sans-serif type with personality, and a palette of muted yet saturated color fields. The interactions are meant to surprise and reward exploration.",
    link: { href: "/", label: "[ You're looking at it ]" },
  },
];

/** Same comma-list format as a project's `disciplines`. Rendered by
 *  ScrubMarquee: the Work rows' type + ★ separators, with the site's
 *  drift / hover-pause / scrub / flick behaviour. */
const MARQUEE = "Problem Solving, Research, Strategy, Collaboration, Iteration, Craft, Rigor, Clarity, Curiosity, Empathy, Storytelling, Systems Thinking, Art Direction, Brand Systems, Editorial Design, Information Design, UX / UI, Typography, Illustration, Motion";

export default function ApproachPage() {
  return (
    <div className={styles.page}>
      <ApproachTint />
      <ApproachMobileNav />

      <nav className={`${styles.nav} ${styles.light}`} data-scheme="light" data-cursor-color="local" aria-label="Site">
        <div className={`${styles.wrap} ${styles.navRow}`}>
          <NavPlanet />
          <ul className={styles.navList}>
            <li><a href="/#who" data-cursor="view" data-magnetic>WHO</a></li>
            <li><a href="/#work" data-cursor="view" data-magnetic>WORK</a></li>
            <li><a href="/approach" aria-current="page" data-cursor="view" data-magnetic>APPROACH</a></li>
            <li><a href="#contact" data-cursor="view" data-magnetic>CONTACT</a></li>
          </ul>
        </div>
      </nav>

      <header className={`${styles.hero} ${styles.light}`} data-scheme="light" data-cursor-color="local">
        <div className={styles.wrap}>
          <Reveal as="span" className={styles.label}>[ Approach ]</Reveal>
          <LetterCascade as="h1" text="How I work." by="word" animate={false} delay={0.15} className={styles.h1} />
          <Reveal className={styles.lede} delay={0.55}>
            <span className={styles.label}>Process · Philosophy · Influences</span>
            <p>I&apos;m a designer, which means I&apos;m a problem solver first, and my taste is one of the best tools I bring to the problem. I apply it with intent, in service of the goal and the audience. Painting and music keep that eye sharp. Here is what shapes the work I do for clients.</p>
          </Reveal>
        </div>
      </header>

      <section className={`${styles.band} ${styles.dark}`} data-scheme="dark" data-cursor-color="local">
        <div className={styles.wrap}>
          <Reveal className={styles.head}>
            <span className={styles.label}>[ Foundation ]</span>
            <h2 className={styles.h2}>Where it starts</h2>
          </Reveal>
          <div className={styles.cols3}>
            <Reveal className={styles.col} cursorColor="local" kind="fade" delay={0.15}>
              <span className={styles.label}>Education</span>
              <h3 className={styles.h3}>BFA, Communication Design, Washington University in St. Louis</h3>
              <ul>
                <li>A conceptual grounding in art and cultural history</li>
                <li>Visual design fundamentals: hierarchy, color, composition, typography, layout, pacing, contrast</li>
                <li>The power of word and image together</li>
                <li>An illustration emphasis: visual storytelling, durable metaphors, distilling an idea to its core</li>
              </ul>
            </Reveal>
            <Reveal className={styles.col} cursorColor="local" kind="fade" delay={0.15 + 1 * STAGGER.item}>
              <span className={styles.label}>Experience</span>
              <h3 className={styles.h3}>Nearly 20 years across enterprise, startups, agency, and freelance</h3>
              <ul>
                <li>Bloomberg, LearnVest, Nifty&apos;s, Liquid Agency, and my own practice</li>
                <li>Helped shape and launch the visual language of LearnVest, Liquid, Velvet Isles, and Revolutionary Change</li>
                <li>Worked inside cross-functional teams with marketing, engineering, product, UX research, subject experts, and the C-suite</li>
              </ul>
            </Reveal>
            <Reveal className={styles.col} cursorColor="local" kind="fade" delay={0.15 + 2 * STAGGER.item}>
              <span className={styles.label}>Craft</span>
              <h3 className={styles.h3}>Careful, precise, finished</h3>
              <ul>
                <li>I teach myself new tools, techniques, and technologies as they emerge</li>
                <li>I identify with the audience and use what I learn to tune their experience</li>
              </ul>
              <blockquote className={styles.quote}>&ldquo;Meaning, memorability, clarity&rdquo;<cite>— Susan Kare</cite></blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={`${styles.band} ${styles.light}`} data-scheme="light" data-cursor-color="local">
        <div className={styles.wrap}>
          <Reveal className={styles.head}>
            <span className={styles.label}>[ Philosophy ]</span>
            <h2 className={styles.h2}>What I believe about the work</h2>
          </Reveal>
          <ul className={styles.tenets}>
            <Reveal as="li" cursorColor="local" kind="fade" delay={0.15}>
              <h3 className={styles.h3}>Taste, applied with judgment</h3>
              <p>My taste is a big part of what clients hire me for. I apply it deliberately, tuned by what I learn about the audience, so every aesthetic choice earns its place and fits the people it&apos;s for.</p>
            </Reveal>
            <Reveal as="li" cursorColor="local" kind="fade" delay={0.15 + 1 * STAGGER.item}>
              <h3 className={styles.h3}>Serve the user, and the business follows</h3>
              <p>I advocate for the user. I know the conventions and when to push on them, and I stay curious and empathetic about who I&apos;m designing for.</p>
            </Reveal>
            <Reveal as="li" cursorColor="local" kind="fade" delay={0.15 + 2 * STAGGER.item}>
              <h3 className={styles.h3}>Nobody does their best work in a silo</h3>
              <p>I earn stakeholder buy-in by collaborating closely from the start, agreeing on goals and limits, and presenting work clearly. With senior stakeholders, the real skill is reading the context and listening closely, including to what goes unsaid.</p>
            </Reveal>
            <Reveal as="li" cursorColor="local" kind="fade" delay={0.15 + 3 * STAGGER.item}>
              <h3 className={styles.h3}>Feedback makes the work better</h3>
              <p>I welcome feedback and treat every round as a chance to sharpen the work. Experimentation and iteration are how good work moves forward.</p>
            </Reveal>
            <Reveal as="li" cursorColor="local" kind="fade" delay={0.15 + 4 * STAGGER.item}>
              <h3 className={styles.h3}>Curiosity is the job</h3>
              <p>I absorb the visual culture around me constantly. Books, records, museums, openings, concerts, nightlife, travel, and time in nature keep my references fresh. They also feed a growing archive I draw on every day.</p>
            </Reveal>
          </ul>
        </div>
      </section>

      <section className={`${styles.band} ${styles.dark}`} data-scheme="dark" data-cursor-color="local">
        <div className={styles.wrap}>
          <Reveal className={styles.head}>
            <span className={styles.label}>[ Process ]</span>
            <h2 className={styles.h2}>From brief to build</h2>
          </Reveal>
          <ol className={styles.steps}>
            <Reveal as="li" cursorColor="local" kind="fade" delay={0.15}>
              <h3 className={styles.h3}>Define the problem</h3>
              <p>I listen actively, take careful notes, and confirm stakeholders agree on the goals, challenges, and limits before any design begins.</p>
            </Reveal>
            <Reveal as="li" cursorColor="local" kind="fade" delay={0.15 + 1 * STAGGER.item}>
              <h3 className={styles.h3}>Research</h3>
              <p>I gather everything I can about the subject. The deeper I know the material, the better my recommendations. Front-loading the study is how I make better decisions.</p>
              <p className={styles.aside}>One of my favorite parts of this career.</p>
            </Reveal>
            <Reveal as="li" cursorColor="local" kind="fade" delay={0.15 + 2 * STAGGER.item}>
              <h3 className={styles.h3}>Sketch and share</h3>
              <p>Mind maps, sketches, whiteboards, and wireframes. I think visually, so getting ideas on paper is how I find connections. Sharing early keeps my read of the brief aligned and lets us vet directions before they get expensive.</p>
            </Reveal>
            <Reveal as="li" cursorColor="local" kind="fade" delay={0.15 + 3 * STAGGER.item}>
              <h3 className={styles.h3}>Experiment and refine</h3>
              <p>Once I know the material, I explore, prototype, and iterate, then refine the strongest direction through rounds of feedback.</p>
            </Reveal>
          </ol>
          <Reveal className={styles.toolbox} delay={0.5}>
            <span className={styles.label}>Tools&nbsp;→</span>
            {["Pen & paper", "Miro", "Figma", "Illustrator", "Photoshop", "InDesign", "After Effects", "Claude Code"].map((t) => (
              <span key={t} className={styles.chip}>{t}</span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className={`${styles.band} ${styles.light}`} data-scheme="light" data-cursor-color="local">
        <div className={styles.wrap}>
          <Reveal className={styles.head}>
            <span className={styles.label}>[ Influences ]</span>
            <h2 className={styles.h2}>What shapes my visual style</h2>
          </Reveal>
          <div className={`${styles.cols3} ${styles.infl}`}>
            <Reveal className={styles.col} cursorColor="local" kind="fade" delay={0.15}>
              <span className={styles.label}>Personal art practice</span>
              <h3 className={styles.h3}>Where I sharpen my eye</h3>
              <ul>
                <li>Playing and recording music</li>
                <li>Sketchbooks, drawing, mixed media, and collage</li>
                <li>Oil painting, which I took up during the pandemic</li>
                <li>DJing as part of Sensitive Boys</li>
              </ul>
            </Reveal>
            <Reveal className={styles.col} cursorColor="local" kind="fade" delay={0.15 + 1 * STAGGER.item}>
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
            </Reveal>
            <Reveal className={styles.col} cursorColor="local" kind="fade" delay={0.15 + 2 * STAGGER.item}>
              <span className={styles.label}>Medium &amp; limits</span>
              <h3 className={styles.h3}>The material sets the terms</h3>
              <p>Engaging directly with a project&apos;s medium shapes everything it produces. The tools often show me the best solution when I lean into what they do well. That rigor in approach, if not always in aesthetic, grounds my decisions.</p>
              <blockquote className={styles.quote}>&ldquo;The medium is the message&rdquo;<cite>— Marshall McLuhan</cite></blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      <div className={`${styles.marquee} ${styles.dark}`} data-scheme="dark" data-cursor-color="local" aria-hidden="true">
        <ScrubMarquee text={MARQUEE} />
      </div>

      <section className={`${styles.band} ${styles.light} ${styles.starBand}`} data-scheme="light" data-cursor-color="local">
        {/* Star field — same low-opacity overlay as the homepage panels;
            the charcoal cards sit above it. */}
        <div className={styles.stars} aria-hidden>
          <StarField className="w-full h-full" count={48} gapScale={0.4} avoid="article" />
        </div>
        <div className={styles.wrap}>
          <Reveal className={styles.head}>
            <span className={styles.label}>[ In Practice ]</span>
            <h2 className={styles.h2}>The approach, applied</h2>
          </Reveal>
          <div className={styles.projects}>
            {PROJECTS.map((p, i) => (
              <Reveal as="article" key={p.title} className={`${styles.proj} ${p.wide ? styles.wide : ""}`} kind="fade" delay={0.15 + i * STAGGER.item} cursorColor="local">
                <span className={styles.meta}>{p.meta}</span>
                <h3 className={styles.h3}>{p.title}</h3>
                <p>{p.body}</p>
                {p.bullets && (
                  <ul>
                    {p.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                )}
                {p.link && <a className={styles.more} href={p.link.href} data-cursor="view" data-magnetic>{p.link.label}</a>}
                {p.soon && <span className={`${styles.more} ${styles.soon}`}>[ Case study coming soon ]</span>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.cta} ${styles.dark}`} data-scheme="dark" data-cursor-color="local" id="contact">
        <div className={styles.wrap}>
          <Reveal as="span" className={styles.label}>[ Contact ]</Reveal>
          <LetterCascade as="h2" text="Let's make things happen!" by="word" animate={false} delay={0.15} className={`${styles.h2} ${styles.ctaTitle}`} />
          <Reveal as="p" className={styles.ctaNote} delay={0.7}>Taking on brand, web, and ongoing retainer work for small teams, startups, and agencies.</Reveal>
          <Reveal className={styles.ctaRow} delay={0.85}>
            <a className={styles.email} href={`mailto:${EMAIL}`} data-cursor="view" data-magnetic>{EMAIL}</a>
            <CopyEmail email={EMAIL} />
          </Reveal>
        </div>
      </section>

      <ApproachFooter />
    </div>
  );
}
