"use client";
import { useState } from "react";
import Link from "next/link";

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
    <div className="max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <Link
          href="/admin"
          className="text-xs uppercase tracking-wider font-semibold text-ink-soft hover:text-grass-deep transition-colors inline-block mb-4"
        >
          ← Torna al pannello
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
          Autenticazione a Due Fattori (2FA)
        </h1>
        <p className="text-xs sm:text-sm text-ink-soft mt-1">
          Proteggi l&apos;accesso al pannello amministrativo configurando un&apos;app di autenticazione.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-line p-6 sm:p-8">
        {status === "done" ? (
          <div className="p-6 bg-paper-warm border border-grass-deep text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-grass-deep/10 text-grass-deep flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ink">2FA Attivata con Successo</h2>
              <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
                La sicurezza del tuo account è stata aggiornata. Da questo momento ti verrà richiesto il codice monouso generato dalla tua app ad ogni accesso.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-block bg-grass hover:bg-grass-deep text-white text-xs font-bold uppercase tracking-wider py-3 px-6 transition-colors"
              >
                Torna alla Dashboard
              </Link>
            </div>
          </div>
        ) : !qrCode ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-grass-deep uppercase tracking-wider">
                Configurazione Sicurezza
              </span>
              <p className="text-sm text-ink-soft leading-relaxed">
                Usa un&apos;applicazione di autenticazione come Google Authenticator, 1Password o Authy per generare codici di verifica temporanei.
              </p>
            </div>

            <button
              type="button"
              onClick={startSetup}
              className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm uppercase tracking-wider py-3.5 transition-colors"
            >
              Configura e Attiva 2FA
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-grass-deep uppercase tracking-wider">
                Passaggio 1 di 2
              </span>
              <h2 className="text-base font-bold text-ink">Scansiona il codice QR</h2>
              <p className="text-xs text-ink-soft">
                Inquadra il codice QR con la tua app di autenticazione per aggiungere l&apos;account.
              </p>
            </div>

            <div className="flex justify-center p-6 bg-paper-warm border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCode}
                alt="QR code per la configurazione 2FA"
                className="w-48 h-48 border border-line bg-white p-2"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <span className="text-xs font-bold text-grass-deep uppercase tracking-wider">
                  Passaggio 2 di 2
                </span>
                <h3 className="text-sm font-bold text-ink">Verifica Codice</h3>
              </div>

              <form onSubmit={verifyCode} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.trim())}
                    placeholder="123456"
                    required
                    className="w-full border border-line px-4 py-3 text-center text-xl font-mono tracking-[0.3em] text-ink focus:border-grass-deep outline-none transition-colors uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "verifying" || code.length < 6}
                  className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm uppercase tracking-wider py-3.5 transition-colors disabled:opacity-50"
                >
                  {status === "verifying" ? "Verifica in corso..." : "Conferma e Attiva"}
                </button>

                {status === "error" && (
                  <p className="text-xs text-soil-deep font-bold text-center pt-1">
                    Codice non valido o scaduto. Riprova.
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}