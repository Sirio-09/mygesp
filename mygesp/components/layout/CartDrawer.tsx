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
      className={`fixed inset-0 z-50 overflow-hidden ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Overlay Sfondo con Blur */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full">
        {/* Pannello Drawer */}
        <div
          className={`w-[90vw] max-w-md h-[100dvh] bg-white shadow-2xl flex flex-col justify-between transform-gpu will-change-transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header Drawer */}
          <div className="p-5 border-b border-line flex flex-col gap-4 bg-paper-warm shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-ink flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Carrello ({itemCount})
              </h2>
              <button
                onClick={closeCart}
                className="text-ink-soft hover:text-ink p-1 transition-transform hover:scale-110"
                aria-label="Chiudi carrello"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Barra Spedizione Gratuita nel Drawer */}
            {items.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                  {missingForFreeShippingCents > 0 
                    ? <>Mancano <span className="text-grass-deep">€{(missingForFreeShippingCents / 100).toFixed(2)}</span> alla spedizione gratuita</>
                    : <span className="text-grass-deep flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Spedizione gratuita sbloccata!</span>
                  }
                </p>
                <div className="w-full bg-line/40 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-grass h-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Lista Prodotti */}
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-paper-warm rounded-full flex items-center justify-center text-ink-soft/30">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <p className="text-ink-soft text-sm font-medium">Il tuo carrello è vuoto.</p>
                <button
                  onClick={closeCart}
                  className="mt-4 px-6 py-3 bg-grass hover:bg-grass-deep text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Inizia gli acquisti
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 group">
                    <div className="w-20 h-24 bg-paper-warm border border-line relative flex-shrink-0 overflow-hidden rounded-md">
                      {item.image ? (
                        <Image src={item.image} alt={item.productName} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-ink-soft font-mono">No img</div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/prodotto/${item.productSlug}`}
                            onClick={closeCart}
                            className="text-sm font-extrabold text-ink hover:text-grass-deep transition-colors line-clamp-2 leading-tight"
                          >
                            {item.productName}
                          </Link>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-ink-soft hover:text-red-600 transition-colors"
                            title="Rimuovi"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                        <p className="text-[11px] text-ink-soft mt-1.5">
                          Taglia: <span className="font-bold text-ink">{item.size}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-line rounded-sm">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-ink hover:bg-paper-warm transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                          </button>
                          <span className="w-8 text-center text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-ink hover:bg-paper-warm transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                        <span className="font-black text-sm text-ink">
                          €{((item.priceCents * item.quantity) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Drawer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-line bg-paper-warm space-y-4 shrink-0">
              <div className="flex justify-between items-center text-sm font-bold text-ink">
                <span className="uppercase tracking-wider">Subtotale</span>
                <span className="text-xl font-black">€{totalFormatted}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/carrello"
                  onClick={closeCart}
                  className="flex items-center justify-center border-2 border-line bg-white hover:border-ink hover:text-ink text-ink-soft font-bold text-xs uppercase tracking-widest py-3.5 transition-all rounded"
                >
                  Vedi Carrello
                </Link>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-widest py-3.5 transition-colors shadow-md rounded"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}