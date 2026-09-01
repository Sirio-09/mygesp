import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini e Condizioni — MyGesp",
  description: "Condizioni generali di vendita e termini di servizio di MyGesp.",
};

export default function TerminiPage() {
  return (
    <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-12 text-ink">
      <h1 className="text-3xl font-extrabold mb-2">Termini e Condizioni di Vendita</h1>
      <p className="text-xs text-ink-soft mb-8">Ultimo aggiornamento: 1 Settembre 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-ink-soft">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">1. Informazioni Generali</h2>
          <p>
            Il presente sito web (MyGesp) è gestito da <strong>MyGesp di Panero Enrica</strong>, con sede in Italia, P.IVA 04093030049. L’acquisto di prodotti sul nostro store è regolato dalle presenti Condizioni Generali di Vendita in conformità al Codice del Consumo (D.Lgs. 206/2005).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">2. Ordini e Prodotti</h2>
          <p>
            Tutti gli ordini inviati tramite il sito sono soggetti ad accettazione. Ci riserviamo il diritto di rifiutare o annullare un ordine in caso di indisponibilità del prodotto o problemi con il pagamento. Le immagini dei prodotti (abbigliamento e attrezzature) hanno scopo illustrativo.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">3. Prezzi e Pagamenti</h2>
          <p>
            Tutti i prezzi indicati sul sito sono espressi in Euro (€) ed includono l’IVA di legge. I pagamenti avvengono in modo sicuro tramite i gateway integrati (Stripe / Carte di credito). L’importo verrà addebitato al momento della conferma dell’ordine.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">4. Spedizioni e Consegna</h2>
          <p>
            Spediamo i prodotti in tutta Italia tramite corriere espresso. I tempi di consegna stimati sono solitamente compresi tra 24 e 72 ore lavorative dalla presa in carico del pacco. MyGesp non è responsabile per eventuali ritardi imputabili al corriere.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">5. Diritto di Recesso (Resi)</h2>
          <p>
            Ai sensi dell’art. 52 del Codice del Consumo, il cliente ha diritto di recedere dal contratto entro **14 giorni** dalla ricezione della merce. Il prodotto deve essere restituito integro, non utilizzato, privo di danni e nella confezione originale. Le spese di spedizione per il reso sono a carico dell’acquirente salvo diversa indicazione.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">6. Garanzia Legale</h2>
          <p>
            Tutti i prodotti venduti sono coperti dalla Garanzia Legale di Conformità di 24 mesi per i difetti di fabbrica non derivanti da un uso improprio o da normale usura dei materiali.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">7. Legge Applicabile</h2>
          <p>
            Le presenti condizioni sono regolate dalla legge italiana. Per qualsiasi controversia il foro competente è quello previsto dalla legislazione vigente a tutela del consumatore.
          </p>
        </section>
      </div>
    </main>
  );
}