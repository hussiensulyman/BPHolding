"use client";

interface NewsletterFormProps {
  emailPlaceholder: string;
  subscribeLabel: string;
  ariaLabel: string;
}

export function NewsletterForm({
  emailPlaceholder,
  subscribeLabel,
  ariaLabel,
}: NewsletterFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2" aria-label={ariaLabel}>
      <input
        type="email"
        placeholder={emailPlaceholder}
        className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition focus:border-[var(--color-secondary)]"
        aria-label={emailPlaceholder}
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-[var(--color-secondary)] px-3 py-2 text-sm font-semibold text-[var(--color-primary)] transition hover:opacity-90"
      >
        {subscribeLabel}
      </button>
    </form>
  );
}
