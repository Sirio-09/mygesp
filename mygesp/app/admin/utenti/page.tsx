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

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Eliminare l'utente "${username}"? L'azione non è reversibile.`)) {
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
    <main className="max-w-[600px] mx-auto px-8 py-12">
      <Link href="/admin" className="text-sm text-mud hover:text-rust mb-6 inline-block">
        ← Torna al catalogo
      </Link>
      <h1 className="font-display text-3xl uppercase text-loden-deep tracking-wide mb-8">
        Gestione utenti staff
      </h1>

      <div className="mb-10">
        <h2 className="text-sm font-medium text-loden-deep uppercase tracking-wide mb-3">
          Staff attuale
        </h2>
        <div className="border-t border-canvas-deep">
          {admins.map((admin) => (
            <div key={admin.id} className="py-3 border-b border-canvas-deep">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-loden-deep">{admin.username}</span>
                  {admin.isManager && (
                    <span className="ml-2 text-[10px] font-mono bg-loden text-canvas px-1.5 py-0.5">
                      MANAGER
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono ${admin.totpEnabled ? "text-signal" : "text-mud"}`}>
                    {admin.totpEnabled ? "2FA attivo" : "2FA non configurato"}
                  </span>
                  {isManager && (
                    <>
                      <button
                        onClick={() => setEditingId(editingId === admin.id ? null : admin.id)}
                        className="text-xs text-mud hover:text-rust underline"
                      >
                        Password
                      </button>
                      {admin.id !== currentUserId && (
                        <button
                          onClick={() => handleDelete(admin.id, admin.username)}
                          className="text-xs text-rust hover:text-rust-deep underline"
                        >
                          Elimina
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {editingId === admin.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="password"
                    placeholder="Nuova password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 border border-mud px-3 py-1.5 text-sm focus:border-rust outline-none"
                  />
                  <button
                    onClick={() => handlePasswordChange(admin.id)}
                    className="bg-rust hover:bg-rust-deep text-white text-xs font-medium px-3 py-1.5"
                  >
                    Salva
                  </button>
                </div>
              )}
              {editingId === admin.id && actionError && (
                <p className="text-rust text-xs mt-1">{actionError}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {isManager ? (
        <div>
          <h2 className="text-sm font-medium text-loden-deep uppercase tracking-wide mb-3">
            Aggiungi nuovo membro dello staff
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Nome utente"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-mud px-3 py-2 focus:border-rust outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-mud px-3 py-2 focus:border-rust outline-none"
            />
            <input
              type="password"
              placeholder="Password temporanea (min. 8 caratteri)"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-mud px-3 py-2 focus:border-rust outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-rust hover:bg-rust-deep text-white font-display uppercase tracking-wide text-sm font-semibold py-3 px-5 disabled:opacity-50"
            >
              {loading ? "Creazione in corso..." : "Crea utente"}
            </button>
            {error && <p className="text-rust text-sm">{error}</p>}
          </form>
          <p className="text-xs text-mud mt-3">
            Comunica username e password al nuovo membro dello staff. Al primo accesso dovrà configurare il proprio Google Authenticator.
          </p>
        </div>
      ) : (
        <p className="text-sm text-mud">Solo il manager può gestire lo staff.</p>
      )}
    </main>
  );
}