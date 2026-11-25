import type { ReactNode } from "react";

/**
 * Intestazione di pagina dell'area tecnica: eyebrow, titolo leggero e slot
 * azioni. Stessa spaziatura e stesso filetto di separazione della vetrina.
 */

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-6 border-b border-line/60 pb-8 sm:flex-row sm:items-end sm:justify-between ${className}`.trim()}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-grass-deep">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-light tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </div>
  );
}
