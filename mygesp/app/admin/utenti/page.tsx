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
    <main className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8 selection:bg-grass selection:text-white">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-line/40 pb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-grass mb-2 block">
              Sicurezza & Accessi
            </span>
            <h1 className="text-3xl font-light text-ink tracking-tight mb-2">
              Gestione Staff
            </h1>
            <p className="text-sm text-ink-soft font-light">
              Amministra gli accessi e le credenziali del personale abilitato al pannello.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-[10px] font-semibold text-ink-soft hover:text-grass uppercase tracking-widest transition-colors mb-1"
          >
            &larr; Torna alla Dashboard
          </Link>
        </div>

        {/* Box Password Temporanea Generata */}
        {tempPasswordData && (
          <div className="bg-transparent border border-line/40 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-line/40 pb-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-ink">
                Password Temporanea Generata
              </span>
              <button
                onClick={() => setTempPasswordData(null)}
                className="text-[10px] uppercase tracking-widest font-semibold text-ink-soft hover:text-ink transition-colors"
              >
                Chiudi ✕
              </button>
            </div>
            <p className="text-sm font-light text-ink-soft leading-relaxed">
              Comunica questa password a <strong className="font-medium text-ink">{tempPasswordData.username}</strong>. Al suo prossimo accesso gli verrà richiesto il cambio obbligatorio.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <code className="bg-transparent border border-line/40 px-6 py-4 font-mono text-lg font-light text-ink select-all flex-1 text-center sm:text-left">
                {tempPasswordData.tempPassword}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tempPasswordData.tempPassword);
                  alert("Password temporanea copiata negli appunti!");
                }}
                className="bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 px-8 transition-colors"
              >
                Copia
              </button>
            </div>
          </div>
        )}

        {/* Lista Staff */}
        <div className="bg-transparent border border-line/40 p-8 space-y-8">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-ink uppercase tracking-widest block">
              Membri Staff Attuali
            </span>
            <span className="text-[10px] uppercase tracking-widest text-ink-soft font-mono">
              {admins.length} {admins.length === 1 ? "Utente" : "Utenti"}
            </span>
          </div>

          {loadingAdmins ? (
            <div className="py-12 text-center text-sm font-light text-ink-soft animate-pulse">
              Caricamento utenti in corso...
            </div>
          ) : admins.length === 0 ? (
            <div className="py-12 text-center text-sm font-light text-ink-soft border border-line/40">
              Nessun utente staff trovato.
            </div>
          ) : (
            <div className="divide-y divide-line/40 border-t border-b border-line/40">
              {admins.map((admin) => (
                <div key={admin.id} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-light text-ink">{admin.username}</span>
                      {admin.isManager && (
                        <span className="text-[9px] font-semibold border border-line/40 text-ink px-2 py-0.5 uppercase tracking-widest">
                          Manager
                        </span>
                      )}
                      {admin.id === currentUserId && (
                        <span className="text-[9px] font-semibold border border-grass/40 text-grass px-2 py-0.5 uppercase tracking-widest">
                          Tu
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-light text-ink-soft">
                      <span>{admin.email}</span>
                      <span className="text-line/40">|</span>
                      <span className={admin.totpEnabled ? "text-grass" : ""}>
                        2FA {admin.totpEnabled ? "Attivo" : "Disattivo"}
                      </span>
                      {admin.mustChangePassword && (
                        <>
                          <span className="text-line/40">|</span>
                          <span className="text-ink">Psw Temporanea</span>
                        </>
                      )}
                    </div>
                  </div>

                  {isManager && (
                    <div className="flex items-center gap-4 pt-2 sm:pt-0">
                      <button
                        type="button"
                        disabled={resettingId === admin.id}
                        onClick={() => handleResetPassword(admin.id, admin.username)}
                        className="text-[10px] font-semibold text-ink-soft hover:text-ink uppercase tracking-widest transition-colors disabled:opacity-30"
                      >
                        {resettingId === admin.id ? "Generazione..." : "Reset Psw"}
                      </button>

                      {admin.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => handleDelete(admin.id, admin.username)}
                          className="text-[10px] font-semibold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
                        >
                          Elimina
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Creazione Nuovo Utente (Solo per Manager) */}
        {isManager ? (
          <div className="bg-transparent border border-line/40 p-8 space-y-8">
            <div className="border-b border-line/40 pb-6">
              <span className="text-[10px] font-semibold text-ink uppercase tracking-widest block mb-2">
                Nuova Utenza
              </span>
              <h2 className="text-xl font-light text-ink">Aggiungi membro dello staff</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-semibold tracking-widest text-ink mb-2">
                    Nome Utente *
                  </label>
                  <input
                    type="text"
                    placeholder="es. mario.rossi"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold tracking-widest text-ink mb-2">
                    Indirizzo Email *
                  </label>
                  <input
                    type="email"
                    placeholder="es. mario@azienda.it"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border border-line/40 px-4 py-3 text-sm text-ink focus:border-grass outline-none transition-colors placeholder:text-line placeholder:font-light"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-xs text-ink-soft font-light leading-relaxed flex-1">
                  Verrà generata automaticamente una password temporanea. Al primo accesso l'utente sarà obbligato a impostare una propria password personale prima di configurare il token 2FA.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-ink hover:bg-grass text-white text-[10px] font-medium uppercase tracking-widest py-4 px-8 transition-colors disabled:opacity-30 shrink-0"
                >
                  {loading ? "Generazione..." : "Crea Utente"}
                </button>
              </div>

              {error && (
                <p className="text-[10px] font-medium text-red-600 uppercase tracking-widest text-center pt-2">
                  {error}
                </p>
              )}
            </form>
          </div>
        ) : (
          <div className="p-8 bg-transparent border border-line/40 text-sm font-light text-ink-soft text-center">
            Nota: Soltanto i profili con privilegi di Manager possono aggiungere o modificare gli account dello staff.
          </div>
        )}
      </div>
    </main>
  );
}