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
    <main className="max-w-[500px] mx-auto px-8 py-12">
      <Link href="/admin" className="text-sm text-mud hover:text-rust mb-6 inline-block">
        ← Torna al catalogo
      </Link>
      <h1 className="font-display text-2xl uppercase text-loden-deep tracking-wide mb-6">
        Autenticazione a due fattori
      </h1>

      {status === "done" ? (
        <p className="text-signal">Attivata correttamente. Da ora ti verrà chiesto il codice a ogni accesso.</p>
      ) : !qrCode ? (
        <button
          onClick={startSetup}
          className="bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide text-sm font-semibold py-3 px-5"
        >
          Attiva 2FA
        </button>
      ) : (
        <div>
          <p className="text-sm text-slate mb-4">
            Scansiona questo codice con Google Authenticator, poi inserisci il codice a 6 cifre generato.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="QR code 2FA" className="mb-4 border border-mud" />
          <form onSubmit={verifyCode} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="border border-mud px-3 py-2 font-mono"
            />
            <button
              type="submit"
              disabled={status === "verifying"}
              className="bg-rust hover:bg-rust-deep text-white text-sm font-medium px-4 py-2"
            >
              Conferma
            </button>
          </form>
          {status === "error" && <p className="text-rust text-sm mt-2">Codice non valido, riprova.</p>}
        </div>
      )}
    </main>
  );
}