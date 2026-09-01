// RegistratiPage.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegistratiPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
    subscribeNewsletter: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("La password deve contenere almeno 6 caratteri.");
      return;
    }

    if (!form.acceptTerms) {
      setError("Devi accettare i Termini e Condizioni e la Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Errore durante la registrazione");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Si è verificato un errore di connessione. Riprova.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="max-w-[440px] mx-auto px-4 sm:px-8 py-20 lg:py-32">
        <h1 className="text-ink font-light text-3xl sm:text-4xl tracking-tight text-center mb-10">
          Controlla la tua email
        </h1>
        <div className="border border-ink p-8 bg-paper text-center mb-8">
          <p className="text-sm font-light text-ink leading-relaxed">
            Abbiamo inviato un link di conferma a <span className="font-medium">{form.email}</span>. Clicca sul link nell&apos;email per attivare il tuo account prima di accedere.
          </p>
        </div>
        <Link
          href="/account/login"
          className="block w-full bg-ink text-white hover:bg-grass text-[11px] font-medium uppercase tracking-[0.2em] py-4 px-6 text-center transition-colors duration-300"
        >
          Vai al Login
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[440px] mx-auto px-4 sm:px-8 py-16 lg:py-24">
      <h1 className="text-ink font-light text-3xl sm:text-4xl tracking-tight text-center mb-10">
        Crea Account
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-transparent border border-line/60 p-4 text-sm font-light text-ink focus:border-ink outline-none transition-colors placeholder:text-ink-soft/50"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full bg-transparent border border-line/60 p-4 text-sm font-light text-ink focus:border-ink outline-none transition-colors placeholder:text-ink-soft/50"
          />
          <input
            type="password"
            placeholder="Password (min. 6 caratteri)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
            className="w-full bg-transparent border border-line/60 p-4 text-sm font-light text-ink focus:border-ink outline-none transition-colors placeholder:text-ink-soft/50"
          />
        </div>

        {/* Checkbox Termini e Newsletter */}
        <div className="flex flex-col gap-4 mt-2">
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                required
                className="appearance-none w-4 h-4 border border-line/60 checked:bg-ink checked:border-ink transition-colors cursor-pointer"
              />
              {form.acceptTerms && (
                <svg className="absolute w-3 h-3 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-xs font-light text-ink-soft leading-relaxed select-none">
              Accetto i <Link href="/termini" className="text-ink font-medium hover:text-grass transition-colors">Termini e Condizioni</Link> e la <Link href="/privacy" className="text-ink font-medium hover:text-grass transition-colors">Privacy Policy</Link>. *
            </span>
          </label>

          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={form.subscribeNewsletter}
                onChange={(e) => setForm({ ...form, subscribeNewsletter: e.target.checked })}
                className="appearance-none w-4 h-4 border border-line/60 checked:bg-ink checked:border-ink transition-colors cursor-pointer"
              />
              {form.subscribeNewsletter && (
                <svg className="absolute w-3 h-3 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-xs font-light text-ink-soft leading-relaxed select-none">
              Desidero ricevere aggiornamenti e promozioni esclusive tramite newsletter.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-white hover:bg-grass text-[11px] font-medium uppercase tracking-[0.2em] py-4 px-6 disabled:opacity-30 disabled:hover:bg-ink transition-colors duration-300 mt-4"
        >
          {loading ? "Registrazione in corso..." : "Registrati"}
        </button>

        {error && (
          <p className="text-red-500 text-[11px] uppercase tracking-[0.1em] font-semibold text-center mt-2">
            {error}
          </p>
        )}
      </form>

      <div className="mt-12 text-center text-sm font-light text-ink-soft">
        Hai già un account?{" "}
        <Link href="/account/login" className="text-ink font-medium hover:text-grass transition-colors duration-300 ml-1">
          Accedi
        </Link>
      </div>
    </main>
  );
}