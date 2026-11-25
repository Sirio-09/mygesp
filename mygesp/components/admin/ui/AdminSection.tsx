import type { ReactNode } from "react";

/**
 * Sezione/card dell'area tecnica: bordo 1px, raggio 0, header con eyebrow.
 * `flush` serve per le liste che gestiscono da sole il proprio padding
 * (righe con `divide-y` e hover a tutta larghezza).
 */

export default function AdminSection({
  label,
  description,
  actions,
  flush = false,
  className = "",
  children,
}: {
  label?: string;
  description?: string;
  actions?: ReactNode;
  flush?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const hasHeader = Boolean(label || actions || description);

  return (
    <section className={`border border-line bg-paper ${className}`.trim()}>
      {hasHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {label && (
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                {label}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs font-light leading-relaxed text-ink-soft">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-4">{actions}</div>}
        </div>
      )}
      <div className={flush ? "" : "px-5 py-6 sm:px-6 sm:py-8"}>{children}</div>
    </section>
  );
}
