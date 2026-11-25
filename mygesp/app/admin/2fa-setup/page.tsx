"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BackupCodesPanel from "@/components/admin/BackupCodesPanel";
import AdminAlert from "@/components/admin/ui/AdminAlert";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminField from "@/components/admin/ui/AdminField";
import { codeInputClass } from "@/components/admin/ui/field-styles";
import { ArrowRight } from "@/components/admin/ui/icons";
import { formatLockoutTime, useLockoutCountdown } from "@/lib/use-lockout";

export default function SetupOtpPage() {
  const router = useRouter();
  const { update } = useSession();
  const [qrCode, setQrCode] = useState<string | null>(null);

  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Il backend riusa il secret già salvato (setup idempotente) e in quel caso
  // non può rimostrare i codici di recupero: in DB ci sono solo gli hash.
  const [reused, setReused] = useState(false);

  const { isLocked, remaining, lock } = useLockoutCountdown();

  // Il setup va richiesto una sola volta per montaggio: un secondo POST
  // genererebbe un nuovo secret sotto gli occhi dell'utente.
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    const loadSetup = async () => {
      try {
        const res = await fetch("/api/admin/2fa/setup", { method: "POST" });

        // 409: il 2FA è già attivo nel database ma il token non lo sa (update
        // fallita o sessione vecchia). Si torna alla verifica invece di
        // sovrascrivere un secret che sta funzionando.
        if (res.status === 409) {
          // Il database sa che il 2FA è attivo: allineiamo solo il flag di UI
          // (non è un'autorizzazione) e passiamo alla verifica.
          await update({ totpEnabled: true });
          router.replace("/admin/2fa-verify");
          return;
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(
            typeof data.error === "string"
              ? data.error
              : "Impossibile generare il QR code."
          );
          return;
        }

        setQrCode(typeof data.qrCodeDataUrl === "string" ? data.qrCodeDataUrl : null);
        setSecret(typeof data.secret === "string" ? data.secret : null);
        setReused(data.reused === true);
        if (Array.isArray(data.backupCodes)) {
          setBackupCodes(data.backupCodes);
        }
      } catch {
        setError("Impossibile generare il QR code.");
      }
    };

    void loadSetup();
  }, [router, update]);

  const handleCopy = async () => {
    if (!secret) return;

    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copia non riuscita: seleziona la chiave manualmente.");
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
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
        await update({ totpEnabled: true });
        router.push("/admin");
        router.refresh();
        return;
      }

      // 429: troppi tentativi. Mostriamo il conto alla rovescia invece del
      // generico "codice non valido" (che nascondeva il vero motivo).
      if (res.status === 429 && typeof data.lockedUntil === "string") {
        lock(data.lockedUntil);
        setLoading(false);
        return;
      }

      setError(
        typeof data.error === "string" ? data.error : "Codice non valido, riprova."
      );
    } catch {
      setError("Errore di connessione, riprova.");
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="text-center">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-grass-deep">
          Sicurezza account
        </p>
        <h1 className="text-3xl font-light tracking-tight text-ink">
          Configura 2FA
        </h1>
        <p className="mt-3 text-sm font-light leading-relaxed text-ink-soft">
          Scansiona l&apos;immagine qui sotto con un&apos;app authenticator per
          abilitare l&apos;accesso sicuro.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-5">
        {qrCode ? (
          <div className="border border-line bg-white p-3">
            <Image
              src={qrCode}
              alt="QR code per la configurazione 2FA"
              width={160}
              height={160}
              className="h-40 w-40"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-40 w-40 items-center justify-center border border-line bg-paper-warm/40">
            <span className="animate-pulse text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Generazione...
            </span>
          </div>
        )}

        {secret && (
          <div className="w-full">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
              Chiave manuale
            </p>
            <div className="flex items-stretch">
              <code className="min-w-0 flex-1 break-all border border-line bg-paper-warm/40 px-3 py-2.5 font-mono text-xs tracking-[0.1em] text-ink">
                {secret}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 border border-l-0 border-line bg-ink px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-grass"
              >
                {copied ? "Copiato" : "Copia"}
              </button>
            </div>
          </div>
        )}
      </div>

      {reused && (
        <p className="mt-6 text-center text-[11px] font-light leading-relaxed text-ink-soft">
          Stai usando la chiave già configurata per questo account: i codici di
          recupero restano quelli consegnati in precedenza. Puoi rigenerarli
          dall&apos;area Account e sicurezza.
        </p>
      )}

      {backupCodes.length > 0 && (
        <BackupCodesPanel
          codes={backupCodes}
          className="mt-8"
          description="Servono per rientrare se perdi il dispositivo: copiali o scaricali ora, non verranno mostrati di nuovo."
        />
      )}

      <form
        onSubmit={handleConfirm}
        className="mt-8 space-y-5 border-t border-line/60 pt-8"
      >
        <AdminField label="Codice di verifica (6 cifre)" required>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            disabled={isLocked}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className={codeInputClass}
          />
        </AdminField>

        {isLocked ? (
          <AdminAlert tone="danger" title="Troppi tentativi">
            {`Riprova tra ${formatLockoutTime(remaining)}.`}
          </AdminAlert>
        ) : (
          error && <AdminAlert tone="danger">{error}</AdminAlert>
        )}

        <AdminButton
          type="submit"
          disabled={loading || !qrCode || code.length !== 6 || isLocked}
          className="w-full"
        >
          {loading ? "Verifica in corso..." : "Conferma e continua"}
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

