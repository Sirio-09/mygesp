'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'

export default function CheckoutPage() {
  const { items } = useCartStore()

  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [cap, setCap] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shippingEstimate, setShippingEstimate] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Subtotale carrello in centesimi
  const subtotalCents = items.reduce(
    (acc: number, item: any) => acc + (item.priceCents || 0) * item.quantity,
    0
  )

  const isFreeShipping = subtotalCents >= 9900

  // Calcolo stima spedizione
  useEffect(() => {
    if (isFreeShipping) {
      setShippingEstimate(0)
      return
    }

    if (cap.trim().length === 5) {
      const prefix2 = cap.substring(0, 2)
      const isSicilyOrSardinia = [
        '90', '91', '92', '93', '94', '95', '96', '97', '98',
        '07', '08', '09'
      ].includes(prefix2)

      const isVeniceLagoon = cap.startsWith('301')
      const isSpecialZone = isSicilyOrSardinia || isVeniceLagoon

      setShippingEstimate(isSpecialZone ? 990 : 690)
    } else {
      setShippingEstimate(null)
    }
  }, [cap, isFreeShipping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!items || items.length === 0) {
      setError('Il tuo carrello è vuoto.')
      return
    }

    if (!cap || cap.trim().length !== 5) {
      setError('Inserisci un CAP valido di 5 cifre.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i: any) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          cap: cap.trim(),
          email: email.trim(),
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Errore durante l'avvio del pagamento.")
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Si è verificato un errore di connessione. Riprova.')
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <main className="max-w-[1100px] mx-auto px-4 py-12 text-center text-ink-soft">
        Caricamento checkout...
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="max-w-[800px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-ink mb-4">Il tuo carrello è vuoto</h1>
        <p className="text-sm text-ink-soft mb-6">Aggiungi qualche prodotto prima di procedere al checkout.</p>
        <Link
          href="/"
          className="inline-block bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3 px-6 rounded-sm transition-colors"
        >
          Torna allo Shop
        </Link>
      </main>
    )
  }

  const finalTotalCents = subtotalCents + (shippingEstimate ?? 0)

  return (
    <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mb-8">Dati di Spedizione e Pagamento</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Modulo Dati Consegna */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-base font-bold text-ink border-b border-line pb-2 mb-2">
              1. Indirizzo di Consegna
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">Nome e Cognome</label>
                <input
                  type="text"
                  required
                  placeholder="Mario Rossi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-line px-3 py-2.5 text-sm focus:border-grass outline-none rounded-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="mario@esempio.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-line px-3 py-2.5 text-sm focus:border-grass outline-none rounded-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1">Indirizzo e Numero Civico</label>
              <input
                type="text"
                required
                placeholder="Via Roma 10"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-line px-3 py-2.5 text-sm focus:border-grass outline-none rounded-sm transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">Città</label>
                <input
                  type="text"
                  required
                  placeholder="Cuneo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-line px-3 py-2.5 text-sm focus:border-grass outline-none rounded-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">
                  CAP (per calcolo spedizione) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="12045"
                  value={cap}
                  onChange={(e) => setCap(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-line px-3 py-2.5 text-sm font-bold text-ink focus:border-grass outline-none rounded-sm transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3.5 px-6 rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Reindirizzamento a Stripe...' : 'Paga in Sicurezza con Stripe'}
            </button>
          </form>
        </div>

        {/* Riepilogo dell'Ordine */}
        <div className="lg:col-span-5 bg-paper-warm/40 p-6 border border-line rounded-sm h-fit">
          <h2 className="text-base font-bold text-ink border-b border-line pb-2 mb-4">
            Riepilogo Ordine
          </h2>

          <div className="space-y-3 mb-6 max-h-[240px] overflow-y-auto pr-1">
            {items.map((item: any) => (
              <div key={item.variantId} className="flex justify-between items-center text-sm border-b border-line/40 pb-2">
                <div>
                  <p className="font-semibold text-ink">{item.productName}</p>
                  <p className="text-xs text-ink-soft">Taglia: {item.size} × {item.quantity}</p>
                </div>
                <p className="font-bold text-ink">
                  {(((item.priceCents || 0) * item.quantity) / 100).toFixed(2)} €
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-t border-line pt-4">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotale articoli:</span>
              <span className="font-medium text-ink">{(subtotalCents / 100).toFixed(2)} €</span>
            </div>

            <div className="flex justify-between items-center text-ink-soft">
              <span>Spedizione:</span>
              <span className="font-medium text-ink">
                {isFreeShipping ? (
                  <strong className="text-grass font-bold">Gratuita (&gt; 99€)</strong>
                ) : shippingEstimate !== null ? (
                  `${(shippingEstimate / 100).toFixed(2)} €`
                ) : (
                  <span className="text-xs text-ink-soft italic">Inserisci CAP</span>
                )}
              </span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-ink border-t border-line pt-3 mt-2">
              <span>Totale Complessivo:</span>
              <span className="text-grass-deep">{(finalTotalCents / 100).toFixed(2)} €</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}