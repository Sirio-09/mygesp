'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart-store'

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calcolo totale
  const totalCents = items.reduce((acc, item: any) => acc + item.priceCents * item.quantity, 0)
  const totalEuro = (totalCents / 100).toFixed(2)

  // Calcolo soglia spedizione gratuita (€99)
  const freeShippingThresholdCents = 9900
  const missingForFreeShippingCents = Math.max(0, freeShippingThresholdCents - totalCents)
  const missingForFreeShippingEuro = (missingForFreeShippingCents / 100).toFixed(2)
  const progressPercent = Math.min(100, (totalCents / freeShippingThresholdCents) * 100)

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante l’avvio del checkout.')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message || 'Impossibile completare l’operazione. Riprova.')
      setLoading(false)
    }
  }

  const handleClearCart = () => {
    items.forEach((item: any) => removeItem(item.variantId))
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-paper-warm border border-line rounded-full flex items-center justify-center mx-auto text-3xl">
          🛒
        </div>
        <h1 className="text-2xl font-black text-ink uppercase tracking-tight">Il tuo carrello è vuoto</h1>
        <p className="text-sm text-ink-soft max-w-md mx-auto">
          Non hai ancora aggiunto prodotti. Esplora il nostro catalogo di abbigliamento e stivali professionali.
        </p>
        <div>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-grass hover:bg-grass-deep text-paper font-bold text-xs uppercase tracking-wider rounded-md transition-colors"
          >
            Inizia gli acquisti
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black text-ink uppercase tracking-tight">Il tuo carrello</h1>

      {/* SOGLIA SPEDIZIONE GRATUITA */}
      <div className="p-4 bg-paper-warm border border-line rounded-lg space-y-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase text-ink">
          {missingForFreeShippingCents > 0 ? (
            <span>Aggiungi ancora €{missingForFreeShippingEuro} per la <strong>Spedizione Gratuita</strong>!</span>
          ) : (
            <span className="text-grass-deep">✓ Complimenti! Hai diritto alla <strong>Spedizione Gratuita</strong></span>
          )}
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-line rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-grass h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ELENCO ARTICOLI (8 colonne) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item: any) => {
            const itemTotalEuro = ((item.priceCents * item.quantity) / 100).toFixed(2)
            const unitPriceEuro = (item.priceCents / 100).toFixed(2)

            return (
              <div
                key={item.variantId}
                className="bg-paper border border-line rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  {item.image ? (
                    <div className="relative w-20 h-20 bg-paper-warm border border-line rounded-md overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.productName} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-paper-warm border border-line rounded-md flex items-center justify-center text-xs text-ink-soft shrink-0">
                      Foto
                    </div>
                  )}

                  <div className="space-y-1">
                    <h2 className="font-bold text-ink uppercase text-sm sm:text-base">{item.productName}</h2>
                    <div className="text-xs text-ink-soft space-x-2">
                      <span>Taglia: <strong>{item.size}</strong></span>
                      {item.color && <span>• Colore: <strong>{item.color}</strong></span>}
                    </div>
                    <div className="text-xs font-bold text-soil sm:hidden">€{unitPriceEuro} cad.</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 border-line pt-3 sm:pt-0">
                  {/* SELETTORE QUANTITÀ */}
                  <div className="flex items-center border border-line rounded-md bg-paper">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-1 text-ink hover:bg-paper-warm text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-bold text-ink border-x border-line">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-3 py-1 text-ink hover:bg-paper-warm text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* PREZZO ED ELIMINAZIONE */}
                  <div className="text-right">
                    <div className="text-base font-black text-ink">€{itemTotalEuro}</div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-xs text-red-600 hover:underline mt-1 font-medium"
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
              className="text-xs text-ink-soft hover:text-ink underline uppercase font-semibold"
            >
              Svuota Carrello
            </button>
            <Link href="/" className="text-xs text-grass hover:text-grass-deep font-bold uppercase">
              ← Continua lo shopping
            </Link>
          </div>
        </div>

        {/* RIEPILOGO E CHECKOUT (4 colonne) */}
        <div className="lg:col-span-4">
          <div className="bg-paper border border-line rounded-lg p-6 space-y-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-black text-ink uppercase tracking-tight border-b border-line pb-3">
              Riepilogo Ordine
            </h2>

            <div className="space-y-3 text-sm">
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
                <span className="font-bold uppercase text-ink">Totale stimato</span>
                <span className="text-2xl font-black text-ink">€{totalEuro}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 bg-grass hover:bg-grass-deep text-paper font-bold text-sm uppercase tracking-wider rounded-md transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Preparazione Checkout...' : 'Procedi al Checkout Sicuro →'}
            </button>

            {/* GARANZIE PAGAMENTO */}
            <div className="space-y-2 text-[11px] text-ink-soft pt-2 border-t border-line text-center">
              <p className="font-bold uppercase text-ink">Pagamento SSL Crittografato</p>
              <p>Accettiamo Carte di Credito, Debito e Stripe.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}