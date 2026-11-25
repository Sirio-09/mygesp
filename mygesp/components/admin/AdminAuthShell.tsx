import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "./ui/icons";

/**
 * Cornice minimale delle schermate di accesso (login, 2FA, recupero codice):
 * solo brand, uscita verso il sito pubblico e una card centrata.
 * Nessuna navigazione: durante l'autenticazione non ci sono link da offrire.
 */

export default function AdminAuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <Link
          href="/"
          className="flex items-center text-xl uppercase tracking-[0.1em] text-ink transition-opacity duration-300 hover:opacity-70 sm:text-2xl"
        >
          <span className="font-light">MY</span>
          <span className="font-medium">GESP</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-300 hover:text-ink"
        >
          mygesp.it
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:items-center">
        <div className="w-full max-w-md border border-line bg-paper p-8 sm:p-10">
          {children}
        </div>
      </main>

      <div className="container-page pb-8">
        <p className="text-[10px] font-light uppercase tracking-[0.2em] text-ink-soft">
          Area tecnica &middot; accesso riservato
        </p>
      </div>
    </div>
  );
}
