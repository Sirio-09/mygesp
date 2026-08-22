'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logica di autenticazione
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-paper border border-line rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
            Accedi al tuo Account
          </h1>
          <p className="text-xs text-ink-soft uppercase tracking-wider">
            Inserisci le tue credenziali per proseguire
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-ink">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@esempio.it"
              className="w-full h-11 px-3 bg-paper border border-line rounded-md text-sm text-ink focus:outline-none focus:border-grass"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-ink">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3 bg-paper border border-line rounded-md text-sm text-ink focus:outline-none focus:border-grass"
            />
          </div>

          {/* Bottone Password Dimenticata */}
          <div className="text-right">
            <Link
              href="/recupero-password"
              className="text-xs font-bold text-ink-soft hover:text-grass transition-colors uppercase tracking-wider"
            >
              Ho dimenticato la password
            </Link>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-grass hover:bg-grass-deep text-paper font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md"
          >
            Accedi
          </button>
        </form>

        <div className="relative border-t border-line pt-6 text-center space-y-3">
          <p className="text-xs text-ink-soft uppercase tracking-wider">
            Non hai ancora un account?
          </p>
          
          {/* Bottone Registrati */}
          <Link
            href="/registrati"
            className="w-full h-12 border-2 border-ink hover:bg-paper-warm text-ink font-bold text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center"
          >
            Registrati
          </Link>
        </div>
      </div>
    </div>
  )
}