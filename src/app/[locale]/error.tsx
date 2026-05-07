"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring
    console.error("[PageError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[var(--color-secondary)]"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-[var(--color-primary)]">
          Something went wrong
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
          An unexpected error occurred while loading this page.
        </p>
      </div>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
