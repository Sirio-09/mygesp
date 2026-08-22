"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegistratiPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Errore durante la registrazione");
      setLoading(false);
      return;
    }

    const result = await signIn("customer-login", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Registrazione riuscita, ma login automatico fallito. Prova ad accedere manualmente.");
      setLoading(false);
      return;
    }

    router.push("/account/ordini");
  };

  return (
    <main className="max-w-[400px] mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-ink font-extrabold text-2xl mb-6">Crea un account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border border-line px-3 py-2.5 text-sm focus:border-grass-deep outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3 disabled:opacity-50 transition-colors"
        >
          {loading ? "Registrazione in corso..." : "Registrati"}
        </button>
        {error && <p className="text-soil-deep text-sm">{error}</p>}
      </form>
      <p className="text-sm text-ink-soft mt-4">
        Hai già un account?{" "}
        <Link href="/account/login" className="text-grass-deep hover:underline">
          Accedi
        </Link>
      </p>
    </main>
  );
}