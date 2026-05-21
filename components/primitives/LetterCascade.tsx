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
  className?: string;
  style?: React.CSSProperties;
};

const containerVariants = (delay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.letter,
      delayChildren: delay,
    },
  },
});

export default function LetterCascade({
  text,
  as: Tag = "h1",
  animate = false,
  delay = 0,
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
        variants={containerVariants(delay)}
        initial="hidden"
        {...animationProps}
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            variants={letterVariant}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
