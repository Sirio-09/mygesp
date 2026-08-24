"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SetupOtpPage() {
  const router = useRouter();
  const { update } = useSession();
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  // Stato per la chiave testuale e il bottone "Copia"
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // NUOVO: Stato per i codici di recupero e feedback di copia
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
        // Salviamo anche i codici di recupero se restituiti dall'API
        if (data.backupCodes) {
          setBackupCodes(data.backupCodes);
        }
      });
  }, []);

  // Funzione per copiare il segreto negli appunti
  const handleCopy = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // NUOVO: Funzione per copiare tutti i codici di recupero
  const handleCopyBackupCodes = () => {
    if (backupCodes.length === 0) return;
    const textToCopy = `CODICI DI RECUPERO 2FA - MYGESP\n\n` + backupCodes.join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  // NUOVO: Funzione per scaricare i codici di recupero in un file .txt
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
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white border border-line p-8 space-y-6">
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

        <div className="flex flex-col items-center py-2 space-y-5">
          {/* QR CODE */}
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

          {/* SOLUZIONE PER MOBILE: Testo e bottone copia */}
          {secret && (
            <div className="w-full pt-4 border-t border-line text-center space-y-2">
              <p className="text-[11px] font-bold text-ink uppercase tracking-wider">
                Non puoi scansionare il QR?
              </p>
              <p className="text-[11px] text-ink-soft mb-2">
                Copia questo codice e inseriscilo manualmente nell&apos;app:
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-paper-warm px-3 py-1.5 text-xs font-mono border border-line tracking-widest text-soil-deep">
                  {secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-line hover:bg-ink-soft text-ink hover:text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  {copied ? "COPIATO!" : "COPIA"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NUOVA SEZIONE: CODICI DI RECUPERO */}
        {backupCodes.length > 0 && (
          <div className="bg-paper-warm border border-line p-4 space-y-3">
            <div className="text-center">
              <p className="text-xs font-bold text-ink uppercase tracking-wider">
                Codici di Recupero d&apos;Emergenza
              </p>
              <p className="text-[11px] text-ink-soft mt-1">
                Salva questi codici. Ti permetteranno di accedere se perdi il dispositivo 2FA.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 py-1">
              {backupCodes.map((bCode, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-line py-1.5 text-center font-mono text-xs font-bold text-ink tracking-wider"
                >
                  {bCode}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyBackupCodes}
                className="bg-white hover:bg-line border border-line text-ink text-[11px] font-bold px-3 py-1.5 transition-colors"
              >
                {copiedCodes ? "Copiati!" : "Copia Tutti"}
              </button>
              <button
                type="button"
                onClick={handleDownloadBackupCodes}
                className="bg-white hover:bg-line border border-line text-ink text-[11px] font-bold px-3 py-1.5 transition-colors"
              >
                Scarica .TXT
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleConfirm} className="space-y-4 pt-2">
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