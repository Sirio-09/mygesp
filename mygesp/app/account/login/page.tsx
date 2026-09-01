// LoginClientePage.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerifiedParam = searchParams.get("verified") === "true";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("customer-login", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenziali non valide o email non ancora confermata.");
        setLoading(false);
      } else {
        router.push("/account/ordini");
        router.refresh();
      }
    } catch {
      setError("Si è verificato un errore durante l'accesso.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {isVerifiedParam && (
        <div className="border border-ink p-4 bg-paper">
          <p className="text-ink text-[11px] uppercase tracking-[0.1em] font-semibold">
            Email verificata con successo! Ora puoi accedere.
          </p>
        </div>
      )}

      {errorParam === "token-scaduto" && (
        <div className="border border-red-500/30 p-4 bg-red-50">
          <p className="text-red-600 text-[11px] uppercase tracking-[0.1em] font-semibold">
            Il link di verifica non è valido o è scaduto.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-transparent border border-line/60 p-4 text-sm font-light text-ink focus:border-ink outline-none transition-colors placeholder:text-ink-soft/50"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-transparent border border-line/60 p-4 text-sm font-light text-ink focus:border-ink outline-none transition-colors placeholder:text-ink-soft/50"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink text-white hover:bg-grass text-[11px] font-medium uppercase tracking-[0.2em] py-4 px-6 disabled:opacity-30 disabled:hover:bg-ink transition-colors duration-300"
      >
        {loading ? "Verifica in corso..." : "Accedi"}
      </button>

      {error && (
        <p className="text-red-500 text-[11px] uppercase tracking-[0.1em] font-semibold text-center mt-2">
          {error}
        </p>
      )}
    </form>
  );
}

export default function LoginClientePage() {
  return (
    <main className="max-w-[440px] mx-auto px-4 sm:px-8 py-20 lg:py-32">
      <h1 className="text-ink font-light text-3xl sm:text-4xl tracking-tight text-center mb-10">
        Accedi
      </h1>

      <Suspense fallback={<div className="text-[10px] uppercase tracking-[0.2em] text-ink-soft text-center">Caricamento...</div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-10 flex flex-col gap-4 text-center">
        <Link href="/account/password-dimenticata" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft hover:text-ink transition-colors duration-300">
          Password dimenticata?
        </Link>
        <span className="block w-8 h-[1px] bg-line/40 mx-auto my-2"></span>
        <div className="text-sm font-light text-ink-soft">
          Non hai un account?{" "}
          <Link href="/account/registrati" className="text-ink font-medium hover:text-grass transition-colors duration-300 ml-1">
            Registrati
          </Link>
        </div>
      </div>
    </main>
  );
}