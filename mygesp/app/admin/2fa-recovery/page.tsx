"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function RecoveryOtpPage() {
  const router = useRouter();
  const { update } = useSession();

  const [step, setStep] = useState<1 | 2>(1);

  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");

  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/2fa/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: recoveryCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setQrCode(data.qrCodeDataUrl);
        setSecret(data.secret);
        await update({ totpEnabled: false });
        setStep(2);
      } else {
        setError(data.error || "Codice di recupero non valido.");
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

  const handleConfirmNewQr = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: confirmCode }),
      });

      const data = await res.json();

      if (res.ok) {
        await update({ otpVerified: true, totpEnabled: true });
        router.push("/admin");
      } else {
        setError(data.error || "Codice errato dall'app authenticator.");
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

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4 py-12 selection:bg-grass selection:text-white">
      <div className="w-full max-w-md bg-paper border border-line/40 p-8 sm:p-12">
        {step === 1 && (
          <>
            <div className="text-center mb-10">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ink-soft mb-3 block">
                Accesso d&apos;Emergenza
              </span>
              <h1 className="text-3xl font-light text-ink mb-3 tracking-tight">
                Codice di Recupero
              </h1>
              <p className="text-sm text-ink-soft font-light leading-relaxed">
                Inserisci uno dei tuoi codici d&apos;emergenza per rigenerare il tuo QR Code.
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

            <form onSubmit={handleVerifyRecovery} className="space-y-6">
              <div>
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-3 text-center">
                  Inserisci il codice
                </label>
                <input
                  type="text"
                  maxLength={12}
                  disabled={isLocked}
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  autoFocus
                  className="w-full bg-transparent border border-line/40 px-4 py-4 text-center text-xl font-mono tracking-[0.3em] text-ink focus:border-grass outline-none transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-line placeholder:font-light"
                />
              </div>

              <button
                type="submit"
                disabled={loading || recoveryCode.trim().length < 6 || isLocked}
                className="w-full bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? "Verifica in corso..." : "Rigenera QR Code"}
              </button>

              <div className="text-center pt-6 border-t border-line/40 mt-6">
                <Link
                  href="/admin/2fa-verify"
                  className="text-[10px] font-semibold text-ink-soft hover:text-grass uppercase tracking-widest transition-colors"
                >
                  &larr; Torna alla verifica standard
                </Link>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-10">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-3 block">
                Nuova Configurazione
              </span>
              <h1 className="text-3xl font-light text-ink mb-3 tracking-tight">
                Nuovo QR Code
              </h1>
              <p className="text-sm text-ink-soft font-light leading-relaxed">
                Scansiona questo QR Code con la tua app per associare il dispositivo.
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

            <div className="flex flex-col items-center mb-10">
              {qrCode && (
                <div className="p-4 bg-white border border-line/40 mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="Nuovo QR Code 2FA" className="w-40 h-40 object-contain" />
                </div>
              )}

              {secret && (
                <div className="w-full text-center">
                  <p className="text-[10px] font-semibold text-ink-soft uppercase tracking-widest mb-3">
                    Oppure inserisci la chiave
                  </p>
                  <div className="flex items-center justify-center gap-0">
                    <code className="bg-line/5 px-4 py-2 text-xs font-mono border-y border-l border-line/40 tracking-[0.1em] text-ink">
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="bg-ink hover:bg-grass text-white px-4 py-2 border-y border-r border-transparent text-[10px] font-medium uppercase tracking-widest transition-colors"
                    >
                      {copiedSecret ? "Copiato" : "Copia"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmNewQr} className="space-y-6 pt-8 border-t border-line/40">
              <div>
                <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-3 text-center">
                  Verifica (6 cifre)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  disabled={isLocked}
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-transparent border border-line/40 px-4 py-4 text-center text-2xl font-mono tracking-[0.4em] text-ink focus:border-grass outline-none transition-colors disabled:opacity-50 placeholder:text-line placeholder:font-light"
                />
              </div>

              <button
                type="submit"
                disabled={loading || confirmCode.length !== 6 || isLocked}
                className="w-full bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? "Attivazione in corso..." : "Associa e Accedi"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}