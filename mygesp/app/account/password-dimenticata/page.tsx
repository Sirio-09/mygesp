"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || "Si è verificato un errore. Riprova.");
        setStatus("error");
        return;
      }

      setStatus("done");
    } catch {
      setErrorMessage("Errore di connessione. Riprova più tardi.");
      setStatus("error");
    }
  };

  return (
    <main className="max-w-[400px] mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-ink font-extrabold text-2xl mb-6">Password dimenticata</h1>

      {status === "done" ? (
        <div className="bg-grass-deep/10 border border-grass-deep/30 p-4 rounded-sm">
          <p className="text-ink text-sm">
            Se l&apos;indirizzo è registrato nel sistema, riceverai a breve un&apos;email con le istruzioni per reimpostare la password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft mb-2">
            Inserisci la tua email. Ti invieremo un link per scegliere una nuova password.
          </p>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none rounded-sm transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3 disabled:opacity-50 transition-colors rounded-sm cursor-pointer"
          >
            {status === "loading" ? "Invio in corso..." : "Invia link di reset"}
          </button>

          {status === "error" && (
            <p className="text-soil-deep text-xs font-semibold mt-1">{errorMessage}</p>
          )}
        </form>
      )}

      <p className="text-sm text-ink-soft mt-6">
        <Link href="/account/login" className="text-grass-deep hover:underline font-semibold">
          ← Torna al login
        </Link>
      </p>
    </main>
  );
}