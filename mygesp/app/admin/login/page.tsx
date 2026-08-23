"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("admin-login", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenziali non valide");
      setLoading(false);
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const totpEnabled = sessionData?.user?.totpEnabled;

    if (totpEnabled) {
      router.push("/admin/2fa-verify");
    } else {
      router.push("/admin/2fa-setup");
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white border border-line p-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
              Accesso Riservato
            </span>
            <h1 className="text-2xl font-extrabold text-ink">
              Area Tecnica
            </h1>
            <p className="text-xs text-ink-soft">
              Inserisci le tue credenziali per accedere al pannello di amministrazione.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Nome utente
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Inserisci il tuo nome utente"
                className="w-full border border-line px-3 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-line px-3 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm py-3.5 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Verifica in corso..." : "Accedi al Pannello"}
            </button>

            {error && (
              <p className="text-xs text-soil-deep text-center font-semibold pt-2 border-t border-line">
                {error}
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-ink-soft">
          Non sei un membro dello staff?{" "}
          <Link href="/" className="text-grass-deep font-semibold hover:underline">
            Torna al sito pubblicamente
          </Link>
        </p>
      </div>
    </main>
  );
}