"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function CambiaPasswordPage() {
  const { update } = useSession();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("La password deve contenere almeno 8 caratteri");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/cambia-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore durante il cambio password");
      }

      await update({ mustChangePassword: false });

      // Il reload completo evita che il router lato client mantenga lo stato vecchio
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message || "Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-warm/30 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-md border border-line space-y-6">
        <div>
          <h1 className="text-xl font-bold text-ink">Imposta Nuova Password</h1>
          <p className="text-sm text-ink-soft mt-1">
            Stai usando una password temporanea. È necessario impostarne una nuova prima di proseguire.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nuova Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded text-sm focus:outline-none focus:border-grass-deep"
              placeholder="Almeno 8 caratteri"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Conferma Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded text-sm focus:outline-none focus:border-grass-deep"
              placeholder="Ripeti la password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-grass-deep text-white text-sm font-semibold rounded hover:bg-grass-deep/90 transition disabled:opacity-50"
          >
            {loading ? "Aggiornamento in corso..." : "Salva e Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}