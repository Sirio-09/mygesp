"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function CambiaPasswordPage() {
  const { update } = useSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Inserisci la password attuale");
      return;
    }

    if (newPassword.length < 8) {
      setError("La password deve contenere almeno 8 caratteri");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    if (newPassword === currentPassword) {
      setError("La nuova password deve essere diversa da quella attuale");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/cambia-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore durante il cambio password");
      }

      await update({ mustChangePassword: false });

      // Il reload completo evita che il router lato client mantenga lo stato vecchio
      window.location.href = "/admin";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4 py-12 selection:bg-grass selection:text-white">
      <div className="w-full max-w-md bg-paper border border-line/40 p-8 sm:p-12">
        
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-3 block">
            Aggiornamento Sicurezza
          </span>
          <h1 className="text-3xl font-light text-ink mb-3 tracking-tight">
            Nuova Password
          </h1>
          <p className="text-sm text-ink-soft font-light leading-relaxed">
            Stai usando una password temporanea. È necessario impostarne una nuova prima di proseguire.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-xs font-medium text-center bg-line/5 text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-3">
              Password Attuale
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-transparent border border-line/40 px-4 py-4 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
              placeholder="Inserisci la password attuale"
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-3">
              Nuova Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent border border-line/40 px-4 py-4 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
              placeholder="Minimo 8 caratteri"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-3">
              Conferma Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent border border-line/40 px-4 py-4 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
              placeholder="Ripeti la password"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Aggiornamento in corso..." : "Salva e Accedi"}
          </button>
        </form>

      </div>
    </main>
  );
}