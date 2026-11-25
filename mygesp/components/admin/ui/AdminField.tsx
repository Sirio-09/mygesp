"use client";

import { cloneElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
import { labelClass } from "./field-styles";

/**
 * Campo di form con label collegata, hint ed errore.
 *
 * L'`id` viene generato se il controllo non ne ha uno, e viene iniettato
 * nell'unico figlio insieme ad `aria-invalid` / `aria-describedby`: così
 * label e messaggi restano annunciati dai lettori di schermo senza dover
 * ripetere gli attributi in ogni pagina.
 */

export default function AdminField({
  label,
  hint,
  error,
  required = false,
  className = "",
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: ReactElement<{ id?: string }>;
}) {
  const generatedId = useId();
  const controlId = children.props.id ?? generatedId;

  const hintId = hint && !error ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = cloneElement(children as ReactElement<Record<string, unknown>>, {
    id: controlId,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  });

  return (
    <div className={className}>
      <label htmlFor={controlId} className={`${labelClass} mb-2`}>
        {label}
        {required && (
          <span className="ml-1 text-soil-deep" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {control}

      {hintId && (
        <p
          id={hintId}
          className="mt-2 text-[11px] font-light leading-relaxed text-ink-soft"
        >
          {hint}
        </p>
      )}

      {errorId && (
        <p
          id={errorId}
          className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-soil-deep"
        >
          {error}
        </p>
      )}
    </div>
  );
}
