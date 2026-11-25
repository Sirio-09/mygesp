'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

    if (password.length < 8) {
      setError('La password deve contenere almeno 8 caratteri.')
      return
    }

    if (password !== confirmPassword) {
      setError('Le password inserite non coincidono.')
      return
    }

    setLoading(true)

    try {
      // Route reale: /api/auth/reset-password (la vecchia URL italiana non esisteva)
      const res = await fetch('/api/auth/reset-password', {
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
      <div className="text-center space-y-4 py-8">
        <div className="w-12 h-12 bg-soil-deep/10 text-soil-deep rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-soil-deep text-xs font-bold uppercase tracking-wider">
          Token di ripristino non valido o scaduto.
        </p>
        <Link href="/account/password-dimenticata" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-grass-deep transition-colors duration-300 hover:text-grass">
          Richiedi un nuovo link
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="space-y-6 text-center py-6">
        <div className="w-16 h-16 bg-grass/20 text-grass-deep rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <div className="text-grass-deep text-sm font-bold uppercase tracking-wider">
          Password aggiornata con successo!
        </div>
        <Link href="/account/login" className="mt-4 flex h-12 w-full items-center justify-center bg-ink text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass">
          Vai al Login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5 relative">
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Nuova Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full border border-line/70 bg-paper px-4 pr-11 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-soft/60 focus:border-ink"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Nascondi password" : "Mostra password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition-colors duration-200 hover:text-ink">
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Conferma Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="h-11 w-full border border-line/70 bg-paper px-4 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-soft/60 focus:border-ink"
        />
      </div>

      {error && (
        <div className="border-l-2 border-soil-deep bg-soil-deep/5 p-3">
          <p className="text-center text-xs font-medium text-soil-deep">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex h-12 w-full items-center justify-center bg-ink text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Salvataggio...
          </span>
        ) : 'Salva Nuova Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
      <div className="min-h-[70vh] bg-paper px-4 py-16">
      <div className="mx-auto w-full max-w-md border border-line/70 bg-paper p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-light tracking-tight text-ink">
            Nuova Password
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Scegli una password sicura per il tuo account
          </p>
        </div>

        <div className="mt-8">
        <Suspense fallback={<div className="py-8 text-center text-xs text-ink-soft">Caricamento modulo...</div>}>
          <ResetPasswordForm />
        </Suspense>
        </div>

        <div className="relative mt-8 border-t border-line/70 pt-6 text-center">
          <Link
            href="/account/login"
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft underline-offset-4 transition-colors duration-300 hover:text-ink hover:underline"
          >
            Annulla e Torna al Login
          </Link>
        </div>
      </div>
      </div>
  )
}