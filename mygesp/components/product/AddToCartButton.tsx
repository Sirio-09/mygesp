// AddToCartButton.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  formatEuro,
  formatEuroCompact,
} from "@/lib/site";

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
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  // Conferma transitoria dopo l'aggiunta
  useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timeout);
  }, [added]);

  // Barra mobile: visibile solo dopo che il CTA principale è uscito dallo schermo
  // e finché il footer non entra in vista, così non ne copre i link.
  useEffect(() => {
    const node = ctaRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    let ctaAboveViewport = false;
    let footerInView = false;
    const sync = () => setShowStickyBar(ctaAboveViewport && !footerInView);

    const ctaObserver = new IntersectionObserver(([entry]) => {
      ctaAboveViewport = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      sync();
    });
    ctaObserver.observe(node);

    const footer = document.querySelector<HTMLElement>("footer");
    const footerObserver = footer
      ? new IntersectionObserver(([entry]) => {
          footerInView = entry.isIntersecting;
          sync();
        })
      : null;
    if (footer && footerObserver) footerObserver.observe(footer);

    return () => {
      ctaObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const finalPriceCents =
    selectedVariant && discountPercent
      ? Math.round(selectedVariant.priceCents * (1 - discountPercent / 100))
      : selectedVariant?.priceCents;

  const isSoldOut = !selectedVariant || selectedVariant.stock === 0;
  const maxQuantity = selectedVariant?.stock ?? 1;
  const subtotalCents = (finalPriceCents ?? selectedVariant?.priceCents ?? 0) * quantity;

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
    <div className="flex flex-col gap-6">
      {/* Prezzo: sempre visibile, sincronizzato con la taglia selezionata */}
      {selectedVariant && (
        <div className="flex flex-col gap-2 border-b border-line/50 pb-6">
          <div className="flex items-baseline gap-4 tabular-nums">
            {discountPercent ? (
              <>
                <span
                  key={`${selectedSize}-sconto`}
                  className="animate-fade-in text-3xl font-light tracking-tight text-ink sm:text-4xl"
                >
                  {formatEuro((finalPriceCents ?? 0) * quantity)}
                </span>
                <span className="text-sm font-light text-ink-soft line-through">
                  {formatEuro(selectedVariant.priceCents * quantity)}
                </span>
              </>
            ) : (
              <span
                key={`${selectedSize}-pieno`}
                className="animate-fade-in text-3xl font-light tracking-tight text-ink sm:text-4xl"
              >
                {formatEuro(selectedVariant.priceCents * quantity)}
              </span>
            )}
          </div>

          {/* Trasparenza prezzo: IVA e soglia spedizione, senza aspettare il checkout */}
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            IVA inclusa ·{" "}
            {subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
              ? "spedizione gratuita"
              : `spedizione gratuita da ${formatEuroCompact(FREE_SHIPPING_THRESHOLD_CENTS)}`}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
        {/* Selettore Taglia */}
        <div>
          <p
            id="taglia-label"
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft"
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
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
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
      <div ref={ctaRef}>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAdd}
            disabled={isSoldOut}
            aria-live="polite"
            className={`group inline-flex w-full items-center justify-center gap-3 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ease-out-expo active:scale-[0.995] ${
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

      {/* Barra acquisto mobile: stessa istanza del componente, quindi taglia e
          quantità restano sincronizzate con il selettore in pagina */}
      <div
        aria-hidden={!showStickyBar}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line/60 bg-paper/95 backdrop-blur-md transition-transform duration-300 ease-out-expo lg:hidden ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {productName}
              {selectedSize ? ` · ${selectedSize}` : ""}
            </p>
            <p className="text-base font-medium tabular-nums text-ink">
              {selectedVariant ? formatEuro(subtotalCents) : "—"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isSoldOut}
            tabIndex={showStickyBar ? 0 : -1}
            className={`shrink-0 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ease-out-expo ${
              isSoldOut
                ? "cursor-not-allowed border border-line text-ink-soft/60"
                : added
                  ? "bg-grass text-white"
                  : "bg-ink text-white hover:bg-grass"
            }`}
          >
            {isSoldOut ? "Esaurito" : added ? "Aggiunto" : "Aggiungi"}
          </button>
        </div>
      </div>
    </div>
  );
}
