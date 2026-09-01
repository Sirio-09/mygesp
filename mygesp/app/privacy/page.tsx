import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MyGesp",
  description: "Informativa sulla privacy e sul trattamento dei dati personali di MyGesp.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-12 text-ink">
      <h1 className="text-3xl font-extrabold mb-2">Privacy & Cookie Policy</h1>
      <p className="text-xs text-ink-soft mb-8">Ultimo aggiornamento: 1 Settembre 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-ink-soft">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">1. Titolare del Trattamento</h2>
          <p>
            Il Titolare del trattamento dei dati personali raccolti tramite questo sito è <strong>MyGesp di Panero Enrica</strong> (P.IVA 04093030049). Per qualsiasi chiarimento o esercizio dei diritti puoi contattarci tramite l’assistenza clienti o l’area dedicata del sito.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">2. Dati Raccolti e Finalità</h2>
          <p>Raccogliamo e trattiamo i dati personali forniti dagli utenti per le seguenti finalità:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Creazione Account e Gestione Ordini:</strong> Nome, email, indirizzo di spedizione e password (criptata) per l’evasione degli ordini.</li>
            <li><strong>Verifica Email:</strong> Invio di comunicazioni di servizio per l’attivazione dell’account tramite provider sicuri (Resend).</li>
            <li><strong>Newsletter e Comunicazioni Commerciali:</strong> Solo previo esplicito consenso fornito in fase di registrazione o iscrizione, per inviare aggiornamenti e offerte promozionali.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">3. Base Giuridica del Trattamento</h2>
          <p>
            Il trattamento è basato sull’esecuzione del contratto di acquisto, sull’adempimento di obblighi legali e fiscali, e sul consenso esplicito fornito dall’utente per le comunicazioni di marketing e newsletter.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">4. Conservazione dei Dati</h2>
          <p>
            I dati personali legati agli ordini vengono conservati per il tempo previsto dalle normative fiscali e contabili. I dati raccolti per la newsletter vengono conservati finché l’utente non richiede la cancellazione dal servizio.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">5. Diritti dell’Interessato (GDPR)</h2>
          <p>
            Ai sensi del Regolamento UE 2016/679 (GDPR), l’utente ha il diritto di accedere ai propri dati, chiederne la rettifica, la cancellazione (diritto all’oblio), la limitazione del trattamento o la revoca del consenso al marketing in qualsiasi momento.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-ink">6. Cookie</h2>
          <p>
            Questo sito utilizza esclusivamente cookie tecnici essenziali per consentire l’autenticazione, la gestione della sessione di navigazione e il corretto funzionamento del carrello acquisti.
          </p>
        </section>
      </div>
    </main>
  );
}