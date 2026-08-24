"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { update } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        await update({ otpVerified: true });
        router.push("/admin");
      } else {
        setError(data.error || "Codice non valido.");
        if (res.status === 429) {
          setIsLocked(true);
        }
      }
    } catch {
      setError("Si è verificato un errore di connessione.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-line p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
            Autenticazione Sicura
          </span>
          <h1 className="text-2xl font-extrabold text-ink">
            Verifica 2FA
          </h1>
          <p className="text-xs text-ink-soft leading-relaxed">
            Inserisci il codice a 6 cifre generato dalla tua app Authenticator.
          </p>
        </div>

        {error && (
          <div
            className={`p-4 text-xs font-semibold rounded text-center transition-colors ${
              isLocked
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-amber-50 text-amber-900 border border-amber-200"
            }`}
          >
            {isLocked && (
              <span className="block font-bold uppercase tracking-wider mb-1">
                🔒 Account Bloccato
              </span>
            )}
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2 text-center">
              Codice TOTP
            </label>
            <input
              type="text"
              maxLength={6}
              disabled={isLocked}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              autoFocus
              className="w-full border border-line px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.3em] text-ink focus:border-grass-deep outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6 || isLocked}
            className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifica in corso..." : "Verifica e Accedi"}
          </button>

          <div className="text-center pt-2 border-t border-line">
            <Link
              href="/admin/2fa-recovery"
              className="text-xs font-medium text-ink-soft hover:text-grass-deep underline transition-colors"
            >
              Usa un codice di recupero d&apos;emergenza
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}