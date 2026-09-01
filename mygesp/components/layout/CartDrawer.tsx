"use client";

import { useCartStore } from "@/lib/cart-store";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  // Selectors atomici per evitare re-render superflui
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalCents = useCartStore((s) => s.totalCents);

  const [mounted, setMounted] = useState(false);

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

  if (!mounted) return null;

  const totalFormatted = (totalCents() / 100).toFixed(2);
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Overlay Sfondo (Rimosso backdrop-blur-sm, usata transition-opacity diretta) */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Pannello Drawer (Aggiunto transform-gpu e will-change-transform per accelerazione hardware) */}
        <div
          className={`w-screen max-w-md bg-white border-l border-line shadow-2xl flex flex-col justify-between transform-gpu will-change-transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header Drawer */}
          <div className="p-5 border-b border-line flex items-center justify-between bg-paper-warm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                Il tuo Carrello ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="text-ink-soft hover:text-ink font-bold text-lg p-1 transition-colors"
              aria-label="Chiudi carrello"
            >
              ✕
            </button>
          </div>

          {/* Lista Prodotti */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-line">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-ink-soft text-sm font-medium mb-4">
                  Il carrello è vuoto.
                </p>
                <button
                  onClick={closeCart}
                  className="text-xs font-bold text-grass-deep uppercase tracking-wider hover:underline"
                >
                  Continua lo shopping →
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="py-4 flex gap-4 first:pt-0">
                  <div className="w-16 h-16 bg-paper-warm border border-line relative flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-ink-soft font-mono">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/prodotto/${item.productSlug}`}
                          onClick={closeCart}
                          className="text-xs font-bold text-ink hover:text-grass-deep transition-colors truncate"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-ink-soft/60 hover:text-red-600 text-xs transition-colors"
                          title="Rimuovi"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[11px] text-ink-soft font-mono mt-0.5">
                        Taglia: <span className="font-bold text-ink">{item.size}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-line bg-white">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-ink hover:bg-paper-warm"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-ink hover:bg-paper-warm"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono font-bold text-xs text-grass-deep">
                        €{((item.priceCents * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Drawer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-line bg-paper-warm space-y-4">
              <div className="flex justify-between items-center text-sm font-bold text-ink">
                <span>Totale Provvisorio</span>
                <span className="font-mono text-base text-grass-deep">
                  €{totalFormatted}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/carrello"
                  onClick={closeCart}
                  className="block text-center border border-line bg-white hover:bg-paper text-ink font-bold text-xs uppercase tracking-wider py-3 transition-colors"
                >
                  Vedi Carrello
                </Link>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block text-center bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-wider py-3 transition-colors shadow-sm"
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