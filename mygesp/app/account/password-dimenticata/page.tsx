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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-line/60 p-4 text-sm font-light text-ink focus:border-ink outline-none transition-colors placeholder:text-ink-soft/50"
          />
          
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-ink text-white hover:bg-grass text-[11px] font-medium uppercase tracking-[0.2em] py-4 px-6 disabled:opacity-30 disabled:hover:bg-ink transition-colors duration-300"
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
        <Link href="/account/login" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft hover:text-ink transition-colors duration-300 flex items-center justify-center gap-2">
          <span>&larr;</span> Torna al login
        </Link>
      </div>
    </main>
  );
}