"use client";

import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import { useCartStore, type CartItem } from "@/lib/cart-store";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const totalCents = items.reduce(
    (acc: number, item: CartItem) => acc + item.priceCents * item.quantity,
    0
  );
  const totalEuro = (totalCents / 100).toFixed(2);

  const freeShippingThresholdCents = 9900;
  const missingForFreeShippingCents = Math.max(0, freeShippingThresholdCents - totalCents);
  const missingForFreeShippingEuro = (missingForFreeShippingCents / 100).toFixed(2);
  const progressPercent = Math.min(100, (totalCents / freeShippingThresholdCents) * 100);

  const handleClearCart = () => {
    if (window.confirm("Sei sicuro di voler svuotare il carrello?")) {
      items.forEach((item: CartItem) => removeItem(item.variantId));
    }
  };

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-paper px-4 py-20 text-ink">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center border border-dashed border-line text-ink-soft/50">
            <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-light tracking-tight text-ink">
              Il carrello è vuoto
            </h1>
            <p className="mx-auto max-w-[280px] text-sm font-light leading-relaxed text-ink-soft">
              Sembra che tu non abbia ancora aggiunto nulla. Scopri le nostre ultime novità.
            </p>
          </div>
          <Link
            href="/prodotti"
            className="group inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass"
          >
            Inizia gli acquisti
            <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-paper px-4 py-14 text-ink sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 flex flex-col gap-3 border-b border-line/50 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
              Riepilogo acquisti
            </p>
            <h1 className="text-3xl font-light tracking-tight text-ink sm:text-4xl">
              Il tuo carrello
            </h1>
          </div>
          <p className="text-sm font-light text-ink-soft">
            Hai {items.length} {items.length === 1 ? "articolo" : "articoli"} nel carrello
          </p>
        </div>

        {/* Progress Bar Spedizione Gratuita */}
        <div className="mb-10 bg-paper-warm px-5 py-4">
          <div className="mb-3 flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.14em]">
            {missingForFreeShippingCents > 0 ? (
              <span className="flex items-center gap-2 text-ink-soft">
                <svg className="h-4 w-4 text-grass-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h10v9H3zM13 10h4l3 3v3h-7zM7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Aggiungi{" "}
                <span className="font-semibold tabular-nums text-grass-deep">€{missingForFreeShippingEuro}</span>{" "}
                per la Spedizione Gratuita!
              </span>
            ) : (
              <span className="flex items-center gap-2 text-grass-deep">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Spedizione Gratuita Sbloccata!
              </span>
            )}
            <span className="hidden tabular-nums text-ink-soft sm:block">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden bg-line/50">
            <div
              className="h-full bg-grass-deep transition-[width] duration-700 ease-out-expo"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Lista Articoli */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-line/50 border-y border-line/50">
              {items.map((item: CartItem) => {
                const itemTotalEuro = ((item.priceCents * item.quantity) / 100).toFixed(2);
                const imageUrl = item.image ?? null;

                return (
                  <Reveal
                    key={item.variantId}
                    className="group flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex w-full flex-1 items-start gap-5">
                      {imageUrl ? (
                        <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-paper-warm sm:w-24">
                          <Image
                            src={imageUrl}
                            alt={item.productName || "Prodotto"}
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[4/5] w-20 shrink-0 items-center justify-center bg-paper-warm p-2 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-ink-soft/60 sm:w-24">
                          No image
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <Link
                          href={`/prodotto/${item.productSlug}`}
                          className="line-clamp-2 text-[15px] font-medium leading-snug text-ink transition-colors duration-200 hover:text-grass-deep"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                          Taglia: <span className="font-semibold text-ink">{item.size}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-6 border-t border-line/50 pt-4 sm:w-auto sm:justify-end sm:border-t-0 sm:pt-0">
                      {/* Controlli Quantità */}
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          onClick={() => item.quantity > 1 && updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Diminuisci quantità"
                          className="flex h-10 w-10 items-center justify-center text-ink transition-colors duration-200 hover:bg-paper-warm disabled:cursor-not-allowed disabled:text-ink-soft/30 disabled:hover:bg-transparent"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-10 text-center text-sm font-medium tabular-nums text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          aria-label="Aumenta quantità"
                          className="flex h-10 w-10 items-center justify-center text-ink transition-colors duration-200 hover:bg-paper-warm"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-lg font-light tabular-nums text-ink">€{itemTotalEuro}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors duration-200 hover:text-soil-deep"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <Link
                href="/prodotti"
                className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 hover:text-ink"
              >
                <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M11 6l-6 6 6 6" />
                </svg>
                Continua lo shopping
              </Link>
              <button
                type="button"
                onClick={handleClearCart}
                className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-soft underline underline-offset-4 transition-colors duration-200 hover:text-soil-deep"
              >
                Svuota Carrello
              </button>
            </div>
          </div>

          {/* Riepilogo Ordine */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 border border-line/70 bg-paper-warm/40 p-6 sm:p-7">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                Resoconto
              </p>
              <h2 className="mb-6 text-xl font-light tracking-tight text-ink">
                Totale Ordine
              </h2>

              <dl className="space-y-4 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <dt className="font-light">Subtotale ({items.length} articoli)</dt>
                  <dd className="font-medium tabular-nums text-ink">€{totalEuro}</dd>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <dt className="font-light">Costi di Spedizione</dt>
                  <dd className={missingForFreeShippingCents === 0 ? "font-medium text-grass-deep" : "font-medium text-ink"}>
                    {missingForFreeShippingCents === 0 ? "GRATIS" : "Calcolati al checkout"}
                  </dd>
                </div>
                <div className="flex items-end justify-between border-t border-line/70 pt-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    Totale stimato
                  </dt>
                  <dd className="text-2xl font-light tabular-nums tracking-tight text-ink">€{totalEuro}</dd>
                </div>
              </dl>

              <Link
                href="/checkout"
                className="group mt-6 flex w-full items-center justify-center gap-3 bg-ink px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass"
              >
                Vai al Checkout
                <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>

              <div className="mt-5 flex items-center justify-center gap-2 text-ink-soft">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em]">Pagamenti Sicuri</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
