'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logica di registrazione
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-paper border border-line rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black uppercase text-ink tracking-tight">
            Crea un Account
          </h1>
          <p className="text-xs text-ink-soft uppercase tracking-wider">
            Compila i campi per registrarti alla piattaforma
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-ink">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mario Rossi"
              className="w-full h-11 px-3 bg-paper border border-line rounded-md text-sm text-ink focus:outline-none focus:border-grass"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-ink">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full h-11 px-3 bg-paper border border-line rounded-md text-sm text-ink focus:outline-none focus:border-grass"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-ink">
              Conferma Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full h-11 px-3 bg-paper border border-line rounded-md text-sm text-ink focus:outline-none focus:border-grass"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-grass hover:bg-grass-deep text-paper font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md mt-2"
          >
            Crea Account
          </button>
        </form>

        <div className="relative border-t border-line pt-6 text-center space-y-3">
          <p className="text-xs text-ink-soft uppercase tracking-wider">
            Hai già un account?
          </p>

          <Link
            href="/login"
            className="w-full h-12 border-2 border-ink hover:bg-paper-warm text-ink font-bold text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center"
          >
            Accedi
          </Link>
        </div>
      </div>
    </div>
  )
}