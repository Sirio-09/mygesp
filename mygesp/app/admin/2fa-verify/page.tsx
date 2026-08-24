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
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      await update({ otpVerified: true });
      router.push("/admin");
    } else {
      setError("Codice non valido");
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
            Inserisci il codice temporaneo a 6 cifre generato dalla tua app di autenticazione.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2 text-center">
              Codice di verifica (6 cifre)
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              autoFocus
              className="w-full border border-line px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.3em] text-ink focus:border-grass-deep outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3.5 transition-colors disabled:opacity-50"
          >
            {loading ? "Verifica in corso..." : "Conferma"}
          </button>

          {error && (
            <p className="text-xs text-soil-deep text-center font-semibold pt-1">
              {error}
            </p>
          )}

          <div className="text-center pt-2 border-t border-line">
            <Link
              href="/admin/2fa-recovery"
              className="text-xs font-medium text-ink-soft hover:text-grass-deep underline transition-colors"
            >
              Ho perso l&apos;accesso all&apos;app Authenticator
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}