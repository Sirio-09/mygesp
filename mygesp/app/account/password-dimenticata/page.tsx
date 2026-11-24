// ForgotPasswordPage.tsx
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
    <main className="max-w-[440px] mx-auto px-4 sm:px-8 py-20 lg:py-32">
      <h1 className="text-ink font-light text-3xl sm:text-4xl tracking-tight text-center mb-10">
        Recupera Password
      </h1>

      {status === "done" ? (
        <div className="border border-ink p-8 bg-paper text-center">
          <p className="text-sm font-light text-ink leading-relaxed">
            Se l&apos;indirizzo è registrato nel nostro sistema, riceverai a breve un&apos;email con le istruzioni per reimpostare la tua password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <p className="text-sm font-light text-ink-soft text-center mb-2">
            Inserisci la tua email. Ti invieremo un link sicuro per scegliere una nuova password.
          </p>
          
          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line/70 bg-transparent px-4 py-3.5 text-sm font-light text-ink outline-none transition-colors duration-200 placeholder:text-ink-soft/70 focus:border-ink"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-ink px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
          >
            {status === "loading" ? "Invio in corso..." : "Invia link di reset"}
          </button>

          {status === "error" && (
            <p className="text-red-500 text-[11px] uppercase tracking-[0.1em] font-semibold text-center mt-2">
              {errorMessage}
            </p>
          )}
        </form>
      )}

      <div className="mt-10 text-center">
        <Link href="/account/login" className="group inline-flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 ease-out-expo hover:text-ink">
          <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Torna al login
        </Link>
      </div>
    </main>
  );
}