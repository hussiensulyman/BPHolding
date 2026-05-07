"use client";

import { motion, useInView } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";

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
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}
