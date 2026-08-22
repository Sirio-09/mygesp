'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SearchBar from './SearchBar'
import CartIcon from './CartIcon'
import AccountMenu from './AccountMenu'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Categorie fisse sincronizzate con la logica del database
  const categories = [
    { name: 'Abbigliamento', href: '/categoria/abbigliamento' },
    { name: 'Stivali Termici', href: '/categoria/stivali' },
    { name: 'Attrezzature', href: '/categoria/attrezzature' },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-line shadow-xs">
      {/* Top Bar Informativa */}
      <div className="bg-paper-warm border-b border-line/60 text-xs py-1.5 px-4 text-center font-medium text-ink-soft">
        <span className="hidden sm:inline">Spedizione in tutta Italia • </span>
        <span>Attrezzatura e abbigliamento testati sul campo</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-wider text-ink group-hover:text-grass transition-colors uppercase">
                MY<span className="text-grass">GESP</span>
              </span>
            </Link>
          </div>

          {/* Categorie Desktop (Visibili da breakpoint LG) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {categories.map((cat) => {
              const active = isActive(cat.href)
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className={`text-sm font-semibold tracking-wide uppercase transition-colors relative py-1 ${
                    active
                      ? 'text-grass font-bold'
                      : 'text-ink hover:text-grass'
                  }`}
                >
                  {cat.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-grass rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Ricerca Live Desktop */}
          <div className="hidden md:block flex-1 max-w-xs lg:max-w-md">
            <SearchBar />
          </div>

          {/* Menu Utente, Carrello e Toggle Mobile */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Account Menu */}
            <div className="hidden sm:block">
              <AccountMenu />
            </div>

            {/* Cart Icon */}
            <CartIcon />

            {/* Hamburger Button per Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-ink hover:text-grass hover:bg-paper-warm transition-colors focus:outline-none"
              aria-label="Menu di navigazione"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Ricerca Live Mobile (Visibile sotto MD) */}
        <div className="pb-3 md:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Menu a comparsa Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-paper border-b border-line px-4 pt-2 pb-6 space-y-4">
          <div className="space-y-1 pt-2 pb-3 border-b border-line">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-semibold uppercase tracking-wide ${
                isActive('/') ? 'bg-paper-warm text-grass font-bold' : 'text-ink hover:bg-paper-warm'
              }`}
            >
              Home
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-semibold uppercase tracking-wide ${
                  isActive(cat.href)
                    ? 'bg-paper-warm text-grass font-bold'
                    : 'text-ink hover:bg-paper-warm'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 sm:hidden">
            <AccountMenu />
          </div>
        </div>
      )}
    </header>
  )
}