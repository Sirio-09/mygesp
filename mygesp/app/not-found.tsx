import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] bg-paper-warm/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-line rounded-2xl p-10 text-center shadow-sm space-y-6">
        <div className="w-20 h-20 text-4xl flex items-center justify-center mx-auto opacity-80 grayscale">
          🧭
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-grass-deep block mb-2">
            Errore 404
          </span>
          <h1 className="text-3xl font-black text-ink tracking-tight">
            Pagina non trovata.
          </h1>
        </div>

        <p className="text-sm text-ink-soft leading-relaxed">
          Sembra che ci siamo persi nel bosco. La pagina che cerchi non esiste più, è stata spostata o l'indirizzo è errato.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-block w-full sm:w-auto px-8 py-4 text-xs font-bold uppercase tracking-wider text-white bg-grass hover:bg-grass-deep rounded-md transition-colors shadow-md"
          >
            Torna al sentiero principale
          </Link>
        </div>
      </div>
    </main>
  );
}