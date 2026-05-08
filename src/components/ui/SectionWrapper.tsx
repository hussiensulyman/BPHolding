"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  style?: CSSProperties;
}

export function SectionWrapper({
  children,
  className = "",
  id,
  delay = 0,
  style,
}: SectionWrapperProps) {
  // Use framer-motion's native whileInView rather than a manual animate+useInView
  // combination. The controlled-state approach (animate={show ? ... : ...}) has a
  // failure mode: if BOTH useLayoutEffect and IntersectionObserver miss the initial
  // viewport check (e.g. section is exactly at the fold), the section stays locked
  // at opacity:0 with no recovery path.
  //
  // whileInView uses its own IntersectionObserver internally. The generous margin
  // (200px top and bottom) ensures sections right at the viewport edge — specifically
  // AboutSection which starts at exactly Hero's bottom (~100vh) — are always
  // triggered without the user needing to scroll.
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "200px 0px 200px 0px" }}
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}
