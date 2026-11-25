/**
 * Scheletro di caricamento per le liste dell'area tecnica.
 * Riusa i colori dei filetti (`line`) invece di grigi fuori palette.
 */

export default function AdminSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Caricamento in corso…</span>
      <div
        aria-hidden="true"
        className="space-y-px border border-line bg-line/60"
      >
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse space-y-4 bg-paper p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="h-2.5 w-28 bg-line/70" />
                <div className="h-2 w-40 bg-line/50" />
              </div>
              <div className="h-6 w-24 bg-line/60" />
            </div>
            <div className="h-14 w-full bg-line/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
