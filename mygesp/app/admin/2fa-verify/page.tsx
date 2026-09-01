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
    <main className="min-h-screen bg-paper flex items-center justify-center px-4 py-12 selection:bg-grass selection:text-white">
      <div className="w-full max-w-md bg-paper border border-line/40 p-8 sm:p-12">
        
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-3 block">
            Autenticazione Sicura
          </span>
          <h1 className="text-3xl font-light text-ink mb-3 tracking-tight">
            Verifica 2FA
          </h1>
          <p className="text-sm text-ink-soft font-light leading-relaxed">
            Inserisci il codice a 6 cifre generato dalla tua app Authenticator.
          </p>
        </div>

        {error && (
          <div
            className={`mb-6 p-4 text-xs font-medium text-center border ${
              isLocked
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-line/5 text-ink border-line/40"
            }`}
          >
            {isLocked && (
              <span className="block font-semibold uppercase tracking-widest mb-1 text-[10px]">
                Account Bloccato
              </span>
            )}
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-3 text-center">
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
              className="w-full bg-transparent border border-line/40 px-4 py-4 text-center text-2xl font-mono tracking-[0.4em] text-ink focus:border-grass outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-line placeholder:font-light"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6 || isLocked}
            className="w-full bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Verifica in corso..." : "Verifica e Accedi"}
          </button>

          <div className="text-center pt-6 border-t border-line/40 mt-6">
            <Link
              href="/admin/2fa-recovery"
              className="text-[10px] font-semibold text-ink-soft hover:text-grass uppercase tracking-widest transition-colors"
            >
              Usa un codice di emergenza &rarr;
            </Link>
          </div>
        </form>

      </div>
    </main>
  );
}