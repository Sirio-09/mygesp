"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SetupOtpPage() {
  const router = useRouter();
  const { update } = useSession();
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);
  
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/2fa/setup", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setQrCode(data.qrCodeDataUrl);
        setSecret(data.secret); 
        if (data.backupCodes) {
          setBackupCodes(data.backupCodes);
        }
      });
  }, []);

  const handleCopy = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyBackupCodes = () => {
    if (backupCodes.length === 0) return;
    const textToCopy = `CODICI DI RECUPERO 2FA - MYGESP\n\n` + backupCodes.join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    if (backupCodes.length === 0) return;
    const content = `CODICI DI RECUPERO 2FA - MYGESP\nConserva questi codici in un luogo sicuro.\n\n` + backupCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mygesp-backup-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

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
      await update({ otpVerified: true, totpEnabled: true });
      router.push("/admin");
    } else {
      setError("Codice non valido, riprova.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4 py-12 lg:py-24 selection:bg-grass selection:text-white">
      <div className="w-full max-w-lg bg-paper border border-line/40 p-8 sm:p-12">
        
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-3 block">
            Sicurezza Account
          </span>
          <h1 className="text-3xl font-light text-ink mb-3 tracking-tight">
            Configura 2FA
          </h1>
          <p className="text-sm text-ink-soft font-light leading-relaxed">
            Scansiona l&apos;immagine qui sotto con un&apos;app authenticator per abilitare l&apos;accesso sicuro.
          </p>
        </div>

        <div className="flex flex-col items-center mb-12">
          {qrCode ? (
            <div className="p-4 bg-white border border-line/40 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="QR Code 2FA" className="w-40 h-40 object-contain" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-line/5 border border-line/40 flex items-center justify-center mb-6">
              <span className="text-[10px] uppercase tracking-widest text-ink-soft animate-pulse">
                Generazione...
              </span>
            </div>
          )}

          {secret && (
            <div className="w-full text-center">
              <p className="text-[10px] font-semibold text-ink-soft uppercase tracking-widest mb-3">
                Chiave manuale
              </p>
              <div className="flex items-center justify-center gap-0">
                <code className="bg-line/5 px-4 py-2 text-xs font-mono border-y border-l border-line/40 tracking-[0.1em] text-ink">
                  {secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-ink hover:bg-grass text-white px-4 py-2 border-y border-r border-transparent text-[10px] font-medium uppercase tracking-widest transition-colors"
                >
                  {copied ? "Copiato" : "Copia"}
                </button>
              </div>
            </div>
          )}
        </div>

        {backupCodes.length > 0 && (
          <div className="bg-line/5 border border-line/40 p-6 mb-12">
            <div className="text-center mb-6">
              <h3 className="text-xs font-semibold text-ink uppercase tracking-widest mb-2">
                Codici di Recupero
              </h3>
              <p className="text-xs text-ink-soft font-light">
                Salva questi codici. Ti permetteranno di accedere se perdi il dispositivo.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {backupCodes.map((bCode, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-line/40 py-2 text-center font-mono text-sm tracking-widest text-ink"
                >
                  {bCode}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={handleCopyBackupCodes}
                className="bg-transparent hover:bg-line/10 border border-line/40 text-ink text-[10px] font-semibold uppercase tracking-widest px-6 py-3 transition-colors"
              >
                {copiedCodes ? "Copiati!" : "Copia Tutti"}
              </button>
              <button
                type="button"
                onClick={handleDownloadBackupCodes}
                className="bg-transparent hover:bg-line/10 border border-line/40 text-ink text-[10px] font-semibold uppercase tracking-widest px-6 py-3 transition-colors"
              >
                Scarica .TXT
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleConfirm} className="space-y-6 pt-8 border-t border-line/40">
          <div>
            <label className="block text-[10px] font-semibold text-ink uppercase tracking-widest mb-3 text-center">
              Codice di verifica (6 cifre)
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full bg-transparent border border-line/40 px-4 py-4 text-center text-2xl font-mono tracking-[0.4em] text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !qrCode || code.length !== 6}
            className="w-full bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Verifica in corso..." : "Conferma e Continua"}
          </button>

          {error && (
            <p className="text-[10px] text-red-600 uppercase tracking-widest text-center font-medium mt-4">
              {error}
            </p>
          )}
        </form>

      </div>
    </main>
  );
}