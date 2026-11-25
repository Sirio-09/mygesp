"use client";

import { useId } from "react";
import AdminButton from "../ui/AdminButton";
import { Close, Plus } from "../ui/icons";
import { inputClass, labelClass } from "../ui/field-styles";
import { formatEuro } from "@/lib/site";
import type { VariantInput } from "./types";

/**
 * Righe taglie/prezzi/giacenze.
 * Il prezzo è in centesimi come nel database: accanto al campo compare
 * l'anteprima in euro, così non si sbaglia di due zeri.
 */

export default function AdminVariantRows({
  variants,
  onChange,
  onAdd,
  onRemove,
}: {
  variants: VariantInput[];
  onChange: (index: number, field: keyof VariantInput, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const baseId = useId();

  return (
    <div className="space-y-4">
      {variants.map((variant, index) => {
        const priceCents = Number(variant.priceCents);
        const pricePreview =
          variant.priceCents.trim() !== "" && Number.isFinite(priceCents)
            ? formatEuro(priceCents)
            : null;

        const sizeId = `${baseId}-variant-${index}-size`;
        const skuId = `${baseId}-variant-${index}-sku`;
        const priceId = `${baseId}-variant-${index}-price`;
        const stockId = `${baseId}-variant-${index}-stock`;

        return (
          <div
            key={index}
            className="grid grid-cols-2 gap-4 border border-line p-4 md:grid-cols-[1fr_1.4fr_1.2fr_0.9fr_auto] md:items-start"
          >
            <div>
              <label htmlFor={sizeId} className={`${labelClass} mb-2`}>
                Taglia
              </label>
              <input
                id={sizeId}
                value={variant.size}
                onChange={(e) => onChange(index, "size", e.target.value)}
                required
                placeholder="XL"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor={skuId} className={`${labelClass} mb-2`}>
                SKU
              </label>
              <input
                id={skuId}
                value={variant.sku}
                onChange={(e) => onChange(index, "sku", e.target.value)}
                required
                placeholder="es. GIA-XL-001"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label htmlFor={priceId} className={`${labelClass} mb-2`}>
                Prezzo (centesimi)
              </label>
              <input
                id={priceId}
                type="number"
                min="0"
                value={variant.priceCents}
                onChange={(e) => onChange(index, "priceCents", e.target.value)}
                required
                placeholder="12900"
                className={`${inputClass} font-mono`}
              />
              {pricePreview && (
                <p className="mt-1 font-mono text-[10px] tabular-nums text-ink-soft">
                  {pricePreview}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={stockId} className={`${labelClass} mb-2`}>
                Giacenza
              </label>
              <input
                id={stockId}
                type="number"
                min="0"
                value={variant.stock}
                onChange={(e) => onChange(index, "stock", e.target.value)}
                required
                placeholder="0"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div className="col-span-2 flex justify-end md:col-span-1 md:pt-7">
              {variants.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  aria-label={`Rimuovi variante ${index + 1}`}
                  className="flex h-10 w-10 items-center justify-center border border-line text-ink-soft transition-colors duration-200 hover:border-soil-deep hover:text-soil-deep"
                >
                  <Close className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span
                  className="hidden h-10 w-10 md:block"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <AdminButton variant="secondary" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          Aggiungi variante
        </AdminButton>
        <p className="text-xs font-light text-ink-soft">
          Prezzi in centesimi: 12900 = € 129,00.
        </p>
      </div>
    </div>
  );
}
