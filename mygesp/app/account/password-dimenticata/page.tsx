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
    <main className="max-w-[400px] mx-auto px-8 py-16">
      <h1 className="font-display text-2xl uppercase text-loden-deep mb-6">Password dimenticata</h1>

      {status === "done" ? (
        <p className="text-slate text-sm">
          Se l&apos;indirizzo è registrato, riceverai a breve un&apos;email con le istruzioni per reimpostare la password.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-sm text-slate mb-2">
            Inserisci la tua email, ti invieremo un link per scegliere una nuova password.
          </p>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-mud px-3 py-2"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide py-3 disabled:opacity-50"
          >
            {status === "loading" ? "Invio in corso..." : "Invia link di reset"}
          </button>
        </form>
      )}

      <p className="text-sm text-mud mt-6">
        <Link href="/account/login" className="text-rust hover:underline">
          ← Torna al login
        </Link>
      </p>
    </main>
  );
}