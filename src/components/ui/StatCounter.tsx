"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface StatCounterProps {
  value: string;
  label: string;
  delay?: number;
}

function parseNumeric(val: string): { prefix: string; number: number; suffix: string } {
  const match = val.match(/^([^0-9]*)(\d+(?:\.\d+)?)([^0-9]*)$/);
  if (!match) return { prefix: "", number: 0, suffix: val };
  return {
    prefix: match[1] ?? "",
    number: parseFloat(match[2] ?? "0"),
    suffix: match[3] ?? "",
  };
}

export function StatCounter({ value, label, delay = 0 }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(wrapperRef, { once: true, margin: "-40px" });
  const { prefix, number, suffix } = parseNumeric(value);

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, number, {
      duration: 1.8,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        node.textContent =
          prefix +
          (Number.isInteger(number) ? Math.round(v).toString() : v.toFixed(1)) +
          suffix;
      },
    });
    return () => controls.stop();
  }, [isInView, number, prefix, suffix, delay]);

  return (
    <div ref={wrapperRef} className="stat-card">
      <span ref={ref} className="stat-value">
        {prefix}0{suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
