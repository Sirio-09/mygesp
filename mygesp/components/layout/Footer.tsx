import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper-warm border-t border-white/5">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          
          {/* Brand & Dati Generali */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="text-white text-2xl font-extrabold tracking-tight mb-3">
                MY<span className="text-grass">GESP</span>
              </h2>
              <p className="text-sm text-paper-warm/70 leading-relaxed max-w-[360px]">
                Abbigliamento impermeabile, stivali termici e attrezzature professionali per agricoltura e allevamento. Testati in stalla, al pascolo e nel fango.
              </p>
            </div>
            
            <div className="mt-6 text-xs text-paper-warm/50">
              <p className="font-semibold text-paper-warm/70">MyGesp di Panero Enrica</p>
              <p>P.IVA 04093030049</p>
            </div>
          </div>

          {/* Prodotti */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2 inline-block">
              Prodotti
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/categoria/abbigliamento" className="text-sm text-paper-warm/70 hover:text-white transition-colors">
                  Abbigliamento
                </Link>
              </li>
              <li>
                <Link href="/categoria/stivali" className="text-sm text-paper-warm/70 hover:text-white transition-colors">
                  Stivali
                </Link>
              </li>
              <li>
                <Link href="/categoria/attrezzature" className="text-sm text-paper-warm/70 hover:text-white transition-colors">
                  Attrezzature
                </Link>
              </li>
            </ul>
          </div>

          {/* Assistenza & Account */}
          <div className="md:col-span-3 lg:col-span-4">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2 inline-block">
              Assistenza & Account
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/carrello" className="text-sm text-paper-warm/70 hover:text-white transition-colors">
                  Il tuo carrello
                </Link>
              </li>
              <li>
                <Link href="/account/ordini" className="text-sm text-paper-warm/70 hover:text-white transition-colors">
                  I tuoi ordini
                </Link>
              </li>
              <li>
                <Link href="/account/password-dimenticata" className="text-sm text-paper-warm/70 hover:text-white transition-colors">
                  Password dimenticata
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Fascia di chiusura: Copyright & Link Legali */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-paper-warm/50">
          <p>© 2026 MyGesp. Tutti i diritti riservati.</p>
          
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/termini" className="hover:text-paper-warm transition-colors">
              Termini e Condizioni
            </Link>
            <Link href="/privacy" className="hover:text-paper-warm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/admin/login" className="text-paper-warm/30 hover:text-paper-warm transition-colors">
              Area tecnica
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}