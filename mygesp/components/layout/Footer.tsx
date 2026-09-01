// Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-white border-t border-line/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 items-start">
          
          {/* Brand & Dati Generali */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-flex items-center text-2xl tracking-[0.1em] uppercase mb-6">
                <span className="font-light">MY</span>
                <span className="font-medium">GESP</span>
              </Link>
              <p className="text-sm font-light text-white/60 leading-relaxed max-w-[360px]">
                Abbigliamento impermeabile, stivali termici e attrezzature professionali per agricoltura e allevamento. Testati in stalla, al pascolo e nel fango.
              </p>
            </div>
            
            <div className="mt-8 text-[11px] font-light text-white/40 uppercase tracking-widest">
              <p className="text-white/60 font-medium mb-1">MyGesp di Panero Enrica</p>
              <p>P.IVA 04093030049</p>
            </div>
          </div>

          {/* Prodotti */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-6">
              Prodotti
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/categoria/abbigliamento" className="text-sm font-light text-white/80 hover:text-white transition-colors duration-300">
                  Abbigliamento
                </Link>
              </li>
              <li>
                <Link href="/categoria/stivali" className="text-sm font-light text-white/80 hover:text-white transition-colors duration-300">
                  Stivali
                </Link>
              </li>
              <li>
                <Link href="/categoria/attrezzature" className="text-sm font-light text-white/80 hover:text-white transition-colors duration-300">
                  Attrezzature
                </Link>
              </li>
            </ul>
          </div>

          {/* Assistenza & Account */}
          <div className="md:col-span-3 lg:col-span-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-6">
              Assistenza & Account
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/carrello" className="text-sm font-light text-white/80 hover:text-white transition-colors duration-300">
                  Il tuo carrello
                </Link>
              </li>
              <li>
                <Link href="/account/ordini" className="text-sm font-light text-white/80 hover:text-white transition-colors duration-300">
                  I tuoi ordini
                </Link>
              </li>
              <li>
                <Link href="/account/password-dimenticata" className="text-sm font-light text-white/80 hover:text-white transition-colors duration-300">
                  Password dimenticata
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Fascia di chiusura: Copyright & Link Legali */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-widest text-white/40 font-medium">
          <p>© {new Date().getFullYear()} MyGesp. Tutti i diritti riservati.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Link href="/termini" className="hover:text-white transition-colors duration-300">
              Termini e Condizioni
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/admin/login" className="text-white/20 hover:text-white transition-colors duration-300">
              Area tecnica
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}