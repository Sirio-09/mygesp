'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/account/ordini'
  const isRegistered = searchParams.get('registered') === 'true'
  const isReset = searchParams.get('reset') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Tenta l'accesso con NextAuth (provider cliente)
      const res = await signIn('customer-login', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (res?.error) {
        // Fallback sul provider standard 'credentials' se configurato in quel modo
        const fallbackRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
          callbackUrl,
        })

        if (fallbackRes?.error) {
          setError('Credenziali non valide. Verifica email e password.')
        } else if (fallbackRes?.ok) {
          router.push(callbackUrl)
          router.refresh()
        }
      } else if (res?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: any) {
      setError('Si è verificato un errore durante l’accesso. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-paper border border-line rounded-lg p-6 sm:p-8 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink uppercase">
          Accedi al tuo account
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Inserisci la tua email e la password per accedere al tuo profilo e agli ordini.
        </p>
      </div>

      {isRegistered && (
        <div className="mb-4 p-3 rounded-md bg-grass/10 border border-grass/30 text-grass-deep text-sm text-center">
          Account creato con successo! Ora puoi effettuare l’accesso.
        </div>
      )}

      {isReset && (
        <div className="mb-4 p-3 rounded-md bg-grass/10 border border-grass/30 text-grass-deep text-sm text-center">
          Password aggiornata con successo! Ora puoi accedere con la nuova password.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-ink">
              Password
            </label>
            <Link
              href="/account/password-dimenticata"
              className="text-xs text-ink-soft hover:text-grass transition-colors"
            >
              Dimenticata?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 bg-paper border border-line rounded-md text-ink placeholder:text-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-grass focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-grass hover:bg-grass-deep text-paper font-semibold rounded-md transition-colors disabled:opacity-50 text-sm tracking-wide uppercase mt-2"
        >
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </button>

        <div className="pt-4 text-center border-t border-line text-sm text-ink-soft">
          Non hai ancora un account?{' '}
          <Link
            href="/account/registrati"
            className="font-semibold text-grass hover:text-grass-deep transition-colors"
          >
            Registrati
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-paper-warm/30 px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-paper border border-line rounded-lg p-6 sm:p-8 shadow-sm text-center text-ink-soft text-sm">
            Caricamento...
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  )
}