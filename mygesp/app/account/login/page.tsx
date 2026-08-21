"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginClientePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("customer-login", { email, password, redirect: false });
    if (result?.error) {
      setError("Credenziali non valide");
      setLoading(false);
    } else {
      router.push("/account/ordini");
    }
  };

  return (
    <main className="max-w-[400px] mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-ink font-extrabold text-2xl mb-6">Accedi</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3 disabled:opacity-50 transition-colors"
        >
          {loading ? "Verifica in corso..." : "Accedi"}
        </button>
        {error && <p className="text-soil-deep text-sm">{error}</p>}
      </form>
      <p className="text-sm text-ink-soft mt-4">
        <Link href="/account/password-dimenticata" className="text-grass-deep hover:underline">
          Password dimenticata?
        </Link>
      </p>
      <p className="text-sm text-ink-soft mt-2">
        Non hai un account?{" "}
        <Link href="/account/registrati" className="text-grass-deep hover:underline">
          Registrati
        </Link>
      </p>
    </main>
  );
}