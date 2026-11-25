'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart-store'
import type { CartItem } from '@/lib/cart-store'
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  calculateShippingCents,
  formatEuro,
} from '@/lib/site'

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

  useEffect(() => {
    setMounted(true)
  }, [])

  const subtotalCents = items.reduce(
    (acc: number, item: CartItem) => acc + (item.priceCents || 0) * item.quantity,
    0
  )

  const isFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS

  const shippingEstimate = useMemo(() => {
    if (isFreeShipping) return 0
    const cleanCap = cap.trim()
    if (cleanCap.length !== 5) return null
    // Stessa funzione usata dall'API: l'anteprima non può divergere dal totale reale.
    return calculateShippingCents(subtotalCents, cleanCap)
  }, [cap, isFreeShipping, subtotalCents])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!items || items.length === 0) return setError('Il tuo carrello è vuoto.')
    if (!cap || cap.trim().length !== 5) return setError('Inserisci un CAP valido di 5 cifre.')

    setLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i: CartItem) => ({ variantId: i.variantId, quantity: i.quantity })),
          cap: cap.trim(), email: email.trim(), name: name.trim(), address: address.trim(), city: city.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Errore durante l'avvio del pagamento.")
        setLoading(false)
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setError('Si è verificato un errore di connessione. Riprova.')
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-paper">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-grass-deep"></div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">Preparazione checkout sicuro...</p>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-[720px] space-y-6 px-4 py-24 text-center text-ink">
        <h1 className="text-3xl font-light tracking-tight">Nessun articolo da pagare</h1>
        <p className="text-sm font-light text-ink-soft">Il tuo carrello è vuoto. Aggiungi i prodotti prima di procedere al checkout.</p>
        <Link href="/prodotti" className="group inline-flex items-center gap-3 bg-ink px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass">
          Torna allo Shop
          <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </main>
    )
  }

  const finalTotalCents = subtotalCents + (shippingEstimate ?? 0)

  const labelClass =
    "mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft"
  const fieldClass =
    "w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-soft/60 focus:border-ink"

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 sm:py-20">

        <header className="mb-12 border-b border-line/50 pb-8">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Pagamento
          </p>
          <h1 className="text-3xl font-light tracking-tight text-ink sm:text-4xl">
            Checkout Sicuro
          </h1>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-grass-deep">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Crittografia SSL a 256-bit
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">

          {/* Colonna Modulo */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">

              <section>
                <h2 className="mb-6 flex items-center gap-3 border-b border-line/50 pb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-semibold tabular-nums text-white">1</span>
                  Contatti
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="checkout-name" className={labelClass}>Nome e Cognome</label>
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Mario Rossi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-email" className={labelClass}>Email</label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      placeholder="mario@esempio.it"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-6 flex items-center gap-3 border-b border-line/50 pb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-semibold tabular-nums text-white">2</span>
                  Indirizzo di Spedizione
                </h2>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="checkout-address" className={labelClass}>Indirizzo e N° Civico</label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      autoComplete="street-address"
                      placeholder="Via Roma 10"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="checkout-city" className={labelClass}>Città</label>
                      <input
                        id="checkout-city"
                        type="text"
                        required
                        autoComplete="address-level2"
                        placeholder="Milano"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="checkout-cap" className={labelClass}>
                        CAP
                        <span className="ml-2 font-normal normal-case tracking-normal text-grass-deep">(calcola spedizione)</span>
                      </label>
                      <input
                        id="checkout-cap"
                        type="text"
                        required
                        maxLength={5}
                        autoComplete="postal-code"
                        inputMode="numeric"
                        placeholder="20100"
                        value={cap}
                        onChange={(e) => setCap(e.target.value.replace(/\D/g, ''))}
                        className={`${fieldClass} tabular-nums`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {error && (
                <div className="flex items-start gap-3 border-l-2 border-soil-deep bg-soil-deep/5 p-4 text-sm text-soil-deep">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 bg-ink px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Elaborazione...' : 'Procedi al Pagamento Sicuro'}
                {!loading && (
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                )}
              </button>
            </form>
          </div>

          {/* Colonna Riepilogo */}
          <aside className="lg:col-span-5">
            <div className="sticky top-28 border border-line/70 bg-paper-warm/40 p-6 sm:p-7">
              <h2 className="mb-6 border-b border-line/70 pb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
                Riepilogo Ordine
              </h2>

              <ul className="no-scrollbar mb-6 max-h-[320px] space-y-5 overflow-y-auto pr-1">
                {items.map((item: CartItem) => (
                  <li key={item.variantId} className="flex gap-4">
                    <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-paper">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[8px] font-medium uppercase tracking-[0.14em] text-ink-soft/60">
                          N/D
                        </span>
                      )}
                      <span className="absolute bottom-0 right-0 bg-ink px-1 text-[9px] font-semibold tabular-nums text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">{item.productName}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">Taglia: {item.size}</p>
                    </div>
                    <p className="text-[13px] font-medium tabular-nums text-ink">
                      {formatEuro((item.priceCents || 0) * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="space-y-3 border-t border-line/70 pt-6 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <dt className="font-light">Subtotale</dt>
                  <dd className="font-medium tabular-nums text-ink">{formatEuro(subtotalCents)}</dd>
                </div>

                <div className="flex items-center justify-between text-ink-soft">
                  <dt className="font-light">Spedizione</dt>
                  <dd>
                    {isFreeShipping ? (
                      <span className="bg-grass/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-grass-deep">Gratuita</span>
                    ) : shippingEstimate !== null ? (
                      <span className="font-medium tabular-nums text-ink">{formatEuro(shippingEstimate)}</span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">Calcolata con CAP</span>
                    )}
                  </dd>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-line/70 pt-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">Da pagare</dt>
                  <dd className="text-2xl font-light tabular-nums tracking-tight text-ink">{formatEuro(finalTotalCents)}</dd>
                </div>
              </dl>

              <div className="mt-8 border-t border-dashed border-line pt-6">
                <p className="mb-4 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-soft">Pagamenti accettati</p>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-ink-soft">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">Carte di credito</span>
                  <span className="h-3 w-px bg-line" aria-hidden="true" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">Apple Pay</span>
                  <span className="h-3 w-px bg-line" aria-hidden="true" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">Google Pay</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}