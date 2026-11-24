"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Errore catturato da error.tsx:", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-paper px-4 py-20 text-ink">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center border border-dashed border-soil-deep/40 text-soil-deep">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-soil-deep">
          Errore di sistema
        </p>

        <h1 className="mb-4 text-2xl font-light tracking-tight text-ink">
          Qualcosa è andato storto.
        </h1>

        <p className="mb-8 text-sm font-light leading-relaxed text-ink-soft">
          Si è verificato un problema imprevisto. I nostri sistemi lo hanno registrato, ma nel frattempo puoi riprovare.
        </p>

        {error.digest && (
          <p className="mb-8 inline-block border border-line bg-paper-warm px-3 py-1.5 font-mono text-[10px] text-ink-soft">
            Ref ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center bg-ink px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-soil-deep"
          >
            Riprova
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-line px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 ease-out-expo hover:border-ink"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
