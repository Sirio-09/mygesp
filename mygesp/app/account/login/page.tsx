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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("customer-login", { email, password, redirect: false });
    if (result?.error) {
      setError("Credenziali non valide");
    } else {
      router.push("/account/ordini");
    }
  };

  return (
    <main className="max-w-[400px] mx-auto px-8 py-16">
      <h1 className="font-display text-2xl uppercase text-loden-deep mb-6">Accedi</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-mud px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-mud px-3 py-2"
        />
        <button
          type="submit"
          className="bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide py-3"
        >
          Accedi
        </button>
        {error && <p className="text-rust text-sm">{error}</p>}
      </form>
      <p className="text-sm text-mud mt-4">
        <Link href="/account/password-dimenticata" className="text-rust hover:underline">
          Password dimenticata?
        </Link>
      </p>
      <p className="text-sm text-mud mt-2">
        Non hai un account?{" "}
        <Link href="/account/registrati" className="text-rust hover:underline">
          Registrati
        </Link>
      </p>
    </main>
  );
}