"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, DUR, STAGGER } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

type Props = {
  text: string;
  as?: Tag;
  /** Animate immediately when true; waits for whileInView when false */
  animate?: boolean;
  delay?: number;
  /** Animate per letter (default) or per word. Word mode keeps each
   *  word whole and staggers words at STAGGER.section. */
  by?: "letter" | "word";
  className?: string;
  style?: React.CSSProperties;
};

const containerVariants = (delay: number, stagger: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

export default function LetterCascade({
  text,
  as: Tag = "h1",
  animate = false,
  delay = 0,
  by = "letter",
  className,
  style,
}: Props) {
  const prefersReduced = useReducedMotion();

  const letterVariant = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DUR.base, ease: EASE },
    },
  };

  const animationProps = animate
    ? { animate: "visible" as const }
    : { whileInView: "visible" as const, viewport: { once: true } };

  return (
    <Tag className={className} style={style}>
      {/* Screen reader: full text, unsplit */}
      <span className="sr-only">{text}</span>

      {/* Visual: per-letter spans */}
      <motion.span
        aria-hidden
        style={{ display: "flex", flexWrap: "wrap" }}
        variants={containerVariants(delay, by === "word" ? STAGGER.section : STAGGER.letter)}
        initial="hidden"
        {...animationProps}
      >
        {(by === "word"
          ? // Keep the trailing space with each word so wrapping and
            // spacing match plain text.
            text.split(/(?<=\s)/)
          : text.split("")
        ).map((unit, i) => (
          <motion.span
            key={i}
            variants={letterVariant}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {unit}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
