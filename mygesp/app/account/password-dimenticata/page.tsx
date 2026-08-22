"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus("done");
  };

  return (
    <main className="max-w-[400px] mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-ink font-extrabold text-2xl mb-6">Password dimenticata</h1>

      {status === "done" ? (
        <p className="text-ink-soft text-sm">
          Se l&apos;indirizzo è registrato, riceverai a breve un&apos;email con le istruzioni per reimpostare la password.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft mb-2">
            Inserisci la tua email, ti invieremo un link per scegliere una nuova password.
          </p>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3 disabled:opacity-50 transition-colors"
          >
            {status === "loading" ? "Invio in corso..." : "Invia link di reset"}
          </button>
        </form>
      )}

      <p className="text-sm text-ink-soft mt-6">
        <Link href="/account/login" className="text-grass-deep hover:underline">
          ← Torna al login
        </Link>
      </p>
    </main>
  );
}