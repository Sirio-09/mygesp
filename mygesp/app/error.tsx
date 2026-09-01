"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log dell'errore per debugging (o invio a servizi come Sentry)
    console.error("Errore catturato da error.tsx:", error);
  }, [error]);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-line p-8 sm:p-10 text-center space-y-6">
        <span className="text-xs uppercase tracking-widest font-semibold text-soil-deep">
          Errore Inatteso
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
          Qualcosa è andato storto
        </h1>

        <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
          Si è verificato un problema imprevisto durante l&apos;elaborazione
          della richiesta. Puoi riprovare o tornare alla pagina principale.
        </p>

        {error.digest && (
          <p className="text-[10px] font-mono text-ink-soft bg-paper-warm py-1 px-2 border border-line inline-block">
            Ref ID: {error.digest}
          </p>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-5 py-3 text-xs font-bold uppercase tracking-wider text-white bg-grass hover:bg-grass-deep transition-colors cursor-pointer"
          >
            Riprova
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-paper-warm hover:bg-white transition-colors"
          >
            Torna alla Home
          </Link>
        </div>
      </div>
    </main>
  );
}