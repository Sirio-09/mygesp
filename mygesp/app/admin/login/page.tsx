"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import AdminAlert from "@/components/admin/ui/AdminAlert";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminField from "@/components/admin/ui/AdminField";
import { inputClass } from "@/components/admin/ui/field-styles";
import { ArrowLeft } from "@/components/admin/ui/icons";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // Letto dal browser invece che con `useSearchParams()`: questa pagina resta
  // statica e non ha bisogno di un boundary Suspense solo per un messaggio.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("password") === "aggiornata") {
      setNotice("Password aggiornata. Accedi con le nuove credenziali.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
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

    // Il middleware deciderà se mandare l'utente a cambia-password, 2fa o dashboard
    window.location.href = "/admin";
  };

  return (
    <div>
      <div className="text-center">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-grass-deep">
          Accesso riservato
        </p>
        <h1 className="text-3xl font-light tracking-tight text-ink">
          Area tecnica
        </h1>
        <p className="mt-3 text-sm font-light leading-relaxed text-ink-soft">
          Inserisci le tue credenziali per accedere al pannello di
          amministrazione.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <AdminField label="Nome utente" required>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="es. mario.rossi"
            className={inputClass}
          />
        </AdminField>

        <AdminField label="Password" required>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${inputClass} tracking-[0.2em]`}
          />
        </AdminField>

        {notice && <AdminAlert tone="success">{notice}</AdminAlert>}

        {error && <AdminAlert tone="danger">{error}</AdminAlert>}

        <AdminButton
          type="submit"
          disabled={loading}
          arrow={!loading}
          className="w-full"
        >
          {loading ? "Verifica in corso..." : "Accedi"}
        </AdminButton>
      </form>

      <div className="mt-8 border-t border-line/60 pt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 ease-out-expo hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Torna al sito pubblico
        </Link>
      </div>
    </div>
  );
}
