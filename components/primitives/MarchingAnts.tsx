"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  /** Direction of travel */
  direction?: "down" | "up" | "right" | "left";
  /** Total length of the dotted line (e.g. "3rem", "120px") */
  length?: string;
  /** Distance from one dot center to the next */
  spacing?: string;
  /** Dot diameter */
  dotSize?: string;
  /** Seconds for one full cycle (one dot's worth of travel) */
  speed?: number;
  /** Color override; defaults to current foreground */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function MarchingAnts({
  direction = "down",
  length = "3rem",
  spacing = "0.5rem",
  dotSize = "2px",
  speed = 1.2,
  color = "var(--fg)",
  className,
  style,
}: Props) {
  const prefersReduced = useReducedMotion();
  const vertical = direction === "down" || direction === "up";
  const reverse = direction === "up" || direction === "left";

  // The repeating gradient draws one dot per `spacing` step. We translate the
  // background by exactly one `spacing` per cycle, which gives the illusion of
  // an endless cascade since every position lines up after one period.
  const gradientImage = `radial-gradient(
    circle ${dotSize} at center,
    ${color} 0,
    ${color} 60%,
    transparent 60%
  )`;

  const animateAxis = vertical ? "backgroundPositionY" : "backgroundPositionX";
  const fromValue = "0px";
  const toValue = reverse ? `-${spacing}` : spacing;

  return (
    <motion.div
      aria-hidden
      className={className}
      style={{
        width: vertical ? dotSize : length,
        height: vertical ? length : dotSize,
        backgroundImage: gradientImage,
        backgroundRepeat: "repeat",
        backgroundSize: vertical
          ? `${dotSize} ${spacing}`
          : `${spacing} ${dotSize}`,
        ...style,
      }}
      animate={
        prefersReduced
          ? undefined
          : {
              [animateAxis]: [fromValue, toValue],
            }
      }
      transition={{
        duration: speed,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      }}
    />
  );
}
