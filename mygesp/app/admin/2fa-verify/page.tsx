"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminAlert from "@/components/admin/ui/AdminAlert";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminField from "@/components/admin/ui/AdminField";
import { codeInputClass } from "@/components/admin/ui/field-styles";
import { ArrowRight } from "@/components/admin/ui/icons";
import { formatLockoutTime, useLockoutCountdown } from "@/lib/use-lockout";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLocked, remaining, lock } = useLockoutCountdown();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Il cookie firmato di prova 2FA è impostato dalla risposta: la
        // navigazione successiva passa dal proxy senza toccare il JWT.
        router.push("/admin");
        router.refresh();
      } else if (res.status === 429 && typeof data.lockedUntil === "string") {
        // Blocco attivo: conto alla rovescia e form riabilitato alla scadenza.
        lock(data.lockedUntil);
      } else {
        setError(
          typeof data.error === "string" ? data.error : "Codice non valido."
        );
      }
    } catch {
      setError("Si è verificato un errore di connessione.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-grass-deep">
          Autenticazione sicura
        </p>
        <h1 className="text-3xl font-light tracking-tight text-ink">
          Verifica 2FA
        </h1>
        <p className="mt-3 text-sm font-light leading-relaxed text-ink-soft">
          Inserisci il codice a 6 cifre generato dalla tua app Authenticator.
        </p>
      </div>

      {isLocked ? (
        <AdminAlert className="mt-6" tone="danger" title="Troppi tentativi">
          {`Riprova tra ${formatLockoutTime(remaining)}.`}
        </AdminAlert>
      ) : (
        error && (
          <AdminAlert className="mt-6" tone="danger">
            {error}
          </AdminAlert>
        )
      )}

      <form onSubmit={handleVerify} className="mt-6 space-y-5">
        <AdminField label="Codice TOTP" required>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            disabled={isLocked}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            autoFocus
            className={codeInputClass}
          />
        </AdminField>

        <AdminButton
          type="submit"
          disabled={loading || code.length !== 6 || isLocked}
          arrow={!loading}
          className="w-full"
        >
          {loading ? "Verifica in corso..." : "Verifica e accedi"}
        </AdminButton>
      </form>

      <div className="mt-8 border-t border-line/60 pt-6 text-center">
        <Link
          href="/admin/2fa-recovery"
          className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 ease-out-expo hover:text-ink"
        >
          Usa un codice di emergenza
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
