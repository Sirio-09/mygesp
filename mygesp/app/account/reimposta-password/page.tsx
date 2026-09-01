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
      <div className="text-center space-y-4 py-8">
        <div className="w-12 h-12 bg-soil-deep/10 text-soil-deep rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-soil-deep text-xs font-bold uppercase tracking-wider">
          Token di ripristino non valido o scaduto.
        </p>
        <Link href="/account/password-dimenticata" className="text-grass-deep hover:text-grass text-xs font-bold uppercase block transition-colors">
          Richiedi un nuovo link →
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
        <Link href="/account/login" className="w-full h-12 bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md flex items-center justify-center mt-4">
          Vai al Login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5 relative">
        <label className="block text-xs font-bold uppercase text-ink tracking-wide">
          Nuova Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 px-4 bg-white border border-line rounded-md text-sm text-ink focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass transition-all"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink">
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase text-ink tracking-wide">
          Conferma Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-11 px-4 bg-white border border-line rounded-md text-sm text-ink focus:outline-none focus:border-grass focus:ring-1 focus:ring-grass transition-all"
        />
      </div>

      {error && (
        <div className="p-3 bg-soil-deep/10 border border-soil-deep/20 rounded-md">
          <p className="text-soil-deep text-xs font-semibold text-center">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-2 bg-grass hover:bg-grass-deep text-white font-bold text-xs uppercase tracking-widest rounded-md transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-paper-warm/30">
      <div className="w-full max-w-md bg-white border border-line rounded-xl p-8 space-y-8 shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase text-ink tracking-tight">
            Nuova Password
          </h1>
          <p className="text-xs text-ink-soft uppercase tracking-wider">
            Scegli una password sicura per il tuo account
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-xs text-ink-soft py-8">Caricamento modulo...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="relative border-t border-line pt-6 text-center">
          <Link
            href="/account/login"
            className="text-xs font-bold uppercase tracking-wider text-ink-soft hover:text-ink transition-colors underline-offset-4 hover:underline"
          >
            Annulla e Torna al Login
          </Link>
        </div>
      </div>
    </div>
  )
}