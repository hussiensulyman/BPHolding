"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type RFQAutoRedirectProps = {
  locale: string;
  initialSeconds?: number;
  labelTemplate: string;
};

export function RFQAutoRedirect({
  locale,
  initialSeconds = 10,
  labelTemplate,
}: RFQAutoRedirectProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const hasRedirected = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        return Math.max(current - 1, 0);
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (secondsLeft > 0 || hasRedirected.current) {
      return;
    }

    hasRedirected.current = true;
    router.push(`/${locale}`);
  }, [locale, router, secondsLeft]);

  return (
    <p className="text-sm text-slate-600" aria-live="polite">
      {labelTemplate.replace("__SECONDS__", String(secondsLeft))}
    </p>
  );
}
