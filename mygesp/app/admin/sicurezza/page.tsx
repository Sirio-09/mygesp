"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SicurezzaPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "done" | "error">("idle");

  const startSetup = async () => {
    const res = await fetch("/api/admin/2fa/setup", { method: "POST" });
    const data = await res.json();
    setQrCode(data.qrCodeDataUrl);
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("verifying");
    const res = await fetch("/api/admin/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      setStatus("done");
    } else {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8 selection:bg-grass selection:text-white">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-line/40 pb-8 mb-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-2 block">
              Impostazioni Account
            </span>
            <h1 className="text-3xl font-light text-ink tracking-tight mb-2">
              Sicurezza 2FA
            </h1>
            <p className="text-sm text-ink-soft font-light">
              Proteggi l'accesso al pannello configurando un'app di autenticazione.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-[10px] font-semibold text-ink-soft hover:text-grass uppercase tracking-widest transition-colors mb-1"
          >
            &larr; Indietro
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-transparent border border-line/40 p-8 sm:p-12">
          {status === "done" ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 border border-grass text-grass flex items-center justify-center mx-auto text-2xl font-light rounded-full bg-grass/5">
                ✓
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-light text-ink">Autenticazione Attivata</h2>
                <p className="text-sm text-ink-soft font-light leading-relaxed max-w-sm mx-auto">
                  La sicurezza del tuo account è stata aggiornata. Da questo momento ti verrà richiesto il codice monouso generato dall'app ad ogni accesso.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/admin"
                  className="inline-block bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 px-8 transition-colors"
                >
                  Torna alla Dashboard
                </Link>
              </div>
            </div>
          ) : !qrCode ? (
            <div className="space-y-10 text-center">
              <div className="space-y-4">
                <p className="text-sm text-ink-soft font-light leading-relaxed">
                  Usa un'applicazione di autenticazione come <strong className="font-medium text-ink">Google Authenticator</strong>, <strong className="font-medium text-ink">1Password</strong> o <strong className="font-medium text-ink">Authy</strong> per generare codici di verifica temporanei e proteggere l'ambiente amministrativo.
                </p>
              </div>
              <button
                type="button"
                onClick={startSetup}
                className="w-full bg-ink hover:bg-grass text-white font-medium text-[10px] uppercase tracking-widest py-4 transition-colors"
              >
                Inizia Configurazione
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Step 1 */}
              <div className="space-y-6 text-center border-b border-line/40 pb-10">
                <div>
                  <span className="text-[10px] font-semibold text-grass uppercase tracking-widest mb-2 block">
                    Passaggio 1 di 2
                  </span>
                  <h2 className="text-lg font-light text-ink mb-1">Scansiona il codice QR</h2>
                  <p className="text-xs text-ink-soft font-light">
                    Inquadra il codice QR con l'app di autenticazione per aggiungere l'account.
                  </p>
                </div>
                <div className="inline-block p-4 border border-line/40 bg-white">
                  <Image
                    src={qrCode}
                    alt="QR code per la configurazione 2FA"
                    width={192}
                    height={192}
                    className="w-48 h-48"
                    unoptimized
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-6 text-center pt-2">
                <div>
                  <span className="text-[10px] font-semibold text-grass uppercase tracking-widest mb-2 block">
                    Passaggio 2 di 2
                  </span>
                  <h3 className="text-lg font-light text-ink">Verifica Codice</h3>
                </div>

                <form onSubmit={verifyCode} className="space-y-6 max-w-xs mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.trim())}
                    placeholder="000000"
                    required
                    className="w-full bg-transparent border-b border-line/40 pb-3 text-center text-3xl font-light tracking-[0.5em] text-ink focus:border-grass outline-none transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={status === "verifying" || code.length < 6}
                    className="w-full bg-ink hover:bg-grass text-white font-medium text-[10px] uppercase tracking-widest py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {status === "verifying" ? "Verifica..." : "Attiva 2FA"}
                  </button>

                  {status === "error" && (
                    <p className="text-[10px] font-medium text-red-600 uppercase tracking-widest text-center">
                      Codice errato o scaduto.
                    </p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}