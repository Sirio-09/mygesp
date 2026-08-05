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
    <main className="min-h-[calc(100vh-64px)] bg-loden-deep flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="bg-canvas border-t-4 border-rust p-8">
          <h1 className="font-display text-2xl uppercase text-loden-deep tracking-wide text-center mb-2">
            Configura la sicurezza
          </h1>
          <p className="text-sm text-slate text-center mb-6">
            Primo accesso: scansiona questo codice con Google Authenticator per proteggere il tuo account.
          </p>

          {qrCode ? (
            <div className="text-center mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="QR code 2FA" className="mx-auto border border-mud" />
            </div>
          ) : (
            <p className="text-center text-mud text-sm mb-6">Generazione codice in corso...</p>
          )}

          <form onSubmit={handleConfirm} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Inserisci il codice a 6 cifre"
              className="w-full bg-white border border-mud px-3 py-2.5 text-sm text-loden-deep font-mono text-center tracking-widest focus:border-rust focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !qrCode}
              className="w-full bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide text-sm font-semibold py-3.5 disabled:opacity-50"
            >
              {loading ? "Verifica in corso..." : "Conferma e continua"}
            </button>
            {error && <p className="text-rust text-sm text-center">{error}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}