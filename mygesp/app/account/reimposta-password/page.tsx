'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-paper border border-line rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
            Recupero Password
          </h1>
          <p className="text-xs text-ink-soft uppercase tracking-wider">
            Inserisci la tua email per ricevere le istruzioni di ripristino
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-grass/10 border border-grass/30 rounded-lg text-grass-deep text-xs font-bold uppercase tracking-wider">
              Se l'email è presente nei nostri sistemi, riceverai un link a breve.
            </div>

            <Link
              href="/login"
              className="w-full h-12 bg-grass hover:bg-grass-deep text-paper font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md flex items-center justify-center"
            >
              Torna al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-ink">
                Indirizzo Email
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

            <button
              type="submit"
              className="w-full h-12 bg-grass hover:bg-grass-deep text-paper font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md"
            >
              Invia Link di Ripristino
            </button>
          </form>
        )}

        {!submitted && (
          <div className="relative border-t border-line pt-6 text-center">
            <Link
              href="/login"
              className="w-full h-12 border-2 border-ink hover:bg-paper-warm text-ink font-bold text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center"
            >
              Annulla e Torna al Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}