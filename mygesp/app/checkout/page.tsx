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

  const subtotalCents = items.reduce(
    (acc: number, item: any) => acc + (item.priceCents || 0) * item.quantity,
    0
  )

  const isFreeShipping = subtotalCents >= 9900

  useEffect(() => {
    if (isFreeShipping) {
      setShippingEstimate(0)
      return
    }
    if (cap.trim().length === 5) {
      const prefix2 = cap.substring(0, 2)
      const isSpecialZone = ['90', '91', '92', '93', '94', '95', '96', '97', '98', '07', '08', '09'].includes(prefix2) || cap.startsWith('301')
      setShippingEstimate(isSpecialZone ? 990 : 690)
    } else {
      setShippingEstimate(null)
    }
  }, [cap, isFreeShipping])

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
          items: items.map((i: any) => ({ variantId: i.variantId, quantity: i.quantity })),
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
      <main className="min-h-screen flex flex-col items-center justify-center bg-paper-warm/20">
        <div className="animate-spin w-8 h-8 border-4 border-line border-t-grass rounded-full mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Preparazione checkout sicuro...</p>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="max-w-[800px] mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-3xl font-black uppercase text-ink">Nessun articolo da pagare</h1>
        <p className="text-sm text-ink-soft">Il tuo carrello è vuoto. Aggiungi i prodotti prima di procedere al checkout.</p>
        <Link href="/shop" className="inline-block bg-grass hover:bg-grass-deep text-white font-bold text-sm uppercase tracking-wider py-4 px-8 rounded-md transition-colors shadow-md">
          Torna allo Shop
        </Link>
      </main>
    )
  }

  const finalTotalCents = subtotalCents + (shippingEstimate ?? 0)

  return (
    <main className="min-h-screen bg-paper-warm/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-ink">Checkout Sicuro</h1>
          <div className="flex items-center justify-center gap-2 mt-3 text-grass-deep text-xs font-bold uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Crittografia SSL a 256-bit
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Colonna Modulo */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-white border border-line rounded-xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-black uppercase text-ink mb-6 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-grass text-white flex items-center justify-center text-xs">1</span>
                  Contatti
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink">Nome e Cognome</label>
                    <input type="text" required placeholder="Mario Rossi" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-line px-4 py-3 text-sm focus:border-grass focus:ring-1 focus:ring-grass outline-none rounded-md transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink">Email</label>
                    <input type="email" required placeholder="mario@esempio.it" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line px-4 py-3 text-sm focus:border-grass focus:ring-1 focus:ring-grass outline-none rounded-md transition-all" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-line rounded-xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-black uppercase text-ink mb-6 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-grass text-white flex items-center justify-center text-xs">2</span>
                  Indirizzo di Spedizione
                </h2>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink">Indirizzo e N° Civico</label>
                    <input type="text" required placeholder="Via Roma 10" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-line px-4 py-3 text-sm focus:border-grass focus:ring-1 focus:ring-grass outline-none rounded-md transition-all" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink">Città</label>
                      <input type="text" required placeholder="Milano" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-line px-4 py-3 text-sm focus:border-grass focus:ring-1 focus:ring-grass outline-none rounded-md transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink">CAP <span className="text-grass-deep lowercase text-[10px] ml-1">(calcola spedizione)</span></label>
                      <input type="text" required maxLength={5} placeholder="20100" value={cap} onChange={(e) => setCap(e.target.value.replace(/\D/g, ''))} className="w-full border border-line px-4 py-3 text-sm font-bold text-ink focus:border-grass focus:ring-1 focus:ring-grass outline-none rounded-md transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-soil-deep/10 border border-soil-deep/20 text-soil-deep text-sm font-semibold rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink hover:bg-black text-white font-black text-sm uppercase tracking-widest py-5 px-6 rounded-lg transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? 'Elaborazione...' : 'Procedi al Pagamento Sicuro'}
                {!loading && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </button>
            </form>
          </div>

          {/* Colonna Riepilogo */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-line rounded-xl p-6 sm:p-8 sticky top-24 shadow-sm">
              <h2 className="text-lg font-black uppercase text-ink border-b border-line pb-4 mb-6">
                Riepilogo Ordine
              </h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-line">
                {items.map((item: any) => (
                  <div key={item.variantId} className="flex gap-4 text-sm">
                    <div className="w-16 h-16 bg-paper-warm rounded border border-line shrink-0 flex items-center justify-center text-[10px] text-ink-soft">
                      {/* Qui ci andrebbe l'immagine se disponibile */}
                      {item.quantity}x
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-ink line-clamp-2">{item.productName}</p>
                      <p className="text-xs text-ink-soft mt-1">Taglia: {item.size}</p>
                    </div>
                    <p className="font-black text-ink">
                      {(((item.priceCents || 0) * item.quantity) / 100).toFixed(2)} €
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-line pt-6">
                <div className="flex justify-between text-ink-soft font-medium">
                  <span>Subtotale</span>
                  <span className="text-ink">{(subtotalCents / 100).toFixed(2)} €</span>
                </div>

                <div className="flex justify-between items-center text-ink-soft font-medium">
                  <span>Spedizione</span>
                  <span>
                    {isFreeShipping ? (
                      <strong className="text-grass-deep font-bold uppercase tracking-wider text-xs bg-grass/10 px-2 py-1 rounded">Gratuita</strong>
                    ) : shippingEstimate !== null ? (
                      <span className="text-ink">{(shippingEstimate / 100).toFixed(2)} €</span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-ink-soft italic">Calcolata con CAP</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-end border-t border-line pt-4 mt-4">
                  <span className="font-bold uppercase tracking-wider text-ink text-xs">Da pagare</span>
                  <span className="text-3xl font-black text-ink leading-none">{(finalTotalCents / 100).toFixed(2)} €</span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-line border-dashed">
                <p className="text-[10px] text-ink-soft uppercase tracking-widest text-center font-bold mb-4">Pagamenti accettati</p>
                <div className="flex justify-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all">
                   {/* Sostituisci con icone vere di Stripe, Visa, MC, Apple Pay */}
                   <div className="h-6 w-10 bg-line rounded"></div>
                   <div className="h-6 w-10 bg-line rounded"></div>
                   <div className="h-6 w-10 bg-line rounded"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}