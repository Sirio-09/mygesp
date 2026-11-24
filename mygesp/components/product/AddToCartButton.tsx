// AddToCartButton.tsx
"use client";
import { useEffect, useState } from "react";
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
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Conferma transitoria dopo l'aggiunta
  useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timeout);
  }, [added]);

  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const finalPriceCents =
    selectedVariant && discountPercent
      ? Math.round(selectedVariant.priceCents * (1 - discountPercent / 100))
      : selectedVariant?.priceCents;

  const isSoldOut = !selectedVariant || selectedVariant.stock === 0;
  const maxQuantity = selectedVariant?.stock ?? 1;

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

    setAdded(true);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Prezzo: sempre visibile, sincronizzato con la taglia selezionata */}
      {selectedVariant && (
        <div className="flex items-baseline gap-4 border-b border-line/40 pb-8 tabular-nums">
          {discountPercent ? (
            <>
              <span
                key={`${selectedSize}-sconto`}
                className="animate-fade-in text-3xl font-light tracking-tight text-ink sm:text-4xl"
              >
                €{(((finalPriceCents ?? 0) * quantity) / 100).toFixed(2)}
              </span>
              <span className="text-sm font-light text-ink-soft line-through">
                €{((selectedVariant.priceCents * quantity) / 100).toFixed(2)}
              </span>
            </>
          ) : (
            <span
              key={`${selectedSize}-pieno`}
              className="animate-fade-in text-3xl font-light tracking-tight text-ink sm:text-4xl"
            >
              €{((selectedVariant.priceCents * quantity) / 100).toFixed(2)}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10">
        {/* Selettore Taglia */}
        <div>
          <p
            id="taglia-label"
            className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft"
          >
            Seleziona Taglia
          </p>
          <div
            role="radiogroup"
            aria-labelledby="taglia-label"
            className="flex flex-wrap gap-2"
          >
            {variants.map((v) => {
              const isSelected = selectedSize === v.size;
              const isDisabled = v.stock === 0;

              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isDisabled}
                  onClick={() => {
                    setSelectedSize(v.size);
                    setQuantity(1);
                  }}
                  className={`min-w-12 border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 ease-out-expo ${
                    isDisabled
                      ? "cursor-not-allowed border-line/60 text-ink-soft/40 line-through"
                      : isSelected
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selettore Quantità */}
        <div>
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Quantità
          </p>
          <div className="flex w-fit items-center border border-line">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Diminuisci quantità"
              className="flex h-10 w-10 items-center justify-center text-ink-soft transition-colors duration-200 ease-out-expo hover:bg-paper-warm hover:text-ink disabled:cursor-not-allowed disabled:text-ink-soft/30 disabled:hover:bg-transparent"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
              </svg>
            </button>
            <span
              key={quantity}
              className="w-10 animate-scale-in text-center text-sm font-medium tabular-nums text-ink"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={quantity >= maxQuantity}
              aria-label="Aumenta quantità"
              className="flex h-10 w-10 items-center justify-center text-ink-soft transition-colors duration-200 ease-out-expo hover:bg-paper-warm hover:text-ink disabled:cursor-not-allowed disabled:text-ink-soft/30 disabled:hover:bg-transparent"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Pulsante Acquisto */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <button
            onClick={handleAdd}
            disabled={isSoldOut}
            aria-live="polite"
            className={`group inline-flex w-full items-center justify-center gap-3 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ease-out-expo active:scale-[0.995] sm:w-auto sm:min-w-[272px] ${
              isSoldOut
                ? "cursor-not-allowed border border-line bg-transparent text-ink-soft/60"
                : added
                  ? "bg-grass text-white"
                  : "bg-ink text-white hover:bg-grass"
            }`}
          >
            {isSoldOut ? "Esaurito" : added ? "Aggiunto" : "Aggiungi al carrello"}
            {!isSoldOut &&
              (added ? (
                <svg
                  className="h-3.5 w-3.5 animate-scale-in"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>
              ))}
          </button>

          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            {isSoldOut
              ? "Taglia attualmente non disponibile"
              : selectedVariant.stock <= 5
                ? `Ultimi ${selectedVariant.stock} pezzi disponibili`
                : "Disponibile in pronta consegna"}
          </p>
        </div>
      </div>
    </div>
  );
}
