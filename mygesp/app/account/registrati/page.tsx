"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegistratiPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Errore durante la registrazione");
      return;
    }

    const result = await signIn("customer-login", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Registrazione riuscita, ma login automatico fallito. Prova ad accedere manualmente.");
      return;
    }

    router.push("/account/ordini");
  };

  return (
    <main className="max-w-[400px] mx-auto px-8 py-16">
      <h1 className="font-display text-2xl uppercase text-loden-deep mb-6">Crea un account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-mud px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-mud px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border border-mud px-3 py-2"
          required
        />
        <button
          type="submit"
          className="bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide py-3"
        >
          Registrati
        </button>
        {error && <p className="text-rust text-sm">{error}</p>}
      </form>
    </main>
  );
}