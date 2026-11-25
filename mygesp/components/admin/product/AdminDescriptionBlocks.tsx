"use client";

import { useId } from "react";
import AdminButton from "../ui/AdminButton";
import { Close, Plus } from "../ui/icons";
import { inputClass, labelClass, textareaClass } from "../ui/field-styles";
import type { DescriptionBlockInput } from "./types";

/**
 * Editor della descrizione estesa a blocchi (titolo + testo).
 * Ogni blocco ha id/label collegati; l'ultimo non si può eliminare perché
 * il payload si aspetta almeno un blocco.
 */

export default function AdminDescriptionBlocks({
  blocks,
  onChange,
  onAdd,
  onRemove,
}: {
  blocks: DescriptionBlockInput[];
  onChange: (index: number, field: "title" | "text", value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const baseId = useId();

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const titleId = `${baseId}-block-${index}-title`;
        const textId = `${baseId}-block-${index}-text`;

        return (
          <div key={index} className="border border-line">
            <div className="flex items-center justify-between border-b border-line/60 px-4 py-2.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                Blocco {index + 1}
              </span>

              {blocks.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-soft transition-colors duration-200 hover:text-soil-deep"
                >
                  <Close className="h-3 w-3" />
                  Elimina
                </button>
              )}
            </div>

            <div className="space-y-4 p-4">
              <div>
                <label htmlFor={titleId} className={`${labelClass} mb-2`}>
                  Titolo
                </label>
                <input
                  id={titleId}
                  value={block.title}
                  onChange={(e) => onChange(index, "title", e.target.value)}
                  placeholder="es. Impermeabilità e traspirabilità"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={textId} className={`${labelClass} mb-2`}>
                  Testo
                </label>
                <textarea
                  id={textId}
                  rows={3}
                  value={block.text}
                  onChange={(e) => onChange(index, "text", e.target.value)}
                  placeholder="Dettagli del blocco..."
                  className={textareaClass}
                />
              </div>
            </div>
          </div>
        );
      })}

      <AdminButton variant="secondary" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" />
        Aggiungi blocco
      </AdminButton>
    </div>
  );
}
