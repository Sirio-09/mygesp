"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  totpEnabled: boolean;
  isManager: boolean;
};

export default function UtentiAdminPage() {
  const { data: session } = useSession();
  const isManager = (session?.user as { isManager?: boolean })?.isManager;
  const currentUserId = (session?.user as { id?: string })?.id;

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [actionError, setActionError] = useState("");

  const loadAdmins = async () => {
    const res = await fetch("/api/admin/utenti");
    const data = await res.json();
    setAdmins(data);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/utenti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    setLoading(false);

    if (res.ok) {
      setUsername("");
      setEmail("");
      setPassword("");
      loadAdmins();
    } else {
      const data = await res.json();
      setError(data.error || "Errore durante la creazione");
    }
  };

  const handlePasswordChange = async (id: string) => {
    setActionError("");
    if (newPassword.length < 8) {
      setActionError("La password deve avere almeno 8 caratteri");
      return;
    }
    const res = await fetch(`/api/admin/utenti/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    if (res.ok) {
      setEditingId(null);
      setNewPassword("");
    } else {
      const data = await res.json();
      setActionError(data.error || "Errore durante l'aggiornamento");
    }
  };

  const handleDelete = async (id: string, targetUsername: string) => {
    if (!confirm(`Eliminare l'utente "${targetUsername}"? L'azione non è reversibile.`)) {
      return;
    }
    const res = await fetch(`/api/admin/utenti/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadAdmins();
    } else {
      const data = await res.json();
      alert(data.error || "Errore durante l'eliminazione");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <Link
          href="/admin"
          className="text-xs uppercase tracking-wider font-semibold text-ink-soft hover:text-grass-deep transition-colors inline-block mb-4"
        >
          ← Torna al catalogo
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
          Gestione Utenti Staff
        </h1>
        <p className="text-xs sm:text-sm text-ink-soft mt-1">
          Amministra gli accessi e le credenziali del personale abilitato al pannello.
        </p>
      </div>

      {/* Lista Staff */}
      <div className="bg-white border border-line p-6 sm:p-8 space-y-4">
        <span className="block text-xs font-bold text-grass-deep uppercase tracking-wider">
          Membri Staff Attuali
        </span>

        <div className="divide-y divide-line border-t border-b border-line">
          {admins.map((admin) => (
            <div key={admin.id} className="py-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink">{admin.username}</span>
                  <span className="text-xs text-ink-soft font-mono">({admin.email})</span>
                  {admin.isManager && (
                    <span className="text-[10px] font-mono font-bold bg-ink text-white px-2 py-0.5 uppercase tracking-wider">
                      Manager
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(editingId === admin.id ? null : admin.id);
                          setActionError("");
                        }}
                        className="text-xs font-semibold text-ink-soft hover:text-grass-deep underline transition-colors"
                      >
                        {editingId === admin.id ? "Annulla" : "Password"}
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

              {/* Form Cambio Password Inline */}
              {editingId === admin.id && (
                <div className="p-4 bg-paper-warm border border-line space-y-2">
                  <span className="text-xs font-semibold text-ink uppercase tracking-wider block">
                    Nuova password per {admin.username}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Minimo 8 caratteri"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 border border-line px-3 py-2 text-sm text-ink bg-white focus:border-grass-deep outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handlePasswordChange(admin.id)}
                      className="bg-grass hover:bg-grass-deep text-white text-xs font-bold uppercase tracking-wider px-4 py-2 transition-colors"
                    >
                      Salva
                    </button>
                  </div>
                  {actionError && (
                    <p className="text-xs text-soil-deep font-bold pt-1">{actionError}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
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

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                Password Temporanea *
              </label>
              <input
                type="password"
                placeholder="Minimo 8 caratteri"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line px-3.5 py-2.5 text-sm text-ink focus:border-grass-deep outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-grass hover:bg-grass-deep text-white font-bold text-sm uppercase tracking-wider py-3.5 transition-colors disabled:opacity-50"
            >
              {loading ? "Creazione in corso..." : "Crea Utente Staff"}
            </button>

            {error && (
              <p className="text-xs text-soil-deep font-bold text-center pt-1">{error}</p>
            )}
          </form>

          <p className="text-xs text-ink-soft leading-relaxed border-t border-line pt-4">
            Comunica le credenziali al nuovo utente. Al primo accesso gli verrà richiesto di configurare il proprio token 2FA tramite Google Authenticator.
          </p>
        </div>
      ) : (
        <div className="p-4 bg-paper-warm border border-line text-xs text-ink-soft">
          Nota: Soltanto i profili con privilegi di Manager possono aggiungere o modificare gli account dello staff.
        </div>
      )}
    </div>
  );
}