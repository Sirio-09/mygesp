"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  totpEnabled: boolean;
  isManager: boolean;
  mustChangePassword?: boolean;
};

export default function UtentiAdminPage() {
  const { data: session } = useSession();
  const isManager = (session?.user as { isManager?: boolean })?.isManager;
  const currentUserId = (session?.user as { id?: string })?.id;

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Form stato nuova utenza
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Stato visualizzazione password temporanea generata
  const [tempPasswordData, setTempPasswordData] = useState<{
    username: string;
    tempPassword: string;
  } | null>(null);

  const [resettingId, setResettingId] = useState<string | null>(null);

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
          tempPassword: data.tempPassword,
        });
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

  const handleResetPassword = async (id: string, targetUsername: string) => {
    if (!confirm(`Generare una nuova password temporanea per "${targetUsername}"?`)) {
      return;
    }

    try {
      setResettingId(id);
      const res = await fetch(`/api/admin/utenti/${id}/reset-password`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setTempPasswordData({
          username: targetUsername,
          tempPassword: data.tempPassword,
        });
        await loadAdmins();
      } else {
        alert(data.error || "Errore durante il reset della password.");
      }
    } catch {
      alert("Errore di rete durante il reset della password.");
    } finally {
      setResettingId(null);
    }
  };

  const handleDelete = async (id: string, targetUsername: string) => {
    if (!confirm(`Eliminare l'utente "${targetUsername}"? L'azione non è reversibile.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/utenti/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadAdmins();
      } else {
        const data = await res.json();
        alert(data.error || "Errore durante l'eliminazione.");
      }
    } catch {
      alert("Si è verificato un errore durante l'eliminazione.");
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
              Sicurezza & Accessi
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Gestione Utenti Staff
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              Amministra gli accessi e le credenziali del personale abilitato al pannello.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm transition-colors w-fit"
          >
            ← Torna al catalogo
          </Link>
        </div>

        {/* Box Password Temporanea Generata */}
        {tempPasswordData && (
          <div className="bg-amber-50 border border-amber-300 p-5 rounded-none space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Password Temporanea Generata
              </span>
              <button
                onClick={() => setTempPasswordData(null)}
                className="text-xs text-amber-800 hover:underline font-mono"
              >
                [Chiudi]
              </button>
            </div>
            <p className="text-xs text-amber-800">
              Comunica questa password a <strong>{tempPasswordData.username}</strong>. Al suo prossimo accesso gli verrà richiesto il cambio obbligatorio.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <code className="bg-white border border-amber-300 px-4 py-2 font-mono text-base font-bold text-amber-900 select-all">
                {tempPasswordData.tempPassword}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tempPasswordData.tempPassword);
                  alert("Password temporanea copiata negli appunti!");
                }}
                className="bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider px-4 py-2 transition-colors"
              >
                Copia
              </button>
            </div>
          </div>
        )}

        {/* Lista Staff */}
        <div className="bg-white border border-line p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="block text-xs font-bold text-grass-deep uppercase tracking-wider">
              Membri Staff Attuali
            </span>
            <span className="text-xs text-ink-soft font-mono">
              {admins.length} {admins.length === 1 ? "utente" : "utenti"}
            </span>
          </div>

          {loadingAdmins ? (
            <div className="py-8 text-center text-xs text-ink-soft font-mono">
              Caricamento utenti in corso...
            </div>
          ) : admins.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-soft border border-dashed border-line">
              Nessun utente staff trovato.
            </div>
          ) : (
            <div className="divide-y divide-line border-t border-b border-line">
              {admins.map((admin) => (
                <div key={admin.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-ink">{admin.username}</span>
                      <span className="text-xs text-ink-soft font-mono">({admin.email})</span>

                      {admin.isManager && (
                        <span className="text-[10px] font-mono font-bold bg-ink text-white px-2 py-0.5 uppercase tracking-wider">
                          Manager
                        </span>
                      )}

                      {admin.mustChangePassword && (
                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 uppercase tracking-wider">
                          Password Temporanea
                        </span>
                      )}

                      {admin.id === currentUserId && (
                        <span className="text-[10px] font-mono font-bold bg-grass-deep/10 text-grass-deep border border-grass-deep/30 px-2 py-0.5 uppercase tracking-wider">
                          Tu
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 border ${
                          admin.totpEnabled
                            ? "border-grass-deep/30 bg-grass-deep/10 text-grass-deep"
                            : "border-line bg-paper-warm text-ink-soft"
                        }`}
                      >
                        {admin.totpEnabled ? "2FA Attivo" : "2FA Disattivo"}
                      </span>

                      {isManager && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={resettingId === admin.id}
                            onClick={() => handleResetPassword(admin.id, admin.username)}
                            className="text-xs font-semibold text-ink-soft hover:text-grass-deep underline transition-colors disabled:opacity-50"
                          >
                            {resettingId === admin.id ? "Generazione..." : "Reset Password"}
                          </button>

                          {admin.id !== currentUserId && (
                            <button
                              type="button"
                              onClick={() => handleDelete(admin.id, admin.username)}
                              className="text-xs font-semibold text-soil-deep hover:underline transition-colors"
                            >
                              Elimina
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Creazione Nuovo Utente (Solo per Manager) */}
        {isManager ? (
          <div className="bg-white border border-line p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <span className="block text-xs font-bold text-grass-deep uppercase tracking-wider">
                Nuova Utenza
              </span>
              <h2 className="text-lg font-bold text-ink">Aggiungi membro dello staff</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                    Nome Utente *
                  </label>
                  <input
                    type="text"
                    placeholder="es. mario.rossi"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                    Indirizzo Email *
                  </label>
                  <input
                    type="email"
                    placeholder="es. mario@azienda.it"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm uppercase tracking-wider py-3.5 transition-colors disabled:opacity-50"
              >
                {loading ? "Generazione in corso..." : "Crea Utente Staff"}
              </button>

              {error && (
                <p className="text-xs text-soil-deep font-bold text-center pt-1">{error}</p>
              )}
            </form>

            <p className="text-xs text-ink-soft leading-relaxed border-t border-line pt-4">
              Verrà generata automaticamente una password temporanea. Al primo accesso l'utente sarà obbligato a impostare una propria password personale prima di configurare il token 2FA.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-paper-warm border border-line text-xs text-ink-soft">
            Nota: Soltanto i profili con privilegi di Manager possono aggiungere o modificare gli account dello staff.
          </div>
        )}
      </div>
    </main>
  );
}