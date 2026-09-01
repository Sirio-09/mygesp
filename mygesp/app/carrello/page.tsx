"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const totalCents = items.reduce((acc: number, item: any) => acc + (item.priceCents * item.quantity), 0);
  const totalEuro = (totalCents / 100).toFixed(2);

  const freeShippingThresholdCents = 9900;
  const missingForFreeShippingCents = Math.max(0, freeShippingThresholdCents - totalCents);
  const missingForFreeShippingEuro = (missingForFreeShippingCents / 100).toFixed(2);
  const progressPercent = Math.min(100, (totalCents / freeShippingThresholdCents) * 100);

  const getFirstImage = (item: any): string | null => {
    const raw = item.image || item.imageUrl || item.coverImage || item.src || (Array.isArray(item.images) ? item.images[0] : null) || item.product?.image || item.product?.imageUrl || (Array.isArray(item.product?.images) ? item.product.images[0] : null) || item.variant?.image || (Array.isArray(item.variant?.images) ? item.variant.images[0] : null) || null;
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    return raw.url || raw.src || null;
  }

  const handleClearCart = () => {
    if(window.confirm('Sei sicuro di voler svuotare il carrello?')) {
      items.forEach((item: any) => removeItem(item.variantId));
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-paper-warm/20 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-line rounded-2xl p-10 space-y-8 text-center shadow-sm">
          <div className="w-24 h-24 bg-paper-warm/50 rounded-full flex items-center justify-center mx-auto text-ink-soft/40 shadow-inner">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-black uppercase tracking-tight text-ink">
              Il carrello è vuoto
            </h1>
            <p className="text-sm text-ink-soft max-w-[250px] mx-auto leading-relaxed">
              Sembra che tu non abbia ancora aggiunto nulla. Scopri le nostre ultime novità.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-block w-full bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-widest py-4 rounded transition-all shadow-md"
          >
            Inizia gli acquisti
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm/30 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-ink tracking-tight">
            Il tuo carrello
          </h1>
          <p className="text-sm text-ink-soft">Hai {items.length} {items.length === 1 ? 'articolo' : 'articoli'} nel carrello</p>
        </div>

        {/* Progress Bar Spedizione Gratuita */}
        <div className="bg-white border border-line rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-end text-xs font-bold uppercase tracking-wider text-ink">
            {missingForFreeShippingCents > 0 ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-grass-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                Aggiungi <span className="text-grass-deep mx-1">€{missingForFreeShippingEuro}</span> per la Spedizione Gratuita!
              </span>
            ) : (
              <span className="text-grass-deep flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Spedizione Gratuita Sbloccata!
              </span>
            )}
            <span className="text-ink-soft hidden sm:block">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-paper-warm rounded-full h-2.5 overflow-hidden border border-line/50">
            <div
              className="bg-grass h-full transition-all duration-700 ease-out relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lista Articoli */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item: any) => {
              const itemTotalEuro = ((item.priceCents * item.quantity) / 100).toFixed(2);
              const imageUrl = getFirstImage(item);

              return (
                <div key={item.variantId} className="bg-white border border-line rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-5 flex-1 w-full">
                    {imageUrl ? (
                      <div className="relative w-24 h-32 sm:h-24 bg-paper-warm border border-line rounded-lg shrink-0 overflow-hidden">
                        <Image src={imageUrl} alt={item.productName || 'Prodotto'} fill sizes="96px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-paper-warm border border-line rounded-lg flex items-center justify-center text-[10px] text-center text-ink-soft shrink-0 p-2">
                        No image
                      </div>
                    )}

                    <div className="space-y-2 flex-1">
                      <h2 className="font-extrabold text-ink text-base sm:text-lg line-clamp-2 leading-tight">
                        {item.productName}
                      </h2>
                      <div className="flex flex-wrap gap-2 text-xs font-medium">
                        <span className="bg-paper-warm px-2.5 py-1 rounded-sm text-ink-soft">Taglia: <strong className="text-ink">{item.size}</strong></span>
                        {item.color && <span className="bg-paper-warm px-2.5 py-1 rounded-sm text-ink-soft">Colore: <strong className="text-ink">{item.color}</strong></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 border-line pt-4 sm:pt-0">
                    {/* Controlli Quantità */}
                    <div className="flex items-center border border-line rounded bg-white overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => item.quantity > 1 && updateQuantity(item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center text-ink hover:bg-paper-warm transition-colors disabled:opacity-30"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-ink border-x border-line">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-ink hover:bg-paper-warm transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <div className="text-xl font-black text-ink">€{itemTotalEuro}</div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-ink-soft hover:text-red-600 flex items-center gap-1 font-semibold transition-colors mt-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Rimuovi
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center pt-4 px-2">
              <Link href="/shop" className="text-xs text-ink-soft hover:text-ink font-bold uppercase tracking-wider flex items-center gap-2 transition-colors group">
                <span className="transform transition-transform group-hover:-translate-x-1">←</span> Continua lo shopping
              </Link>
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs text-ink-soft hover:text-soil-deep underline font-medium transition-colors"
              >
                Svuota Carrello
              </button>
            </div>
          </div>

          {/* Sidebar Resoconto */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-line rounded-xl p-6 sm:p-8 space-y-6 sticky top-24 shadow-sm">
              <div className="border-b border-line pb-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-grass-deep block mb-1">
                  Resoconto
                </span>
                <h2 className="text-xl font-black uppercase text-ink">
                  Totale Ordine
                </h2>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-ink-soft font-medium">
                  <span>Subtotale ({items.length} articoli)</span>
                  <span className="text-ink">€{totalEuro}</span>
                </div>
                <div className="flex justify-between text-ink-soft font-medium">
                  <span>Costi di Spedizione</span>
                  <span className={missingForFreeShippingCents === 0 ? "text-grass-deep font-bold" : "text-ink"}>
                    {missingForFreeShippingCents === 0 ? 'GRATIS' : 'Calcolati al checkout'}
                  </span>
                </div>
                <div className="pt-4 border-t border-line flex justify-between items-end">
                  <span className="font-bold uppercase tracking-wider text-ink text-xs">Totale stimato</span>
                  <span className="text-3xl font-black text-ink leading-none">€{totalEuro}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="flex items-center justify-center w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm uppercase tracking-widest py-4 rounded transition-all shadow-md mt-2"
              >
                Vai al Checkout
              </Link>
              
              <div className="flex items-center justify-center gap-2 pt-2 text-ink-soft/80">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                 <span className="text-[10px] font-bold uppercase tracking-wider">Pagamenti Sicuri</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}