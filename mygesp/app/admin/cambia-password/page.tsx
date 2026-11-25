"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import AdminAlert from "@/components/admin/ui/AdminAlert";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminField from "@/components/admin/ui/AdminField";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminSection from "@/components/admin/ui/AdminSection";
import { inputClass } from "@/components/admin/ui/field-styles";

export default function CambiaPasswordPage() {

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Inserisci la password attuale");
      return;
    }

    if (newPassword.length < 8) {
      setError("La password deve contenere almeno 8 caratteri");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    if (newPassword === currentPassword) {
      setError("La nuova password deve essere diversa da quella attuale");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/cambia-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore durante il cambio password");
      }

      // Il cambio password invalida la prova 2FA lato server: la sessione viene
      // chiusa e si rientra con le nuove credenziali (poi di nuovo il 2FA).
      // Così il JWT non resta valido con un `mustChangePassword` ormai vecchio.
      await signOut({ callbackUrl: "/admin/login?password=aggiornata" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Sicurezza"
        title="Cambia password"
        description="Se stai usando una password temporanea devi impostarne una nuova prima di proseguire."
      />

      <AdminSection
        className="mt-8 max-w-xl"
        label="Credenziali di accesso"
        description="Minimo 8 caratteri, diversa da quella attuale."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminField label="Password attuale" required>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Inserisci la password attuale"
              autoComplete="current-password"
              maxLength={72}
              required
              className={inputClass}
            />
          </AdminField>

          <AdminField
            label="Nuova password"
            required
            hint="Almeno 8 caratteri, diversa da quella attuale."
          >
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimo 8 caratteri"
              autoComplete="new-password"
              maxLength={72}
              required
              className={inputClass}
            />
          </AdminField>

          <AdminField label="Conferma nuova password" required>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ripeti la password"
              autoComplete="new-password"
              maxLength={72}
              required
              className={inputClass}
            />
          </AdminField>

          {error && <AdminAlert tone="danger">{error}</AdminAlert>}

          <div className="flex flex-col gap-4 border-t border-line/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-light leading-relaxed text-ink-soft">
              Al termine verrai disconnesso: rientra con la nuova password e
              rifai la verifica in due passaggi.
            </p>
            <AdminButton
              type="submit"
              disabled={loading}
              className="shrink-0"
            >
              {loading ? "Aggiornamento in corso..." : "Salva password"}
            </AdminButton>
          </div>
        </form>
      </AdminSection>
    </>
  );
}
