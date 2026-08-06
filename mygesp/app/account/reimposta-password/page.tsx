"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return <p className="text-rust text-sm">Link non valido. Richiedi un nuovo link di reset.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      router.push("/account/login");
    } else {
      const data = await res.json();
      setError(data.error || "Errore durante il salvataggio");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="password"
        placeholder="Nuova password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-mud px-3 py-2"
      />
      <input
        type="password"
        placeholder="Conferma nuova password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="border border-mud px-3 py-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide py-3 disabled:opacity-50"
      >
        {loading ? "Salvataggio..." : "Salva nuova password"}
      </button>
      {error && <p className="text-rust text-sm">{error}</p>}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="max-w-[400px] mx-auto px-8 py-16">
      <h1 className="font-display text-2xl uppercase text-loden-deep mb-6">Nuova password</h1>
      <Suspense fallback={<p className="text-sm text-mud">Caricamento...</p>}>
        <ResetPasswordForm />
      </Suspense>
      <p className="text-sm text-mud mt-6">
        <Link href="/account/login" className="text-rust hover:underline">
          ← Torna al login
        </Link>
      </p>
    </main>
  );
}