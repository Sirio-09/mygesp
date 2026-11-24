"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import Link from "next/link";

export default function SuccessoPage() {
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-paper px-4 py-20 text-ink">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 animate-scale-in items-center justify-center rounded-full border border-grass-deep/30 text-grass-deep">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-grass-deep">
          Pagamento completato
        </p>

        <h1 className="mb-4 text-3xl font-light tracking-tight text-ink">
          Ordine Confermato
        </h1>

        <p className="mx-auto mb-10 max-w-[320px] text-sm font-light leading-relaxed text-ink-soft">
          Grazie per il tuo acquisto! Abbiamo ricevuto il tuo ordine e a breve riceverai un&apos;email con tutti i dettagli e il riepilogo.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/account/ordini"
            className="inline-flex items-center justify-center border border-line px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 ease-out-expo hover:border-ink"
          >
            I miei ordini
          </Link>
          <Link
            href="/prodotti"
            className="group inline-flex items-center justify-center gap-3 bg-ink px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass"
          >
            Torna allo Shop
            <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
