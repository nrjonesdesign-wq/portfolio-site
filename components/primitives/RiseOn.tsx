"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, DUR } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  delay?: number;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function RiseOn({
  children,
  delay = 0,
  once = true,
  className,
  style,
}: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-8%" }}
      transition={{ duration: DUR.base, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
