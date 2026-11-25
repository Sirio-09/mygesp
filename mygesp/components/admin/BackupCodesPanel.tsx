"use client";

import { useState } from "react";
import AdminAlert from "./ui/AdminAlert";
import AdminButton from "./ui/AdminButton";

/**
 * Elenco dei codici di recupero mostrato una sola volta dopo la generazione.
 *
 * Vive fuori dalle pagine perché serve sia al setup forzato (/admin/2fa-setup)
 * sia alla pagina Account: stesse classi, stesso testo di copia/download.
 */

export default function BackupCodesPanel({
  codes,
  title = "Codici di recupero",
  description = "Salvali in un posto sicuro: servono per rientrare se perdi il dispositivo. Non verranno mostrati di nuovo.",
  className = "",
}: {
  codes: string[];
  title?: string;
  description?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ tone: "danger" | "success"; text: string } | null>(
    null
  );

  if (codes.length === 0) return null;

  const copyAll = async () => {
    const payload = "CODICI DI RECUPERO 2FA - MYGESP\n\n" + codes.join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setMessage(null);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage({
        tone: "danger",
        text: "Copia non riuscita: seleziona i codici manualmente o scarica il file.",
      });
    }
  };

  const download = () => {
    const content =
      "CODICI DI RECUPERO 2FA - MYGESP\nConserva questi codici in un luogo sicuro.\n\n" +
      codes.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mygesp-backup-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
    setMessage({ tone: "success", text: "File dei codici scaricato." });
  };

  return (
    <section className={`border border-line bg-paper ${className}`.trim()}>
      <div className="border-b border-line/60 px-5 py-4 sm:px-6">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
          {title}
        </h2>
        <p className="mt-1 text-xs font-light leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-5 sm:p-6">
        {codes.map((code) => (
          <code
            key={code}
            className="border border-line bg-paper-warm/30 py-1.5 text-center font-mono text-xs tabular-nums tracking-[0.1em] text-ink"
          >
            {code}
          </code>
        ))}
      </div>

      {message && (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <AdminAlert tone={message.tone}>{message.text}</AdminAlert>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-line/60 p-5 sm:flex-row sm:p-6">
        <AdminButton variant="secondary" onClick={copyAll} className="flex-1">
          {copied ? "Copiati" : "Copia tutti"}
        </AdminButton>
        <AdminButton variant="secondary" onClick={download} className="flex-1">
          Scarica .txt
        </AdminButton>
      </div>
    </section>
  );
}
