import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-paper-warm flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-line p-8 sm:p-10 text-center space-y-6">
        <span className="text-xs uppercase tracking-widest font-semibold text-grass-deep">
          Errore 404
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
          Pagina Non Trovata
        </h1>

        <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
          La pagina che stai cercando non esiste, è stata spostata o il link che
          hai seguito non è corretto.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 text-xs font-bold uppercase tracking-wider text-white bg-grass hover:bg-grass-deep transition-colors"
          >
            Torna alla Home
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink border border-line bg-paper-warm hover:bg-white transition-colors"
          >
            Pannello Admin
          </Link>
        </div>
      </div>
    </main>
  );
}