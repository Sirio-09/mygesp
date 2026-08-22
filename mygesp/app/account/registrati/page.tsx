'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Errore durante la registrazione.')
      }

      router.push('/account/login?registered=true')
    } catch (err: any) {
      setError(err.message || 'Impossibile completare la registrazione.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-paper-warm/30 px-4 py-12">
      <div className="w-full max-w-md bg-paper border border-line rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-ink uppercase">
            Crea un account
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Inserisci i tuoi dati per registrarti e gestire i tuoi ordini.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mario Rossi"
              className="w-full px-3.5 py-2.5 bg-paper border border-line rounded-md text-ink placeholder:text-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-grass focus:border-transparent transition-all"
            />
          </div>

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
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
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
            {loading ? 'Registrazione in corso...' : 'Crea account'}
          </button>

          <div className="pt-4 text-center border-t border-line text-sm text-ink-soft">
            Hai già un account?{' '}
            <Link
              href="/account/login"
              className="font-semibold text-grass hover:text-grass-deep transition-colors"
            >
              Accedi
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}