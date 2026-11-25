"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import AdminAlert from "@/components/admin/ui/AdminAlert";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminEmptyState from "@/components/admin/ui/AdminEmptyState";
import AdminField from "@/components/admin/ui/AdminField";
import AdminModal from "@/components/admin/ui/AdminModal";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminSection from "@/components/admin/ui/AdminSection";
import AdminSkeleton from "@/components/admin/ui/AdminSkeleton";
import { inputClass } from "@/components/admin/ui/field-styles";
import { Copy, Users } from "@/components/admin/ui/icons";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  totpEnabled: boolean;
  isManager: boolean;
  mustChangePassword?: boolean;
};

type PendingAction = {
  type: "reset" | "delete";
  id: string;
  username: string;
};

export default function UtentiAdminPage() {
  const { data: session } = useSession();
  const isManager = (session?.user as { isManager?: boolean })?.isManager;
  const currentUserId = (session?.user as { id?: string })?.id;

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Form nuova utenza
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password temporanea da comunicare
  const [tempPasswordData, setTempPasswordData] = useState<{
    username: string;
    tempPassword: string;
    message?: string;
  } | null>(null);

  const [resettingId, setResettingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const loadAdmins = useCallback(async () => {
    try {
      setLoadingAdmins(true);
      const res = await fetch("/api/admin/utenti");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch {
      setError("Errore durante il caricamento della lista utenti.");
      toast.error("Impossibile caricare la lista utenti");
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/utenti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsername("");
        setEmail("");
        setTempPasswordData({
          username: data.username,
          tempPassword: data.tempPassword ?? "",
          message: data.message,
        });
        toast.success("Utenza creata");
        await loadAdmins();
      } else {
        setError(data.error || "Errore durante la creazione dell'utente.");
      }
    } catch {
      setError("Errore di connessione. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const copyTempPassword = async () => {
    if (!tempPasswordData?.tempPassword) return;

    try {
      await navigator.clipboard.writeText(tempPasswordData.tempPassword);
      toast.success("Password copiata negli appunti");
    } catch {
      toast.error("Copia non riuscita: seleziona il testo manualmente");
    }
  };

  const runResetPassword = async (id: string, targetUsername: string) => {
    try {
      setResettingId(id);
      const res = await fetch(`/api/admin/utenti/${id}/reset-password`, {
        method: "POST",
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setTempPasswordData({
          username: targetUsername,
          tempPassword: data?.tempPassword ?? "",
          message: data?.message,
        });
        toast.success("Password temporanea generata");
        await loadAdmins();
      } else {
        toast.error(data?.error || "Errore durante il reset della password.");
      }
    } catch {
      toast.error("Errore di rete durante il reset della password.");
    } finally {
      setResettingId(null);
    }
  };

  const runDelete = async (id: string, targetUsername: string) => {
    try {
      const res = await fetch(`/api/admin/utenti/${id}`, { method: "DELETE" });

      if (res.ok) {
        toast.success(`Utente "${targetUsername}" eliminato`);
        await loadAdmins();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Errore durante l'eliminazione.");
      }
    } catch {
      toast.error("Si è verificato un errore durante l'eliminazione.");
    }
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;

    const action = pendingAction;
    setPendingAction(null);

    if (action.type === "reset") {
      await runResetPassword(action.id, action.username);
    } else {
      await runDelete(action.id, action.username);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Sicurezza e accessi"
        title="Gestione staff"
        description="Amministra gli accessi e le credenziali del personale abilitato al pannello."
      />

      {tempPasswordData && (
        <AdminSection
          className="mt-8"
          label="Password temporanea generata"
          actions={
            <AdminButton
              variant="ghost"
              onClick={() => setTempPasswordData(null)}
            >
              Chiudi
            </AdminButton>
          }
        >
          <div className="space-y-5" aria-live="polite">
            <p className="text-sm font-light leading-relaxed text-ink-soft">
              {tempPasswordData.tempPassword ? (
                <>
                  Comunica questa password a{" "}
                  <strong className="font-medium text-ink">
                    {tempPasswordData.username}
                  </strong>
                  . Al prossimo accesso gli verrà richiesto il cambio
                  obbligatorio.
                </>
              ) : (
                <>{tempPasswordData.message}</>
              )}
            </p>

            {tempPasswordData.tempPassword && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <code className="flex-1 select-all border border-line bg-paper-warm/40 px-4 py-3 text-center font-mono text-base tabular-nums tracking-[0.1em] text-ink sm:text-left">
                  {tempPasswordData.tempPassword}
                </code>
                <AdminButton variant="secondary" onClick={copyTempPassword}>
                  <Copy className="h-3.5 w-3.5" />
                  Copia
                </AdminButton>
              </div>
            )}

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              La password viene mostrata una sola volta
            </p>
          </div>
        </AdminSection>
      )}

      <AdminSection
        className="mt-8"
        label="Membri staff"
        description="Ruoli, stato del 2FA e credenziali di ogni account."
        flush
        actions={
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            {admins.length} {admins.length === 1 ? "utente" : "utenti"}
          </span>
        }
      >
        {loadingAdmins ? (
          <div className="p-5 sm:p-6">
            <AdminSkeleton rows={2} />
          </div>
        ) : admins.length === 0 ? (
          <div className="p-5 sm:p-6">
            <AdminEmptyState
              icon={<Users className="h-5 w-5" />}
              title="Nessun utente staff"
              description="Crea la prima utenza per dare accesso all'area tecnica."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line/60">
            {admins.map((admin) => (
              <li
                key={admin.id}
                className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-light text-ink">
                      {admin.username}
                    </p>
                    {admin.isManager && (
                      <AdminBadge tone="neutral">Manager</AdminBadge>
                    )}
                    {admin.id === currentUserId && (
                      <AdminBadge tone="grass">Tu</AdminBadge>
                    )}
                  </div>

                  <p className="mt-1 truncate text-xs font-light text-ink-soft">
                    {admin.email}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <AdminBadge tone={admin.totpEnabled ? "grass" : "neutral"}>
                      2FA {admin.totpEnabled ? "attivo" : "disattivo"}
                    </AdminBadge>
                    {admin.mustChangePassword && (
                      <AdminBadge tone="soil">Password temporanea</AdminBadge>
                    )}
                  </div>
                </div>

                {isManager && (
                  <div className="flex shrink-0 flex-wrap items-center gap-5">
                    <AdminButton
                      variant="ghost"
                      disabled={resettingId === admin.id}
                      onClick={() =>
                        setPendingAction({
                          type: "reset",
                          id: admin.id,
                          username: admin.username,
                        })
                      }
                    >
                      {resettingId === admin.id
                        ? "Generazione..."
                        : "Reset password"}
                    </AdminButton>

                    {admin.id !== currentUserId && (
                      <AdminButton
                        variant="danger"
                        onClick={() =>
                          setPendingAction({
                            type: "delete",
                            id: admin.id,
                            username: admin.username,
                          })
                        }
                      >
                        Elimina
                      </AdminButton>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </AdminSection>

      {isManager ? (
        <AdminSection
          className="mt-8"
          label="Nuova utenza"
          description="La password temporanea viene generata automaticamente."
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AdminField
                label="Nome utente"
                required
                hint="Identificativo usato per l'accesso."
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="es. mario.rossi"
                  className={inputClass}
                />
              </AdminField>

              <AdminField
                label="Indirizzo email"
                required
                hint="Serve per le comunicazioni interne."
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="es. mario@azienda.it"
                  className={inputClass}
                />
              </AdminField>
            </div>

            {error && <AdminAlert tone="danger">{error}</AdminAlert>}

            <div className="flex flex-col gap-4 border-t border-line/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs font-light leading-relaxed text-ink-soft">
                Al primo accesso l&apos;utente dovrà impostare una password
                personale e configurare il token 2FA.
              </p>
              <AdminButton
                type="submit"
                disabled={loading}
                className="shrink-0"
              >
                {loading ? "Generazione..." : "Crea utente"}
              </AdminButton>
            </div>
          </form>
        </AdminSection>
      ) : (
        <AdminAlert
          className="mt-8"
          tone="neutral"
          title="Permessi insufficienti"
        >
          Solo i profili Manager possono aggiungere o modificare gli account
          dello staff.
        </AdminAlert>
      )}

      <AdminModal
        open={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        title={
          pendingAction?.type === "delete"
            ? "Eliminare l'utente?"
            : "Generare una nuova password?"
        }
        description={
          pendingAction
            ? pendingAction.type === "delete"
              ? `L'account "${pendingAction.username}" verrà rimosso definitivamente.`
              : `La password attuale di "${pendingAction.username}" verrà invalidata subito.`
            : undefined
        }
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setPendingAction(null)}
            >
              Annulla
            </AdminButton>
            <AdminButton
              variant={
                pendingAction?.type === "delete" ? "destructive" : "primary"
              }
              onClick={confirmPendingAction}
            >
              {pendingAction?.type === "delete"
                ? "Elimina utente"
                : "Genera password"}
            </AdminButton>
          </>
        }
      />
    </>
  );
}

