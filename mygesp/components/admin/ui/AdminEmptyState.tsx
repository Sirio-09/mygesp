import type { ReactNode } from "react";

/**
 * Stato vuoto: bordo tratteggiato, icona in un box quadrato, testo leggero e
 * una sola azione. È lo stesso pattern dello stato vuoto del catalogo.
 */

export default function AdminEmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border border-dashed border-line px-6 py-14 text-center ${className}`.trim()}
    >
      {icon && (
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-line text-ink-soft">
          {icon}
        </div>
      )}
      <p className="text-base font-light text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm font-light leading-relaxed text-ink-soft">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
