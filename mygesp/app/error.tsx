"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Errore catturato da error.tsx:", error);
  }, [error]);

  return (
    <main className="min-h-[80vh] bg-paper-warm/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-line rounded-2xl p-10 text-center shadow-sm space-y-6">
        <div className="w-16 h-16 bg-soil-deep/10 text-soil-deep rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-soil-deep block mb-2">
            Errore di sistema
          </span>
          <h1 className="text-2xl font-black text-ink tracking-tight">
            Qualcosa è andato storto.
          </h1>
        </div>

        <p className="text-sm text-ink-soft leading-relaxed">
          Si è verificato un problema imprevisto. I nostri sistemi lo hanno registrato, ma nel frattempo puoi riprovare.
        </p>

        {error.digest && (
          <p className="text-[10px] font-mono text-ink-soft/70 bg-paper-warm py-1.5 px-3 rounded-md border border-line inline-block">
            Ref ID: {error.digest}
          </p>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-soil-deep hover:bg-black rounded-md transition-colors"
          >
            Riprova
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-white hover:bg-paper-warm rounded-md transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}