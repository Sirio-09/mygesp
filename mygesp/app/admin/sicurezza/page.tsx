"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import AdminAlert from "@/components/admin/ui/AdminAlert";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminField from "@/components/admin/ui/AdminField";
import AdminModal from "@/components/admin/ui/AdminModal";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminSection from "@/components/admin/ui/AdminSection";
import AdminSkeleton from "@/components/admin/ui/AdminSkeleton";
import BackupCodesPanel from "@/components/admin/BackupCodesPanel";
import { inputClass } from "@/components/admin/ui/field-styles";
import { Key, Lock, Shield } from "@/components/admin/ui/icons";

/**
 * Account e sicurezza.
 *
 * Il 2FA è obbligatorio e viene configurato al primo accesso, quindi qui non
 * c'è un secondo flusso di attivazione: restano le tre cose che servono dopo:
 * rigenerare i codici di recupero, reimpostare il dispositivo e cambiare la
 * password. La rigenerazione del segreto passa da /api/admin/2fa/regenerate
 * (con password), mai da /api/admin/2fa/setup, che rifiuta gli account attivi.
 */

type SecurityStatus = {
  totpEnabled: boolean;
  remainingCodes: number;
};

type ModalKind = "codes" | "reset" | null;

export default function AccountSicurezzaPage() {
  const router = useRouter();
  const { update } = useSession();

  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const [newCodes, setNewCodes] = useState<string[] | null>(null);

  const [modal, setModal] = useState<ModalKind>(null);
  const [password, setPassword] = useState("");
  const [modalError, setModalError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/2fa/backup-codes");

      if (!res.ok) throw new Error("stato non disponibile");

      const data = await res.json();

      setStatus({
        totpEnabled: Boolean(data.totpEnabled),
        remainingCodes: Number(data.remainingCodes ?? 0),
      });
      setStatusError("");
    } catch {
      setStatusError(
        "Impossibile leggere lo stato della sicurezza. Ricarica la pagina."
      );
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const closeModal = () => {
    if (busy) return;
    setModal(null);
    setPassword("");
    setModalError("");
  };

  const postWithPassword = async (endpoint: string) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Operazione non riuscita. Riprova.");
    }

    return data;
  };

  const handleRegenerateCodes = async () => {
    if (!password) {
      setModalError("Inserisci la password attuale.");
      return;
    }

    setBusy(true);
    setModalError("");

    try {
      const data = await postWithPassword("/api/admin/2fa/backup-codes");
      const codes: string[] = Array.isArray(data.codes) ? data.codes : [];

      setNewCodes(codes);
      setStatus((prev) =>
        prev ? { ...prev, remainingCodes: codes.length } : prev
      );
      setModal(null);
      setPassword("");
      toast.success("Nuovi codici di recupero generati.");
    } catch (error) {
      setModalError(
        error instanceof Error ? error.message : "Errore di rete. Riprova."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResetTwoFactor = async () => {
    if (!password) {
      setModalError("Inserisci la password attuale.");
      return;
    }

    setBusy(true);
    setModalError("");

    try {
      await postWithPassword("/api/admin/2fa/regenerate");
      // Il token deve riflettere il reset, altrimenti il proxy rimanda alla
      // dashboard invece di lasciar completare la nuova configurazione.
      await update({ otpVerified: false, totpEnabled: false });
      toast.success("2FA azzerato: configura il nuovo dispositivo.");
      router.replace("/admin/2fa-setup");
    } catch (error) {
      setModalError(
        error instanceof Error ? error.message : "Errore di rete. Riprova."
      );
      setBusy(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Impostazioni account"
        title="Account e sicurezza"
        description="Il secondo fattore è obbligatorio per tutto lo staff. Qui gestisci i codici di recupero, il dispositivo collegato e la password."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <AdminSection
            label="Autenticazione a due fattori"
            description="Un codice monouso generato dall'app authenticator a ogni accesso."
            actions={
              status?.totpEnabled ? (
                <AdminBadge tone="grass">Attivo</AdminBadge>
              ) : (
                <AdminBadge>Da completare</AdminBadge>
              )
            }
          >
            {statusError ? (
              <AdminAlert tone="danger">{statusError}</AdminAlert>
            ) : !status ? (
              <AdminSkeleton rows={1} />
            ) : (
              <div className="space-y-6">
                <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                      Stato
                    </dt>
                    <dd className="mt-1 text-sm font-light leading-relaxed text-ink">
                      {status.totpEnabled
                        ? "Richiesto a ogni accesso"
                        : "Configurazione da completare"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                      Codici di recupero
                    </dt>
                    <dd className="mt-1 text-sm font-light leading-relaxed text-ink">
                      <span className="tabular-nums">{status.remainingCodes}</span>{" "}
                      su 8 disponibili
                    </dd>
                  </div>
                </dl>

                {status.remainingCodes === 0 && (
                  <AdminAlert tone="danger" title="Codici esauriti">
                    Se perdi il dispositivo non potrai più rientrare: rigenera
                    subito un nuovo set di codici.
                  </AdminAlert>
                )}

                {newCodes && newCodes.length > 0 && (
                  <BackupCodesPanel
                    codes={newCodes}
                    title="Nuovi codici di recupero"
                    description="Sostituiscono i precedenti, che non funzionano più. Copiali o scaricali ora: non verranno mostrati di nuovo."
                  />
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <AdminButton
                    variant="secondary"
                    onClick={() => setModal("codes")}
                    className="sm:flex-1"
                  >
                    <Key className="h-3.5 w-3.5" />
                    Rigenera codici di recupero
                  </AdminButton>
                  <AdminButton
                    variant="secondary"
                    onClick={() => setModal("reset")}
                    className="sm:flex-1"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Reimposta 2FA
                  </AdminButton>
                </div>
              </div>
            )}
          </AdminSection>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <AdminSection label="Password di accesso">
            <p className="text-sm font-light leading-relaxed text-ink-soft">
              Cambiala periodicamente o quando un dispositivo non è più sotto il
              tuo controllo.
            </p>
            <AdminButton
              href="/admin/cambia-password"
              variant="secondary"
              className="mt-5 w-full"
            >
              <Key className="h-3.5 w-3.5" />
              Cambia password
            </AdminButton>
          </AdminSection>

          <AdminSection label="Se perdi il dispositivo">
            <ul className="space-y-3 text-xs font-light leading-relaxed text-ink-soft">
              <li className="flex gap-3">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-grass-deep" />
                Rientra con un codice di recupero, poi reimposta il 2FA dal
                nuovo telefono.
              </li>
              <li className="flex gap-3">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-grass-deep" />
                Conserva i codici fuori dal telefono: insieme al dispositivo
                sarebbero inutili.
              </li>
              <li className="flex gap-3">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-grass-deep" />
                L&apos;app authenticator è personale: una sola utenza per
                persona.
              </li>
            </ul>
          </AdminSection>
        </div>
      </div>

      <AdminModal
        open={modal === "codes"}
        onClose={closeModal}
        title="Rigenera i codici di recupero"
        description="I codici attuali smetteranno di funzionare. Il 2FA resta attivo e l'app authenticator continua a generare codici validi."
        footer={
          <>
            <AdminButton variant="secondary" onClick={closeModal} disabled={busy}>
              Annulla
            </AdminButton>
            <AdminButton onClick={handleRegenerateCodes} disabled={busy}>
              {busy ? "Generazione..." : "Genera nuovi codici"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-5">
          <AdminField
            label="Password attuale"
            required
            hint="Serve a confermare che sia davvero tu."
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleRegenerateCodes();
                }
              }}
              autoComplete="current-password"
              placeholder="Inserisci la password"
              className={inputClass}
            />
          </AdminField>

          {modalError && <AdminAlert tone="danger">{modalError}</AdminAlert>}
        </div>
      </AdminModal>

      <AdminModal
        open={modal === "reset"}
        onClose={closeModal}
        title="Reimposta il 2FA"
        description="Genera un nuovo segreto e nuovi codici di recupero. Serve quando cambi telefono o l'app non è più disponibile."
        footer={
          <>
            <AdminButton variant="secondary" onClick={closeModal} disabled={busy}>
              Annulla
            </AdminButton>
            <AdminButton onClick={handleResetTwoFactor} disabled={busy}>
              {busy ? "Reimpostazione..." : "Reimposta 2FA"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-5">
          <AdminAlert tone="danger" title="Prima di continuare">
            Il codice dell&apos;app attuale smette di funzionare subito. Dovrai
            scansionare il nuovo QR code e confermarlo prima di rientrare nel
            pannello.
          </AdminAlert>

          <AdminField label="Password attuale" required>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleResetTwoFactor();
                }
              }}
              autoComplete="current-password"
              placeholder="Inserisci la password"
              className={inputClass}
            />
          </AdminField>

          {modalError && <AdminAlert tone="danger">{modalError}</AdminAlert>}
        </div>
      </AdminModal>
    </>
  );
}


