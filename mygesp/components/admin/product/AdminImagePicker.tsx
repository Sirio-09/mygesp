"use client";

import Image from "next/image";
import { useId } from "react";
import { Close, Upload } from "../ui/icons";

/**
 * Selettore immagini del prodotto: anteprime quadrate, copertina marcata e
 * pulsante tratteggiato per aggiungere file. Nessun upload qui: il chiamante
 * riceve i `File` e li carica al submit.
 */

export default function AdminImagePicker({
  previews,
  onFiles,
  onRemove,
  note = "La prima immagine è la copertina usata in vetrina e nei risultati di ricerca.",
}: {
  previews: string[];
  onFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  note?: string;
}) {
  const inputId = useId();

  return (
    <div>
      <div className="flex flex-wrap items-start gap-3">
        {previews.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="group relative h-32 w-28 overflow-hidden border border-line bg-paper-warm/30"
          >
            <Image
              src={src}
              alt={`Anteprima immagine ${index + 1}`}
              fill
              sizes="112px"
              className="object-cover"
            />

            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Rimuovi immagine ${index + 1}`}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-ink text-white transition-colors duration-200 hover:bg-soil-deep"
            >
              <Close className="h-3 w-3" />
            </button>

            {index === 0 && (
              <span className="absolute inset-x-0 bottom-0 bg-ink/90 py-1 text-center text-[8px] font-semibold uppercase tracking-[0.16em] text-white">
                Copertina
              </span>
            )}
          </div>
        ))}

        <label
          htmlFor={inputId}
          className="flex h-32 w-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line text-ink-soft transition-colors duration-200 hover:border-grass-deep hover:text-grass-deep"
        >
          <Upload className="h-4 w-4" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em]">
            Aggiungi
          </span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              // Azzera il valore: senza questo, riselezionare lo stesso file
              // non scatenerebbe un nuovo evento change.
              event.target.value = "";
              if (files.length > 0) onFiles(files);
            }}
            className="sr-only"
          />
        </label>
      </div>

      <p className="mt-4 text-xs font-light leading-relaxed text-ink-soft">
        {note}
      </p>
    </div>
  );
}
