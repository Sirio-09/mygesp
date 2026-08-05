"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { update } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
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

  const handleShowLost = async () => {
    const res = await fetch("/api/admin/2fa/regenerate", { method: "POST" });
    const data = await res.json();
    setQrCode(data.qrCodeDataUrl);
    setShowQr(true);
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-loden-deep flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-95">
        <div className="bg-canvas border-t-4 border-rust p-8">
          <h1 className="font-display text-2xl uppercase text-loden-deep tracking-wide text-center mb-2">
            Verifica in due passaggi
          </h1>
          <p className="text-sm text-slate text-center mb-6">
            Inserisci il codice dalla tua app di autenticazione.
          </p>

          {showQr && qrCode && (
            <div className="mb-6 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="Nuovo QR code" className="mx-auto border border-mud mb-2" />
              <p className="text-xs text-mud">Scansiona con Google Authenticator, poi inserisci il nuovo codice.</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              autoFocus
              className="w-full bg-white border border-mud px-3 py-2.5 text-sm text-loden-deep font-mono text-center tracking-widest focus:border-rust focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide text-sm font-semibold py-3.5 disabled:opacity-50"
            >
              {loading ? "Verifica in corso..." : "Conferma"}
            </button>
            {error && <p className="text-rust text-sm text-center">{error}</p>}
          </form>

          {!showQr && (
            <button
              onClick={handleShowLost}
              className="w-full text-mud hover:text-rust text-xs text-center mt-4 underline"
            >
              Ho perso l&apos;accesso all&apos;app di autenticazione
            </button>
          )}
        </div>
      </div>
    </main>
  );
}