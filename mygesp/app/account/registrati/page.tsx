"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegistratiPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      <main className="max-w-[400px] mx-auto px-4 sm:px-8 py-16">
        <h1 className="text-ink font-extrabold text-2xl mb-4">Controlla la tua email</h1>
        <div className="bg-grass/10 border border-grass/30 p-4 rounded-sm mb-6">
          <p className="text-ink text-sm">
            Abbiamo inviato un link di conferma a <strong className="font-bold">{form.email}</strong>. Clicca sul link nell&apos;email per attivare il tuo account prima di accedere.
          </p>
        </div>
        <Link
          href="/account/login"
          className="bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3 px-6 block text-center rounded-sm transition-colors"
        >
          Vai al Login
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[400px] mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-ink font-extrabold text-2xl mb-6">Crea un account</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none rounded-sm transition-colors"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none rounded-sm transition-colors"
        />
        <input
          type="password"
          placeholder="Password (minimo 6 caratteri)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={6}
          className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none rounded-sm transition-colors"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3 disabled:opacity-50 transition-colors rounded-sm cursor-pointer mt-1"
        >
          {loading ? "Registrazione in corso..." : "Registrati"}
        </button>

        {error && (
          <p className="text-soil-deep text-xs font-semibold mt-1">{error}</p>
        )}
      </form>

      <p className="text-sm text-ink-soft mt-6">
        Hai già un account?{" "}
        <Link
          href="/account/login"
          className="text-grass-deep hover:underline font-semibold"
        >
          Accedi
        </Link>
      </p>
    </main>
  );
}