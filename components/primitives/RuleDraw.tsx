"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, DUR } from "@/lib/motion";

type Props = {
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Trigger on scroll-into-view instead of on mount */
  inView?: boolean;
};

export default function RuleDraw({
  delay = 0,
  duration = DUR.slow,
  className,
  style,
  inView = false,
}: Props) {
  const prefersReduced = useReducedMotion();

  const animationProps = inView
    ? { whileInView: { scaleX: 1 }, viewport: { once: true } }
    : { animate: { scaleX: 1 } };

  return (
    <motion.div
      className={className}
      style={{ transformOrigin: "left center", ...style }}
      initial={{ scaleX: 0 }}
      {...animationProps}
      transition={{
        duration: prefersReduced ? 0 : duration,
        delay,
        ease: EASE,
      }}
    />
  );
}
