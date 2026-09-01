'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart-store'

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore()

  const totalCents = items.reduce((acc, item: any) => acc + item.priceCents * item.quantity, 0)
  const totalEuro = (totalCents / 100).toFixed(2)

  const freeShippingThresholdCents = 9900
  const missingForFreeShippingCents = Math.max(0, freeShippingThresholdCents - totalCents)
  const missingForFreeShippingEuro = (missingForFreeShippingCents / 100).toFixed(2)
  const progressPercent = Math.min(100, (totalCents / freeShippingThresholdCents) * 100)

  // Estrattore Immagine
  const getFirstImage = (item: any): string | null => {
    const raw =
      item.image ||
      item.imageUrl ||
      item.coverImage ||
      item.src ||
      (Array.isArray(item.images) ? item.images[0] : null) ||
      item.product?.image ||
      item.product?.imageUrl ||
      (Array.isArray(item.product?.images) ? item.product.images[0] : null) ||
      item.variant?.image ||
      (Array.isArray(item.variant?.images) ? item.variant.images[0] : null) ||
      null

    if (!raw) return null
    if (typeof raw === 'string') return raw
    return raw.url || raw.src || null
  }

  const handleClearCart = () => {
    items.forEach((item: any) => removeItem(item.variantId))
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-paper-warm/30 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-line p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-paper-warm border border-line flex items-center justify-center mx-auto text-2xl text-ink">
            🛒
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
              Carrello Vuoto
            </span>
            <h1 className="text-2xl font-extrabold text-ink">
              Il tuo carrello è vuoto
            </h1>
            <p className="text-xs text-ink-soft max-w-xs mx-auto">
              Non hai ancora aggiunto prodotti. Esplora il nostro catalogo.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block w-full bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-wider py-3.5 transition-colors"
          >
            Inizia gli acquisti
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm/30 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
            Riepilogo Selezione
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Il tuo carrello
          </h1>
        </div>

        <div className="bg-white border border-line p-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-ink">
            {missingForFreeShippingCents > 0 ? (
              <span>
                Aggiungi ancora <strong className="text-grass-deep">€{missingForFreeShippingEuro}</strong> per la Spedizione Gratuita!
              </span>
            ) : (
              <span className="text-grass-deep">
                ✓ Complimenti! Hai diritto alla Spedizione Gratuita
              </span>
            )}
            <span className="font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-paper-warm border border-line h-2 overflow-hidden">
            <div
              className="bg-grass h-2 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-4">
            {items.map((item: any) => {
              const itemTotalEuro = ((item.priceCents * item.quantity) / 100).toFixed(2)
              const unitPriceEuro = (item.priceCents / 100).toFixed(2)
              const imageUrl = getFirstImage(item)

              return (
                <div
                  key={item.variantId}
                  className="bg-white border border-line p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {imageUrl ? (
                      <div className="relative w-20 h-20 bg-paper-warm border border-line shrink-0 overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={item.productName || 'Prodotto'}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-paper-warm border border-line flex items-center justify-center text-[10px] text-center text-ink-soft shrink-0 font-medium p-2 leading-tight">
                        Immagine mancante
                      </div>
                    )}

                    <div className="space-y-1">
                      <h2 className="font-extrabold text-ink text-sm sm:text-base">
                        {item.productName}
                      </h2>
                      <div className="text-xs text-ink-soft space-x-2">
                        <span>Taglia: <strong className="text-ink">{item.size}</strong></span>
                        {item.color && <span>• Colore: <strong className="text-ink">{item.color}</strong></span>}
                      </div>
                      <div className="text-xs font-semibold text-ink-soft sm:hidden">
                        €{unitPriceEuro} cad.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 border-line pt-3 sm:pt-0">
                    
                    <div className="flex items-center border border-line bg-white">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                        }}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1.5 text-ink hover:bg-paper-warm text-sm font-bold transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-xs font-bold text-ink border-x border-line min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-3 py-1.5 text-ink hover:bg-paper-warm text-sm font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-ink">€{itemTotalEuro}</div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-soil-deep hover:underline mt-0.5 font-semibold transition-colors"
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs text-ink-soft hover:text-ink underline uppercase font-semibold tracking-wider transition-colors"
              >
                Svuota Carrello
              </button>
              <Link
                href="/"
                className="text-xs text-grass-deep hover:underline font-bold uppercase tracking-wider"
              >
                ← Continua lo shopping
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white border border-line p-6 space-y-6 sticky top-24">
              <div className="border-b border-line pb-4">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-grass-deep block">
                  Ordine
                </span>
                <h2 className="text-lg font-extrabold text-ink">
                  Riepilogo
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotale prodotti</span>
                  <span className="font-bold text-ink">€{totalEuro}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Spedizione</span>
                  <span className="font-bold text-ink">
                    {missingForFreeShippingCents === 0 ? 'GRATIS' : 'Calcolata al checkout'}
                  </span>
                </div>
                <div className="pt-3 border-t border-line flex justify-between items-baseline">
                  <span className="font-bold uppercase tracking-wider text-ink text-xs">Totale stimato</span>
                  <span className="text-2xl font-extrabold text-ink">€{totalEuro}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-wider py-3.5 transition-colors"
              >
                Procedi al Checkout →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}