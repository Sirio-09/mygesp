import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-paper px-4 py-20 text-ink">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center border border-dashed border-line text-ink-soft/60">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>

        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
          Errore 404
        </p>

        <h1 className="mb-4 text-3xl font-light tracking-tight text-ink">
          Pagina non trovata.
        </h1>

        <p className="mb-10 text-sm font-light leading-relaxed text-ink-soft">
          Sembra che ci siamo persi nel bosco. La pagina che cerchi non esiste più, è stata spostata o l&apos;indirizzo è errato.
        </p>

        <Link
          href="/"
          className="group inline-flex items-center gap-3 bg-ink px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 ease-out-expo hover:bg-grass"
        >
          Torna al sentiero principale
          <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
