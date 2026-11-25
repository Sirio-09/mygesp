"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminAlert from "@/components/admin/ui/AdminAlert";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminField from "@/components/admin/ui/AdminField";
import { codeInputClass, inputClass } from "@/components/admin/ui/field-styles";
import { ArrowLeft } from "@/components/admin/ui/icons";
import { formatLockoutTime, useLockoutCountdown } from "@/lib/use-lockout";

function RecoveryAlert({
  error,
  isLocked,
  remaining,
}: {
  error: string;
  isLocked: boolean;
  remaining: number;
}) {
  if (isLocked) {
    return (
      <AdminAlert className="mt-6" tone="danger" title="Troppi tentativi">
        {`Riprova tra ${formatLockoutTime(remaining)}.`}
      </AdminAlert>
    );
  }

  if (!error) return null;

  return (
    <AdminAlert className="mt-6" tone="danger">
      {error}
    </AdminAlert>
  );
}

export default function RecoveryOtpPage() {
  const router = useRouter();
  const { update } = useSession();

  const [step, setStep] = useState<1 | 2>(1);

  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLocked, remaining, lock } = useLockoutCountdown();

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");

  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/2fa/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: recoveryCode }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setQrCode(data.qrCodeDataUrl);
        setSecret(data.secret);
        await update({ totpEnabled: false });
        setStep(2);
      } else if (res.status === 429 && typeof data.lockedUntil === "string") {
        lock(data.lockedUntil);
      } else {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Codice di recupero non valido."
        );
      }
    } catch {
      setError("Si è verificato un errore di connessione.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmNewQr = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: confirmCode }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        await update({ totpEnabled: true });
        router.push("/admin");
        router.refresh();
      } else if (res.status === 429 && typeof data.lockedUntil === "string") {
        lock(data.lockedUntil);
      } else {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Codice errato dall'app authenticator."
        );
      }
    } catch {
      setError("Si è verificato un errore di connessione.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = async () => {
    if (!secret) return;

    try {
      await navigator.clipboard.writeText(secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      setError("Copia non riuscita: seleziona la chiave manualmente.");
    }
  };

  return (
    <div>
      {step === 1 ? (
        <>
          <div className="text-center">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
              Accesso d&apos;emergenza
            </p>
            <h1 className="text-3xl font-light tracking-tight text-ink">
              Codice di recupero
            </h1>
            <p className="mt-3 text-sm font-light leading-relaxed text-ink-soft">
              Inserisci uno dei tuoi codici d&apos;emergenza per rigenerare il
              QR code.
            </p>
          </div>

          <RecoveryAlert
            error={error}
            isLocked={isLocked}
            remaining={remaining}
          />

          <form onSubmit={handleVerifyRecovery} className="mt-6 space-y-5">
            <AdminField
              label="Codice di recupero"
              required
              hint="Formato XXXXXX-XXXXXX (o XXXX-XXXX per i codici precedenti)."
            >
              <input
                type="text"
                maxLength={24}
                disabled={isLocked}
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX-XXXXXX"
                autoFocus
                className={`${inputClass} text-center font-mono text-lg uppercase tracking-[0.2em]`}
              />
            </AdminField>

            <AdminButton
              type="submit"
              disabled={loading || recoveryCode.trim().length < 6 || isLocked}
              className="w-full"
            >
              {loading ? "Verifica in corso..." : "Rigenera QR code"}
            </AdminButton>
          </form>

          <div className="mt-8 border-t border-line/60 pt-6 text-center">
            <Link
              href="/admin/2fa-verify"
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 ease-out-expo hover:text-ink"
            >
              <ArrowLeft className="h-3 w-3" />
              Torna alla verifica standard
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="text-center">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-grass-deep">
              Nuova configurazione
            </p>
            <h1 className="text-3xl font-light tracking-tight text-ink">
              Nuovo QR code
            </h1>
            <p className="mt-3 text-sm font-light leading-relaxed text-ink-soft">
              Scansiona questo QR code con la tua app per associare il
              dispositivo.
            </p>
          </div>

          <RecoveryAlert
            error={error}
            isLocked={isLocked}
            remaining={remaining}
          />

          <div className="mt-8 flex flex-col items-center gap-6">
            {qrCode && (
              <div className="border border-line bg-white p-4">
                <Image
                  src={qrCode}
                  alt="Nuovo QR code per la configurazione 2FA"
                  width={160}
                  height={160}
                  className="h-40 w-40"
                  unoptimized
                />
              </div>
            )}

            {secret && (
              <div className="w-full">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                  Oppure inserisci la chiave
                </p>
                <div className="flex items-stretch">
                  <code className="min-w-0 flex-1 break-all border border-line bg-paper-warm/40 px-3 py-2.5 font-mono text-xs tracking-[0.1em] text-ink">
                    {secret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="shrink-0 border border-l-0 border-line bg-ink px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-grass"
                  >
                    {copiedSecret ? "Copiato" : "Copia"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleConfirmNewQr}
            className="mt-8 space-y-5 border-t border-line/60 pt-8"
          >
            <AdminField label="Codice di verifica" required>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                disabled={isLocked}
                value={confirmCode}
                onChange={(e) =>
                  setConfirmCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                className={codeInputClass}
              />
            </AdminField>

            <AdminButton
              type="submit"
              disabled={loading || confirmCode.length !== 6 || isLocked}
              className="w-full"
            >
              {loading ? "Attivazione in corso..." : "Associa e accedi"}
            </AdminButton>
          </form>
        </>

      )}
    </div>
  );
}

