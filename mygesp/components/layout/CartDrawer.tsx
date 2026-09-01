"use client";

import { useCartStore } from "@/lib/cart-store";
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
  const freeShippingThresholdCents = 9900;
  const currentTotalCents = totalCents();
  const missingForFreeShippingCents = Math.max(0, freeShippingThresholdCents - currentTotalCents);
  const progressPercent = Math.min(100, (currentTotalCents / freeShippingThresholdCents) * 100);

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
    }
  }, [isOpen]);

  if (!mounted) return null;

  const totalFormatted = (currentTotalCents / 100).toFixed(2);
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden transition-all duration-500 ${
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
    >
      {/* 
        OVERLAY: Rimosso il backdrop-blur per eliminare il lag su mobile. 
        Utilizziamo solo un cambio di opacità GPU-friendly.
      */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/60 transition-opacity duration-400 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 
        DRAWER: Animazione ottimizzata con will-change e cubic-bezier per la massima fluidità 
      */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <aside
          className={`w-[90vw] max-w-md h-[100dvh] bg-paper shadow-2xl rounded-l-2xl flex flex-col justify-between transform-gpu will-change-transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* HEADER */}
          <div className="p-5 border-b border-line/40 flex flex-col gap-5 bg-paper shrink-0 rounded-tl-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.15em] text-ink flex items-center gap-2">
                <svg className="w-5 h-5 text-grass-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Carrello <span className="text-ink-soft ml-1 font-medium">({itemCount})</span>
              </h2>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-paper-warm text-ink-soft hover:text-ink hover:bg-line/30 hover:rotate-90 transition-all duration-300"
                aria-label="Chiudi carrello"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* BARRA SPEDIZIONE GRATUITA */}
            {items.length > 0 && (
              <div className="space-y-2.5 bg-paper-warm p-3.5 rounded-xl border border-line/30">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center justify-between">
                  {missingForFreeShippingCents > 0 ? (
                    <>
                      <span>Mancano <strong className="text-grass-deep">€{(missingForFreeShippingCents / 100).toFixed(2)}</strong></span>
                      <span>🚚 Spedizione gratis</span>
                    </>
                  ) : (
                    <span className="text-grass-deep flex items-center gap-1.5 w-full justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Spedizione gratuita sbloccata!
                    </span>
                  )}
                </p>
                <div className="w-full bg-line/30 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-grass-deep h-full rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* LISTA PRODOTTI */}
          <div className="flex-1 overflow-y-auto p-5 min-h-0 overscroll-contain">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-paper-warm rounded-full flex items-center justify-center text-ink-soft/40 border border-line/50 border-dashed">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-ink font-bold text-lg">Il carrello è vuoto</p>
                  <p className="text-ink-soft text-xs">Aggiungi dei prodotti per iniziare.</p>
                </div>
                <button
                  onClick={closeCart}
                  className="mt-4 px-6 py-3 bg-grass hover:bg-grass-deep hover:-translate-y-0.5 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Continua lo shopping
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 group">
                    {/* Immagine Prodotto */}
                    <div className="w-24 h-28 bg-paper-warm border border-line/40 relative flex-shrink-0 overflow-hidden rounded-xl group-hover:border-grass-deep/30 transition-colors">
                      {item.image ? (
                        <Image src={item.image} alt={item.productName} fill sizes="96px" className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-ink-soft/50 font-mono">No img</div>
                      )}
                    </div>

                    {/* Dettagli Prodotto */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/prodotto/${item.productSlug}`}
                            onClick={closeCart}
                            className="text-[13px] font-bold text-ink hover:text-grass-deep transition-colors line-clamp-2 leading-tight pr-4"
                          >
                            {item.productName}
                          </Link>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-ink-soft/60 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors -mt-1 -mr-1"
                            title="Rimuovi"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                        <p className="text-[11px] text-ink-soft mt-1.5 uppercase tracking-wide">
                          Taglia: <span className="font-bold text-ink bg-paper-warm px-1.5 py-0.5 rounded">{item.size}</span>
                        </p>
                      </div>

                      {/* Selettore Quantità e Prezzo */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center bg-paper-warm border border-line/50 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-ink hover:bg-white rounded-md transition-colors shadow-sm"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                          </button>
                          <span className="w-8 text-center text-[13px] font-bold text-ink">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-ink hover:bg-white rounded-md transition-colors shadow-sm"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                        <span className="font-black text-sm text-ink font-mono bg-paper-warm px-2 py-1 rounded-md">
                          €{((item.priceCents * item.quantity) / 100).toFixed(2)}
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
            <div className="p-5 border-t border-line/40 bg-paper space-y-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] rounded-bl-2xl">
              <div className="flex justify-between items-center text-ink">
                <span className="text-xs font-bold uppercase tracking-widest text-ink-soft">Subtotale</span>
                <span className="text-2xl font-black font-mono">€{totalFormatted}</span>
              </div>
              <p className="text-[10px] text-ink-soft text-center mb-2">
                Spese di spedizione calcolate al checkout.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/carrello"
                  onClick={closeCart}
                  className="flex items-center justify-center border-2 border-line/60 bg-white hover:border-ink hover:text-ink text-ink-soft font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all"
                >
                  Vedi Carrello
                </Link>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all hover:shadow-[0_8px_20px_rgba(var(--grass-rgb),0.3)] hover:-translate-y-0.5"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}