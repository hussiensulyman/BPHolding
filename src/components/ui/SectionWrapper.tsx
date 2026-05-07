"use client";

import { motion, useInView } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";

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
  // On back-navigation the browser restores scroll position; if the section is
  // already within the viewport on mount we show it immediately (no fade-in).
  const [skipAnimation, setSkipAnimation] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const { top, bottom } = ref.current.getBoundingClientRect();
    if (top < window.innerHeight && bottom > 0) {
      setSkipAnimation(true);
    }
  }, []);

  const show = isInView || skipAnimation;

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 32 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{
        duration: skipAnimation ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1],
        delay: skipAnimation ? 0 : delay,
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}
