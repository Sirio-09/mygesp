import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MyGesp",
  description: "Informativa sulla privacy e sul trattamento dei dati personali di MyGesp.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper-warm/10 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-line rounded-2xl p-8 sm:p-12 shadow-sm">
        <header className="border-b border-line pb-8 mb-8">
          <p className="text-xs font-bold text-grass-deep uppercase tracking-widest mb-3">Legale</p>
          <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mb-2">
            Privacy & Cookie Policy
          </h1>
          <p className="text-sm text-ink-soft italic">Ultimo aggiornamento: 1 Settembre 2026</p>
        </header>

        <div className="space-y-10 text-sm leading-relaxed text-ink-soft">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">1</span>
              Titolare del Trattamento
            </h2>
            <p className="pl-11">
              Il Titolare del trattamento dei dati personali raccolti tramite questo sito è <strong className="text-ink">MyGesp di Panero Enrica</strong> (P.IVA 04093030049). Per qualsiasi chiarimento o esercizio dei diritti puoi contattarci tramite l’assistenza clienti o l’area dedicata del sito.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">2</span>
              Dati Raccolti e Finalità
            </h2>
            <p className="pl-11">Raccogliamo e trattiamo i dati personali forniti dagli utenti per le seguenti finalità:</p>
            <ul className="list-disc pl-16 space-y-2 marker:text-grass-deep">
              <li><strong className="text-ink">Creazione Account e Gestione Ordini:</strong> Nome, email, indirizzo di spedizione e password (criptata) per l’evasione degli ordini.</li>
              <li><strong className="text-ink">Verifica Email:</strong> Invio di comunicazioni di servizio per l’attivazione dell’account tramite provider sicuri (Resend).</li>
              <li><strong className="text-ink">Newsletter e Comunicazioni Commerciali:</strong> Solo previo esplicito consenso fornito in fase di registrazione o iscrizione, per inviare aggiornamenti e offerte promozionali.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">3</span>
              Base Giuridica del Trattamento
            </h2>
            <p className="pl-11">
              Il trattamento è basato sull’esecuzione del contratto di acquisto, sull’adempimento di obblighi legali e fiscali, e sul consenso esplicito fornito dall’utente per le comunicazioni di marketing e newsletter.
            </p>
          </section>

          {/* Le altre sezioni mantengono la stessa struttura pl-11 (padding left) */}
          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">4</span>
              Conservazione dei Dati
            </h2>
            <p className="pl-11">
              I dati personali legati agli ordini vengono conservati per il tempo previsto dalle normative fiscali e contabili. I dati raccolti per la newsletter vengono conservati finché l’utente non richiede la cancellazione dal servizio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">5</span>
              Diritti dell’Interessato (GDPR)
            </h2>
            <p className="pl-11">
              Ai sensi del Regolamento UE 2016/679 (GDPR), l’utente ha il diritto di accedere ai propri dati, chiederne la rettifica, la cancellazione (diritto all’oblio), la limitazione del trattamento o la revoca del consenso al marketing in qualsiasi momento.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-ink flex items-center gap-3">
              <span className="text-grass-deep bg-grass/10 w-8 h-8 flex items-center justify-center rounded-full text-xs">6</span>
              Cookie
            </h2>
            <p className="pl-11">
              Questo sito utilizza esclusivamente cookie tecnici essenziali per consentire l’autenticazione, la gestione della sessione di navigazione e il corretto funzionamento del carrello acquisti.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}