export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-t-[var(--color-secondary)]"
          style={{ borderColor: "rgba(5,42,66,0.15)", borderTopColor: "#df9a13" }}
          aria-label="Loading"
          role="status"
        />
        <span className="text-sm font-medium text-[var(--color-primary)]/50">
          BP Holding
        </span>
      </div>
    </div>
  );
}
