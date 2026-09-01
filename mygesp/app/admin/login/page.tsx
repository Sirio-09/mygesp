"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("admin-login", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenziali non valide");
      setLoading(false);
      return;
    }

    // Il middleware deciderà se mandare l'utente a cambia-password, 2fa o dashboard
    window.location.href = "/admin";
  };

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-12 selection:bg-grass selection:text-white">
      <div className="w-full max-w-md space-y-6">
        
        <div className="bg-paper border border-line/40 p-8 sm:p-12">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-3 block">
              Accesso Riservato
            </span>
            <h1 className="text-3xl font-light text-ink mb-3 tracking-tight">
              Area Tecnica
            </h1>
            <p className="text-sm text-ink-soft font-light leading-relaxed">
              Inserisci le tue credenziali per accedere al pannello di amministrazione.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-3">
                Nome utente
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Admin username"
                className="w-full bg-transparent border border-line/40 px-4 py-4 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-transparent border border-line/40 px-4 py-4 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Verifica in corso..." : "Accedi"}
            </button>

            {error && (
              <p className="text-[10px] text-red-600 uppercase tracking-widest text-center font-medium pt-6 border-t border-line/40">
                {error}
              </p>
            )}
          </form>
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-[10px] font-semibold text-ink-soft hover:text-grass uppercase tracking-widest transition-colors"
          >
            &larr; Torna al sito pubblico
          </Link>
        </div>

      </div>
    </main>
  );
}