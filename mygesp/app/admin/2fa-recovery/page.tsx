"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function RecoveryOtpPage() {
  const router = useRouter();
  const { update } = useSession();

  // Stato del flusso: 1 = Inserimento codice recupero, 2 = Mostra solo QR Code
  const [step, setStep] = useState<1 | 2>(1);

  // Dati per lo step 1
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dati per lo step 2 (QR Code generato)
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");

  // STEP 1: Invia codice di recupero
  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      setStep(2); // Passa alla vista con SOLO il QR Code
    } else {
      setError(data.error || "Codice di recupero non valido");
    }
    setLoading(false);
  };

  // STEP 2: Conferma associazione del nuovo QR Code
  const handleConfirmNewQr = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: confirmCode }),
    });

    if (res.ok) {
      await update({ otpVerified: true, totpEnabled: true });
      router.push("/admin");
    } else {
      setError("Codice errato. Inserisci le 6 cifre dall'app authenticator.");
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
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-line p-8 space-y-6">
        
        {/* STEP 1: INSERIMENTO CODICE DI RECUPERO */}
        {step === 1 && (
          <>
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-soil-deep">
                Accesso d&apos;Emergenza
              </span>
              <h1 className="text-2xl font-extrabold text-ink">
                Codice di Recupero
              </h1>
              <p className="text-xs text-ink-soft leading-relaxed">
                Inserisci uno dei tuoi codici d&apos;emergenza. Il vecchio 2FA verrà azzerato e potrai scansionare un nuovo QR Code.
              </p>
            </div>

            <form onSubmit={handleVerifyRecovery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2 text-center">
                  Codice di Recupero
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  autoFocus
                  className="w-full border border-line px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.2em] text-ink focus:border-grass-deep outline-none transition-colors uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading || recoveryCode.trim().length < 6}
                className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3.5 transition-colors disabled:opacity-50"
              >
                {loading ? "Verifica in corso..." : "Continua al nuovo QR Code"}
              </button>

              {error && (
                <p className="text-xs text-soil-deep text-center font-semibold pt-1">
                  {error}
                </p>
              )}

              <div className="text-center pt-2 border-t border-line">
                <Link
                  href="/admin/2fa-verify"
                  className="text-xs font-medium text-ink-soft hover:text-grass-deep underline transition-colors"
                >
                  Torna alla verifica standard (6 cifre)
                </Link>
              </div>
            </form>
          </>
        )}

        {/* STEP 2: MOSTRA SOLO IL NUOVO QR CODE */}
        {step === 2 && (
          <>
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
                Nuova Configurazione
              </span>
              <h1 className="text-2xl font-extrabold text-ink">
                Nuovo QR Code 2FA
              </h1>
              <p className="text-xs text-ink-soft leading-relaxed">
                Scansiona questo nuovo QR Code con la tua app Authenticator per associare il dispositivo.
              </p>
            </div>

            <div className="flex flex-col items-center py-2 space-y-4">
              {qrCode && (
                <div className="p-3 bg-paper-warm border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="Nuovo QR Code 2FA" className="w-48 h-48 object-contain" />
                </div>
              )}

              {secret && (
                <div className="w-full pt-2 text-center space-y-2">
                  <p className="text-[11px] font-bold text-ink uppercase tracking-wider">
                    Oppure inserisci la chiave manualmente:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="bg-paper-warm px-3 py-1.5 text-xs font-mono border border-line tracking-widest text-soil-deep font-bold">
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="bg-line hover:bg-ink-soft text-ink hover:text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
                    >
                      {copiedSecret ? "Copiato!" : "Copia"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmNewQr} className="space-y-4 pt-2 border-t border-line">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2 text-center">
                  Inserisci le 6 cifre dall&apos;app per attivare
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full border border-line px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.3em] text-ink focus:border-grass-deep outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || confirmCode.length !== 6}
                className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3.5 transition-colors disabled:opacity-50"
              >
                {loading ? "Attivazione in corso..." : "Associa e Accedi"}
              </button>

              {error && (
                <p className="text-xs text-soil-deep text-center font-semibold pt-1">
                  {error}
                </p>
              )}
            </form>
          </>
        )}

      </div>
    </main>
  );
}