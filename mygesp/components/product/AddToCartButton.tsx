// AddToCartButton.tsx
"use client";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

type Variant = {
  id: string;
  size: string;
  priceCents: number;
  stock: number;
};

export default function AddToCartButton({
  variants,
  productSlug,
  productName,
  discountPercent,
  productImage,
}: {
  variants: Variant[];
  productSlug: string;
  productName: string;
  discountPercent?: number | null;
  productImage?: string | null;
}) {
  const [selectedSize, setSelectedSize] = useState(variants[0]?.size ?? "");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const finalPriceCents =
    selectedVariant && discountPercent
      ? Math.round(selectedVariant.priceCents * (1 - discountPercent / 100))
      : selectedVariant?.priceCents;

  const handleAdd = () => {
    if (!selectedVariant) return;

    addItem({
      variantId: selectedVariant.id,
      productSlug,
      productName,
      size: selectedVariant.size,
      priceCents: finalPriceCents ?? selectedVariant.priceCents,
      quantity,
      image: productImage,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10">
        {/* Selettore Taglia */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft mb-4">
            Seleziona Taglia
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedSize(v.size)}
                disabled={v.stock === 0}
                className={`border px-5 py-2.5 text-[11px] font-medium uppercase tracking-widest transition-colors duration-200 ${
                  selectedSize === v.size
                    ? "border-ink text-ink"
                    : "border-line/60 text-ink-soft hover:border-ink/40 hover:text-ink"
                } ${v.stock === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>

        {/* Selettore Quantità */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft mb-4">
            Quantità
          </div>
          <div className="flex items-center border border-line/60 w-fit">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-ink-soft hover:text-ink hover:bg-line/10 transition-colors"
            >
              &minus;
            </button>
            <span className="w-10 text-center text-sm font-medium text-ink">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setQuantity((q) => Math.min(selectedVariant?.stock ?? 1, q + 1))
              }
              className="w-10 h-10 flex items-center justify-center text-ink-soft hover:text-ink hover:bg-line/10 transition-colors"
            >
              &#43;
            </button>
          </div>
        </div>
      </div>

      {/* Prezzo e Pulsante Acquisto */}
      <div className="pt-8 border-t border-line/40">
        {selectedVariant && (
          <div className="flex items-baseline gap-4 mb-6">
            {discountPercent ? (
              <>
                <span className="text-3xl font-light text-ink">
                  €{(((finalPriceCents ?? 0) * quantity) / 100).toFixed(2)}
                </span>
                <span className="text-sm font-light text-ink-soft line-through">
                  €{((selectedVariant.priceCents * quantity) / 100).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-light text-ink">
                €{((selectedVariant.priceCents * quantity) / 100).toFixed(2)}
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          className="w-full sm:w-auto bg-ink text-white hover:bg-grass text-[11px] font-medium uppercase tracking-[0.2em] py-4 px-12 disabled:opacity-30 disabled:hover:bg-ink transition-colors duration-300"
        >
          {selectedVariant?.stock === 0 ? "Esaurito" : "Aggiungi al carrello"}
        </button>
      </div>
    </div>
  );
}