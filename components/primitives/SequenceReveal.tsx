"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";
import { DUR } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  /** Delay before the first child starts (seconds) */
  delay?: number;
  /**
   * Overlap fraction between consecutive children. 0 = strictly sequential
   * (each starts when the previous has fully finished). 0.2 = next starts when
   * the previous is 80% done. Spec calls for "near-complete with a small overlap".
   */
  overlap?: number;
  /** Fallback duration assumed for children that don't declare their own */
  defaultDuration?: number;
  className?: string;
  style?: React.CSSProperties;
};

type ClonableProps = { delay?: number; duration?: number };

/**
 * Orchestrates an ordered list of children consecutively (not as a simultaneous
 * stagger). Each child gets a computed `delay` prop equal to the sum of prior
 * children's effective durations, so it starts as the previous one settles.
 *
 * Children must accept `delay` (most primitives — RiseOn, RuleDraw, LetterCascade —
 * already do). They may optionally declare their own `duration` to inform the
 * sequencer; otherwise `defaultDuration` is used.
 */
export default function SequenceReveal({
  children,
  delay = 0,
  overlap = 0.15,
  defaultDuration = DUR.base,
  className,
  style,
}: Props) {
  const prefersReduced = useReducedMotion();
  const stepFraction = prefersReduced ? 0 : 1 - overlap;

  // Precompute per-child delays so the render pass is a pure map with no mutation.
  const items = React.Children.toArray(children);
  const delays: number[] = items.reduce<number[]>((acc, child, i) => {
    const prevDelay = i === 0 ? delay : acc[i - 1];
    const prevDuration = React.isValidElement(items[i - 1])
      ? (items[i - 1] as React.ReactElement<ClonableProps>).props.duration ?? defaultDuration
      : 0;
    acc.push(i === 0 ? prevDelay : prevDelay + prevDuration * stepFraction);
    return acc;
  }, []);

  return (
    <div className={className} style={style}>
      {items.map((child, i) => {
        if (!React.isValidElement(child)) return child;
        const typed = child as React.ReactElement<ClonableProps>;
        return React.cloneElement(typed, { delay: delays[i], key: typed.key ?? i });
      })}
    </div>
  );
}
