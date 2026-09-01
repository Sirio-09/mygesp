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
      {/* Overlay Sfondo */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full">
        {/* Pannello Drawer: Stessa larghezza e altezza dinamica del menu mobile (w-[85vw] max-w-xs h-[100dvh]) */}
        <div
          className={`w-[85vw] max-w-xs h-[100dvh] bg-white border-l border-line shadow-2xl flex flex-col justify-between transform-gpu will-change-transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header Drawer */}
          <div className="p-4 border-b border-line flex items-center justify-between bg-paper-warm shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base">🛒</span>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-ink">
                Carrello ({itemCount})
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
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-line min-h-0">
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
                <div key={item.variantId} className="py-3 flex gap-3 first:pt-0">
                  <div className="w-14 h-14 bg-paper-warm border border-line relative flex-shrink-0 overflow-hidden rounded-sm">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="56px"
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
                      <div className="flex justify-between items-start gap-1">
                        <Link
                          href={`/prodotto/${item.productSlug}`}
                          onClick={closeCart}
                          className="text-xs font-bold text-ink hover:text-grass-deep transition-colors truncate"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-ink-soft/60 hover:text-red-600 text-xs transition-colors p-0.5"
                          title="Rimuovi"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[10px] text-ink-soft font-mono mt-0.5">
                        Taglia: <span className="font-bold text-ink">{item.size}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-line bg-white">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-xs text-ink hover:bg-paper-warm"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-xs text-ink hover:bg-paper-warm"
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
            <div className="p-4 border-t border-line bg-paper-warm space-y-3 shrink-0">
              <div className="flex justify-between items-center text-xs font-bold text-ink">
                <span>Totale Provvisorio</span>
                <span className="font-mono text-sm text-grass-deep">
                  €{totalFormatted}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/carrello"
                  onClick={closeCart}
                  className="block text-center border border-line bg-white hover:bg-paper text-ink font-bold text-[11px] uppercase tracking-wider py-2.5 transition-colors"
                >
                  Vedi Carrello
                </Link>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block text-center bg-grass hover:bg-grass-deep text-white font-bold text-[11px] uppercase tracking-wider py-2.5 transition-colors shadow-sm"
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