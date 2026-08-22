'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Si è verificato un errore.')
      }

      setStatus('success')
      setMessage('Ti abbiamo inviato un’email con le istruzioni per reimpostare la password.')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Errore durante l’invio. Riprova più tardi.')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-paper-warm/30 px-4 py-12">
      <div className="w-full max-w-md bg-paper border border-line rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-ink uppercase">
            Password dimenticata
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Inserisci la tua email, ti invieremo un link per scegliere una nuova password.
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-6">
            <div className="p-4 rounded-md bg-grass/10 border border-grass/30 text-grass-deep text-sm text-center">
              {message}
            </div>
            <div className="text-center">
              <Link
                href="/account/login"
                className="inline-flex items-center text-sm font-medium text-ink hover:text-grass transition-colors"
              >
                ← Torna al login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.it"
                className="w-full px-3.5 py-2.5 bg-paper border border-line rounded-md text-ink placeholder:text-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-grass focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 px-4 bg-grass hover:bg-grass-deep text-paper font-semibold rounded-md transition-colors disabled:opacity-50 text-sm tracking-wide uppercase"
            >
              {status === 'loading' ? 'Invio in corso...' : 'Invia link di ripristino'}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/account/login"
                className="inline-flex items-center text-sm text-ink-soft hover:text-ink transition-colors"
              >
                ← Torna al login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}