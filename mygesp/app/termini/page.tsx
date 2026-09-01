import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini e Condizioni — MyGesp",
  description: "Condizioni generali di vendita e termini di servizio di MyGesp.",
};

export default function TerminiPage() {
  return (
    <main className="min-h-screen bg-paper-warm/10 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-line rounded-2xl p-8 sm:p-12 shadow-sm">
        <header className="border-b border-line pb-8 mb-8">
          <p className="text-xs font-bold text-grass-deep uppercase tracking-widest mb-3">Legale</p>
          <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mb-2">
            Termini e Condizioni di Vendita
          </h1>
          <p className="text-sm text-ink-soft italic">Ultimo aggiornamento: 1 Settembre 2026</p>
        </header>

        <div className="space-y-10 text-sm leading-relaxed text-ink-soft">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">1</span>
              Informazioni Generali
            </h2>
            <p className="pl-11">
              Il presente sito web (MyGesp) è gestito da <strong className="text-ink">MyGesp di Panero Enrica</strong>, con sede in Italia, P.IVA 04093030049. L’acquisto di prodotti sul nostro store è regolato dalle presenti Condizioni Generali di Vendita in conformità al Codice del Consumo (D.Lgs. 206/2005).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">2</span>
              Ordini e Prodotti
            </h2>
            <p className="pl-11">
              Tutti gli ordini inviati tramite il sito sono soggetti ad accettazione. Ci riserviamo il diritto di rifiutare o annullare un ordine in caso di indisponibilità del prodotto o problemi con il pagamento. Le immagini dei prodotti hanno scopo illustrativo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">3</span>
              Prezzi e Pagamenti
            </h2>
            <p className="pl-11">
              Tutti i prezzi indicati sul sito sono espressi in Euro (€) ed includono l’IVA di legge. I pagamenti avvengono in modo sicuro tramite i gateway integrati (Stripe / Carte di credito). L’importo verrà addebitato al momento della conferma dell’ordine.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">4</span>
              Spedizioni e Consegna
            </h2>
            <p className="pl-11">
              Spediamo i prodotti in tutta Italia tramite corriere espresso. I tempi di consegna stimati sono solitamente compresi tra 24 e 72 ore lavorative dalla presa in carico del pacco. MyGesp non è responsabile per eventuali ritardi imputabili al corriere.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">5</span>
              Diritto di Recesso (Resi)
            </h2>
            <p className="pl-11">
              Ai sensi dell’art. 52 del Codice del Consumo, il cliente ha diritto di recedere dal contratto entro <strong className="text-ink">14 giorni</strong> dalla ricezione della merce. Il prodotto deve essere restituito integro, non utilizzato, privo di danni e nella confezione originale. Le spese di reso sono a carico dell’acquirente.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}