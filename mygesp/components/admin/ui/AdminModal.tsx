"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { Close } from "./icons";

/**
 * Modale accessibile dell'area tecnica.
 *
 * - Esc chiude, click sullo sfondo chiude, focus iniziale sul primo controllo;
 * - il focus torna all'elemento che ha aperto la modale;
 * - scroll del body bloccato finché è aperta;
 * - `aria-modal` + titolo collegato via `aria-labelledby`.
 */

export default function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Il callback vive in un ref: l'effetto non deve ripartire a ogni render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const firstControl = panelRef.current?.querySelector<HTMLElement>(
      "input, select, textarea, button"
    );
    firstControl?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-scale-in w-full max-w-md border border-line bg-paper p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-6 border-b border-line/60 pb-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-xl font-light tracking-tight text-ink"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-sm font-light leading-relaxed text-ink-soft">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
            aria-label="Chiudi"
          >
            <Close />
          </button>
        </div>

        {children && <div className="pt-6">{children}</div>}

        {footer && (
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line/60 pt-6 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
