"use client";

import { useCartStore } from "@/lib/cart-store";
import { FREE_SHIPPING_THRESHOLD_CENTS, formatEuro } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalCents = useCartStore((s) => s.totalCents);

  const [mounted, setMounted] = useState(false);

  // Logica Spedizione Gratuita
  const currentTotalCents = totalCents();
  const missingForFreeShippingCents = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - currentTotalCents);
  const progressPercent = Math.min(100, (currentTotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  const totalFormatted = formatEuro(currentTotalCents);
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      id="cart-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Carrello"
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[100] overflow-hidden transition-all duration-500 ${
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
    >
      {/* OVERLAY: Animazione opacità GPU-friendly (no blur) */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/60 transition-opacity duration-300 ease-out-expo ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* DRAWER: Animazione ottimizzata */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <aside
          className={`flex h-[100dvh] w-[90vw] max-w-md transform-gpu flex-col justify-between bg-paper shadow-[0_0_80px_-20px_rgba(34,40,31,0.45)] will-change-transform transition-transform duration-500 ease-out-expo ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* HEADER */}
          <div className="flex shrink-0 flex-col gap-5 border-b border-line/40 bg-paper p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
                <svg
                  className="h-5 w-5 text-grass-deep"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Carrello <span className="ml-1 font-normal text-ink-soft tabular-nums">({itemCount})</span>
              </h2>
              <button
                onClick={closeCart}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 ease-out-expo hover:bg-paper-warm hover:text-ink"
                aria-label="Chiudi carrello"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* BARRA SPEDIZIONE GRATUITA */}
            {items.length > 0 && (
              <div className="space-y-2.5 bg-paper-warm p-3.5">
                <p className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  {missingForFreeShippingCents > 0 ? (
                    <>
                      <span>
                        Mancano{" "}
                        <strong className="font-semibold tabular-nums text-grass-deep">
                          {formatEuro(missingForFreeShippingCents)}
                        </strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h10v9H3zM13 10h4l3 3v3h-7zM7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Spedizione gratis
                      </span>
                    </>
                  ) : (
                    <span className="flex w-full items-center justify-center gap-1.5 text-grass-deep">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Spedizione gratuita sbloccata!
                    </span>
                  )}
                </p>
                <div className="h-1 w-full overflow-hidden bg-line/40">
                  <div
                    className="h-full bg-grass-deep transition-[width] duration-500 ease-out-expo"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* LISTA PRODOTTI */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
            {items.length === 0 ? (
              <div className="flex h-full animate-fade-in flex-col items-center justify-center space-y-5 text-center">
                <div className="flex h-20 w-20 items-center justify-center border border-dashed border-line text-ink-soft/50">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <p className="text-lg font-light tracking-tight text-ink">Il carrello è vuoto</p>
                  <p className="text-xs font-light text-ink-soft">Aggiungi dei prodotti per iniziare.</p>
                </div>
                <button
                  onClick={closeCart}
                  className="group mt-2 inline-flex items-center gap-2.5 bg-ink px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass"
                >
                  Continua lo shopping
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {items.map((item) => (
                  <div key={item.variantId} className="group flex gap-4">
                    {/* Immagine Prodotto (Ottimizzata) */}
                    <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-paper-warm">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          sizes="80px"
                          className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] font-medium uppercase tracking-[0.14em] text-ink-soft/60">
                          No img
                        </div>
                      )}
                    </div>

                    {/* Dettagli Prodotto */}
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/prodotto/${item.productSlug}`}
                            onClick={closeCart}
                            className="line-clamp-2 pr-4 text-[13px] font-medium leading-snug text-ink transition-colors duration-200 hover:text-grass-deep"
                          >
                            {item.productName}
                          </Link>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="-mr-1 -mt-1 rounded p-1.5 text-ink-soft/60 transition-colors duration-200 hover:bg-soil-deep/5 hover:text-soil-deep"
                            title="Rimuovi"
                            aria-label={`Rimuovi ${item.productName} dal carrello`}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                          Taglia: <span className="font-semibold text-ink">{item.size}</span>
                        </p>
                      </div>

                      {/* Selettore Quantità e Prezzo */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-line/70">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center text-ink transition-colors duration-200 hover:bg-paper-warm"
                            aria-label="Diminuisci quantità"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center text-[12px] font-medium tabular-nums text-ink">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center text-ink transition-colors duration-200 hover:bg-paper-warm"
                            aria-label="Aumenta quantità"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <span className="text-[13px] font-medium tabular-nums text-ink">
                          {formatEuro(item.priceCents * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER DRAWER */}
          {items.length > 0 && (
            <div className="shrink-0 space-y-4 border-t border-line/40 bg-paper p-5">
              <div className="flex items-end justify-between text-ink">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">Subtotale</span>
                <span className="text-xl font-light tabular-nums tracking-tight">{totalFormatted}</span>
              </div>
              <p className="text-[10px] font-light text-ink-soft">
                Spese di spedizione calcolate al checkout.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/carrello"
                  onClick={closeCart}
                  className="flex items-center justify-center border border-ink/20 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 ease-out-expo hover:border-ink"
                >
                  Vedi Carrello
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="group flex items-center justify-center gap-2 bg-ink py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass"
                >
                  Checkout
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}