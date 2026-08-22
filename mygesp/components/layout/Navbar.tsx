'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'

export default function Navbar() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((state) => state.items)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cartCount = mounted
    ? items.reduce((acc, item) => acc + (item.quantity || 0), 0)
    : 0

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-line shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-black text-xl tracking-tight text-ink uppercase">
          MyGesp <span className="text-grass">Pro</span>
        </Link>

        {/* Navigazione Principale */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-ink">
          <Link href="/prodotti" className="hover:text-grass transition-colors">
            Tutti i Prodotti
          </Link>
          <Link href="/categoria/abbigliamento" className="hover:text-grass transition-colors">
            Abbigliamento
          </Link>
          <Link href="/categoria/stivali" className="hover:text-grass transition-colors">
            Stivali Termici
          </Link>
        </nav>

        {/* Azioni Utente e Carrello */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-wider text-ink hover:text-grass transition-colors"
          >
            Accedi
          </Link>

          <Link
            href="/carrello"
            className="relative px-3 py-2 bg-grass/10 border border-grass/30 rounded-md text-grass-deep font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-grass hover:text-paper transition-all"
          >
            <span>Carrello</span>
            <span className="bg-grass text-paper font-black text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}