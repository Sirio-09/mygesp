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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {isVerifiedParam && (
        <div className="bg-grass/10 border border-grass/30 p-3 rounded-sm mb-2">
          <p className="text-grass-deep text-xs font-bold">
            Email verificata con successo! Ora puoi accedere.
          </p>
        </div>
      )}

      {errorParam === "token-scaduto" && (
        <div className="bg-soil-deep/10 border border-soil-deep/30 p-3 rounded-sm mb-2">
          <p className="text-soil-deep text-xs font-bold">
            Il link di verifica non è valido o è scaduto.
          </p>
        </div>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none rounded-sm transition-colors"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none rounded-sm transition-colors"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3 disabled:opacity-50 transition-colors rounded-sm cursor-pointer"
      >
        {loading ? "Verifica in corso..." : "Accedi"}
      </button>

      {error && (
        <p className="text-soil-deep text-xs font-semibold mt-1">{error}</p>
      )}
    </form>
  );
}

export default function LoginClientePage() {
  return (
    <main className="max-w-[400px] mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-ink font-extrabold text-2xl mb-6">Accedi</h1>

      <Suspense fallback={<div className="text-sm text-ink-soft">Caricamento...</div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-6 flex flex-col gap-2 text-sm text-ink-soft">
        <p>
          <Link href="/account/password-dimenticata" className="text-grass-deep hover:underline">
            Password dimenticata?
          </Link>
        </p>
        <p>
          Non hai un account?{" "}
          <Link href="/account/registrati" className="text-grass-deep hover:underline font-semibold">
            Registrati
          </Link>
        </p>
      </div>
    </main>
  );
}