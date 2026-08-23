"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SetupOtpPage() {
  const router = useRouter();
  const { update } = useSession();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/2fa/setup", { method: "POST" })
      .then((res) => res.json())
      .then((data) => setQrCode(data.qrCodeDataUrl));
  }, []);

  const handleConfirm = async (e: React.FormEvent) => {
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
      setError("Codice non valido, riprova.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-line p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
            Sicurezza Account
          </span>
          <h1 className="text-2xl font-extrabold text-ink">
            Configura 2FA
          </h1>
          <p className="text-xs text-ink-soft leading-relaxed">
            Scansiona l&apos;immagine qui sotto con un&apos;app authenticator (es. Google Authenticator) per abilitare l&apos;accesso sicuro.
          </p>
        </div>

        <div className="flex justify-center py-2">
          {qrCode ? (
            <div className="p-3 bg-paper-warm border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="QR Code 2FA" className="w-44 h-44 object-contain" />
            </div>
          ) : (
            <div className="w-44 h-44 bg-paper-warm border border-line flex items-center justify-center">
              <span className="text-xs text-ink-soft animate-pulse">Generazione in corso...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
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
              className="w-full border border-line px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.3em] text-ink focus:border-grass-deep outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !qrCode || code.length !== 6}
            className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3.5 transition-colors disabled:opacity-50"
          >
            {loading ? "Verifica in corso..." : "Conferma e continua"}
          </button>

          {error && (
            <p className="text-xs text-soil-deep text-center font-semibold pt-1">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}