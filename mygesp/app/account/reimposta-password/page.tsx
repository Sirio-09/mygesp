'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token di ripristino non valido o mancante.')
      return
    }

    if (password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri.')
      return
    }

    if (password !== confirmPassword) {
      setError('Le password inserite non coincidono.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reimposta-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Errore durante il ripristino della password.')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Errore di connessione. Riprova più tardi.')
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-soil-deep text-xs font-bold uppercase tracking-wider">
          Token di ripristino non valido o scaduto.
        </p>
        <Link
          href="/account/password-dimenticata"
          className="text-grass-deep hover:underline text-xs font-bold uppercase block"
        >
          Richiedi un nuovo link
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-4 bg-grass/10 border border-grass/30 rounded-lg text-grass-deep text-xs font-bold uppercase tracking-wider">
          Password aggiornata con successo!
        </div>

        <Link
          href="/account/login"
          className="w-full h-12 bg-grass hover:bg-grass-deep text-paper font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md flex items-center justify-center"
        >
          Vai al Login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-xs font-bold uppercase text-ink">
          Nuova Password
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-11 px-3 bg-paper border border-line rounded-md text-sm text-ink focus:outline-none focus:border-grass"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-bold uppercase text-ink">
          Conferma Nuova Password
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-11 px-3 bg-paper border border-line rounded-md text-sm text-ink focus:outline-none focus:border-grass"
        />
      </div>

      {error && (
        <p className="text-soil-deep text-xs font-semibold">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-grass hover:bg-grass-deep text-paper font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Salvataggio in corso...' : 'Salva Nuova Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-paper border border-line rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
            Nuova Password
          </h1>
          <p className="text-xs text-ink-soft uppercase tracking-wider">
            Inserisci la tua nuova password per accedere all&apos;account
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-xs text-ink-soft">Caricamento...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="relative border-t border-line pt-6 text-center">
          <Link
            href="/account/login"
            className="w-full h-12 border-2 border-ink hover:bg-paper-warm text-ink font-bold text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center"
          >
            Annulla e Torna al Login
          </Link>
        </div>
      </div>
    </div>
  )
}